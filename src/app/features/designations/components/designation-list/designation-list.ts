import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeResponse } from '../../../../core/models/employee.model';
import { errorMessage } from '../../../../core/utils/form.utils';
import { DesignationService } from '../../services/designation';

@Component({
  selector: 'app-designation-list',
  standalone: false,
  templateUrl: './designation-list.html',
})
export class DesignationList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly designationService = inject(DesignationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly designations = signal<EmployeeResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add designation' : 'Edit designation'));

  readonly form = this.fb.nonNullable.group({
    designation: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.designationService.list().subscribe({
      next: (rows) => {
        this.designations.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load designations.'));
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ designation: '' });
    this.dialogVisible.set(true);
  }

  openEdit(row: EmployeeResponse): void {
    this.editingId.set(row.id);
    this.form.reset({ designation: row.designation ?? '' });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.getRawValue().designation.trim();
    const id = this.editingId();
    const request$ = id === null ? this.designationService.create(name) : this.designationService.update(id, name);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Designation saved.' });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not save designation.') });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(row: EmployeeResponse): void {
    this.confirmation.confirm({
      header: 'Delete designation',
      message: `Delete designation "${row.designation ?? ''}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(row.id),
    });
  }

  private delete(id: number): void {
    this.designationService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Designation deleted.' });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Delete failed.') }),
    });
  }
}
