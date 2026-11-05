import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorMessage } from '../../../../core/utils/form.utils';
import { SalaryResponse, SalaryService } from '../../services/salary';

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

  readonly salaries = signal<SalaryResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  private editingComponentId: number | null = null;
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add salary' : 'Edit salary'));

  readonly employeeFilter = this.fb.control<number | null>(null);

  readonly form = this.fb.group({
    employeeId: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[0-9]+$/),
    ]),
    salary: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
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
    this.editingComponentId = null;
    this.form.reset({ employeeId: null, salary: null });
    this.dialogVisible.set(true);
  }

  openEdit(row: SalaryResponse): void {
    this.editingId.set(row.id);
    this.editingComponentId = row.relatedTypeId;
    this.form.reset({ employeeId: row.employeeId, salary: row.salary });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { employeeId, salary } = this.form.getRawValue();
    if (employeeId === null || salary === null) return;
    const payload = {
      employeeId,
      salary,
      ...(this.editingComponentId !== null ? { salaryComponentId: this.editingComponentId } : {}),
    };
    const id = this.editingId();
    const request$ = id === null ? this.salaryService.create(payload) : this.salaryService.update(id, payload);

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

  confirmDelete(row: SalaryResponse): void {
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
