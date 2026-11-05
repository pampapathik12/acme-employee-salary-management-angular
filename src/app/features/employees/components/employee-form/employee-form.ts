import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { buildEmployeeRequest } from '../../../../core/models/employee.model';
import { errorMessage, fromIsoDate, toIsoDate } from '../../../../core/utils/form.utils';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly messages = inject(MessageService);

  private readonly employeeId = signal<number | null>(null);
  readonly isEdit = computed(() => this.employeeId() !== null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
    department: ['', Validators.required],
    designation: ['', Validators.required],
    salary: [null as number | null, [Validators.required, Validators.min(0)]],
    joiningDate: [null as Date | null, Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.employeeId.set(Number(id));
    this.loading.set(true);
    this.employeeService.get(Number(id)).subscribe({
      next: (employee) => {
        this.form.patchValue({ ...employee, joiningDate: fromIsoDate(employee.joiningDate) });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load employee.'));
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body = buildEmployeeRequest({ ...raw, joiningDate: toIsoDate(raw.joiningDate) });
    const id = this.employeeId();
    const request$ = id === null ? this.employeeService.create(body) : this.employeeService.update(id, body);

    this.saving.set(true);
    this.error.set(null);
    request$.subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: 'Saved',
          detail: id === null ? 'Employee created.' : 'Employee updated.',
        });
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not save employee.'));
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }

  hasError(field: 'firstName' | 'lastName' | 'email' | 'phone' | 'department' | 'designation' | 'salary' | 'joiningDate'): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }
}
