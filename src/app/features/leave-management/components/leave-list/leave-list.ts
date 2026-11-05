import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Auth } from '../../../../core/auth/services/auth';
import { EmployeeRequest, EmployeeResponse, buildEmployeeRequest } from '../../../../core/models/employee.model';
import { errorMessage, toIsoDate } from '../../../../core/utils/form.utils';
import { LeaveService } from '../../services/leave';

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

  readonly leaves = signal<EmployeeResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add leave' : 'Edit leave'));

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

  approve(row: EmployeeResponse): void {
    this.decide(row, 'approve');
  }

  reject(row: EmployeeResponse): void {
    this.decide(row, 'reject');
  }

  confirmDelete(row: EmployeeResponse): void {
    this.confirmation.confirm({
      header: 'Delete leave',
      message: `Delete leave record #${row.id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(row.id),
    });
  }

  private decide(row: EmployeeResponse, action: 'approve' | 'reject'): void {
    const approvedBy = this.auth.userId;
    if (approvedBy === null) {
      this.messages.add({
        severity: 'error',
        summary: 'Missing user id',
        detail: 'Your login response has no user id, so the approver cannot be recorded.',
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
