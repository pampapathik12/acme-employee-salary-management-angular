import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Auth } from '../../../../core/auth/services/auth';
import { errorMessage } from '../../../../core/utils/form.utils';
import { LeaveRequest, LeaveResponse, LeaveService } from '../../services/leave';

@Component({
  selector: 'app-leave-list',
  standalone: false,
  templateUrl: './leave-list.html',
})
export class LeaveList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly leaveService = inject(LeaveService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  readonly auth = inject(Auth);

  readonly leaves = signal<LeaveResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add leave' : 'Edit leave'));

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly approverId = this.fb.control<number | null>(null, [
    Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/),
  ]);

  readonly form = this.fb.nonNullable.group({
    employeeId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
    leaveType: [''],
    leaveTypeId: this.fb.control<number | null>(null, [Validators.min(1), Validators.pattern(/^[0-9]+$/)]),
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.pattern(/\S/)]],
  }, {
    validators: [
      (control) => control.get('leaveType')?.value?.trim() || control.get('leaveTypeId')?.value
        ? null : { leaveTypeRequired: true },
      (control) => {
        const startDate = control.get('startDate')?.value;
        const endDate = control.get('endDate')?.value;
        return startDate && endDate && endDate < startDate ? { dateRange: true } : null;
      },
    ],
  });

  ngOnInit(): void {
    this.load();
    this.employeeFilter.valueChanges.subscribe(() => this.load());
  }

  load(): void {
    const employeeId = this.employeeFilter.value;
    const request$ =
      employeeId === null ? this.leaveService.list() : this.leaveService.listForEmployee(employeeId);

    this.loading.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (rows) => {
        this.leaves.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load leave requests.'));
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

  openEdit(row: LeaveResponse): void {
    this.editingId.set(row.id);
    this.form.reset({
      employeeId: row.employeeId,
      leaveType: '',
      leaveTypeId: row.relatedTypeId,
      startDate: row.startDate,
      endDate: row.endDate,
      reason: row.reason,
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
    const body: LeaveRequest = {
      employeeId: value.employeeId,
      ...(value.leaveType.trim() ? { leaveType: value.leaveType.trim() } : { leaveTypeId: value.leaveTypeId! }),
      startDate: value.startDate,
      endDate: value.endDate,
      reason: value.reason.trim(),
    };
    const id = this.editingId();
    const request$ = id === null ? this.leaveService.create(body) : this.leaveService.update(id, body);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Leave saved.' });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not save leave.') });
        this.saving.set(false);
      },
    });
  }

  approve(row: LeaveResponse): void {
    this.decide(row, 'approve');
  }

  reject(row: LeaveResponse): void {
    this.decide(row, 'reject');
  }

  confirmDelete(row: LeaveResponse): void {
    this.confirmation.confirm({
      header: 'Delete leave',
      message: `Delete leave record #${row.id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(row.id),
    });
  }

  private decide(row: LeaveResponse, action: 'approve' | 'reject'): void {
    const approvedBy = this.auth.userId ?? this.approverId.value;
    if (approvedBy === null || !Number.isInteger(approvedBy) || approvedBy < 1) {
      this.approverId.markAsTouched();
      this.messages.add({
        severity: 'error',
        summary: 'Approver required',
        detail: 'Enter a valid approver ID.',
      });
      return;
    }
    const request$ =
      action === 'approve'
        ? this.leaveService.approve(row.id, approvedBy)
        : this.leaveService.reject(row.id, approvedBy);

    request$.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: action === 'approve' ? 'Approved' : 'Rejected',
          detail: `Leave #${row.id} ${action === 'approve' ? 'approved' : 'rejected'}.`,
        });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, `Could not ${action} leave.`) }),
    });
  }

  private delete(id: number): void {
    this.leaveService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Leave deleted.' });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Delete failed.') }),
    });
  }
}
