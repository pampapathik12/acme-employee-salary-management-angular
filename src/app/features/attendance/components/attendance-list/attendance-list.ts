import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorMessage } from '../../../../core/utils/form.utils';
import { AttendanceRequest, AttendanceResponse, AttendanceService } from '../../services/attendance';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.html',
})
export class AttendanceList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly records = signal<AttendanceResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add attendance' : 'Edit attendance'));

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    employeeId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
    attendanceDate: ['', Validators.required],
    checkIn: ['', [Validators.required, Validators.pattern(/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)]],
    checkOut: ['', [Validators.required, Validators.pattern(/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)]],
    status: ['PRESENT', [Validators.required, Validators.pattern(/\S/)]],
  });

  ngOnInit(): void {
    this.load();
    this.employeeFilter.valueChanges.subscribe(() => this.load());
  }

  load(): void {
    const employeeId = this.employeeFilter.value;
    const request$ =
      employeeId === null ? this.attendanceService.list() : this.attendanceService.listForEmployee(employeeId);

    this.loading.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (rows) => {
        this.records.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load attendance.'));
        this.loading.set(false);
      },
    });
  }

  clearFilter(): void {
    this.employeeFilter.setValue(null);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  openEdit(row: AttendanceResponse): void {
    this.editingId.set(row.id);
    this.form.reset({
      employeeId: row.employeeId,
      attendanceDate: row.attendanceDate,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      status: row.status,
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const body: AttendanceRequest = {
      ...value,
      checkIn: value.checkIn.length === 5 ? `${value.checkIn}:00` : value.checkIn,
      checkOut: value.checkOut.length === 5 ? `${value.checkOut}:00` : value.checkOut,
      status: value.status.trim(),
    };
    const id = this.editingId();
    const request$ = id === null ? this.attendanceService.create(body) : this.attendanceService.update(id, body);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Attendance saved.' });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not save attendance.') });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(row: AttendanceResponse): void {
    this.confirmation.confirm({
      header: 'Delete attendance',
      message: `Delete attendance record #${row.id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(row.id),
    });
  }

  private delete(id: number): void {
    this.attendanceService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Attendance deleted.' });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Delete failed.') }),
    });
  }
}
