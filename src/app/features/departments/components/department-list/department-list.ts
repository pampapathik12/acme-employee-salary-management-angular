import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorMessage } from '../../../../core/utils/form.utils';
import { DepartmentResponse, DepartmentService } from '../../services/department';

@Component({
  selector: 'app-department-list',
  standalone: false,
  templateUrl: './department-list.html',
})
export class DepartmentList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly departments = signal<DepartmentResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  private readonly editingId = signal<number | null>(null);
  readonly dialogHeader = computed(() => (this.editingId() === null ? 'Add department' : 'Edit department'));

  readonly form = this.fb.nonNullable.group({
    department: ['', [Validators.required, Validators.maxLength(100)]],
    designation: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.departmentService.list().subscribe({
      next: (rows) => {
        this.departments.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load departments.'));
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ department: '', designation: '' });
    this.dialogVisible.set(true);
  }

  openEdit(row: DepartmentResponse): void {
    this.editingId.set(row.id);
    this.form.reset({ department: row.department, designation: '' });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.getRawValue().department.trim();
    if (!name) {
      this.form.controls.department.setErrors({ required: true });
      this.form.controls.department.markAsTouched();
      return;
    }
    const description = this.form.getRawValue().designation.trim();
    const id = this.editingId();
    const request$ = id === null
      ? this.departmentService.create(name, description || undefined)
      : this.departmentService.update(id, name, this.form.controls.designation.dirty ? description : undefined);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Department saved.' });
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Could not save department.') });
        this.saving.set(false);
      },
    });
  }

  confirmDelete(row: DepartmentResponse): void {
    this.confirmation.confirm({
      header: 'Delete department',
      message: `Delete department "${row.department ?? ''}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(row.id),
    });
  }

  private delete(id: number): void {
    this.departmentService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Department deleted.' });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Delete failed.') }),
    });
  }
}
