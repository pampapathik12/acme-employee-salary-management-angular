import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeRequest, EmployeeResponse, buildEmployeeRequest } from '../../../../core/models/employee.model';
import { errorMessage, toIsoDate } from '../../../../core/utils/form.utils';
import { AttendanceService } from '../../services/attendance';

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

  readonly records = signal<EmployeeResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add attendance' : 'Edit attendance'));

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly form = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: [''],
    phone: [''],
    department: [''],
    designation: [''],
    salary: [null as number | null],
    joiningDate: [null as Date | null],
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

  openEdit(row: EmployeeResponse): void {
    this.editingId.set(row.id);
    this.form.reset({
      firstName: row.firstName ?? '',
      lastName: row.lastName ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      department: row.department ?? '',
      designation: row.designation ?? '',
      salary: row.salary,
      joiningDate: row.joiningDate ? new Date(row.joiningDate) : null,
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    const value = this.form.getRawValue();
    const body: EmployeeRequest = buildEmployeeRequest({
      ...value,
      joiningDate: toIsoDate(value.joiningDate),
    });
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

  confirmDelete(row: EmployeeResponse): void {
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
