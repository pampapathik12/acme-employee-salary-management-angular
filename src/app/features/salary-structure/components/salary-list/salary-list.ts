import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeResponse } from '../../../../core/models/employee.model';
import { errorMessage } from '../../../../core/utils/form.utils';
import { SalaryService } from '../../services/salary';

@Component({
  selector: 'app-salary-list',
  standalone: false,
  templateUrl: './salary-list.html',
})
export class SalaryList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly salaryService = inject(SalaryService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly salaries = signal<EmployeeResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add salary' : 'Edit salary'));

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    salary: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.load();
    this.employeeFilter.valueChanges.subscribe(() => this.load());
  }

  load(): void {
    const employeeId = this.employeeFilter.value;
    const request$ =
      employeeId === null ? this.salaryService.list() : this.salaryService.listForEmployee(employeeId);

    this.loading.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (rows) => {
        this.salaries.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load salaries.'));
        this.loading.set(false);
      },
    });
  }

  clearFilter(): void {
    this.employeeFilter.setValue(null);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ salary: 0 });
    this.dialogVisible.set(true);
  }

  openEdit(row: EmployeeResponse): void {
    this.editingId.set(row.id);
    this.form.reset({ salary: row.salary ?? 0 });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const amount = this.form.getRawValue().salary;
    const id = this.editingId();
    const request$ = id === null ? this.salaryService.create(amount) : this.salaryService.update(id, amount);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Salary saved.' });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not save salary.') });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(row: EmployeeResponse): void {
    this.confirmation.confirm({
      header: 'Delete salary',
      message: `Delete salary record #${row.id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(row.id),
    });
  }

  private delete(id: number): void {
    this.salaryService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Salary deleted.' });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Delete failed.') }),
    });
  }
}
