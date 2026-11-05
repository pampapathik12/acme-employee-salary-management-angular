import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeResponse } from '../../../../core/models/employee.model';
import { errorMessage } from '../../../../core/utils/form.utils';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly employees = signal<EmployeeResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeService.list().subscribe({
      next: (rows) => {
        this.employees.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load employees.'));
        this.loading.set(false);
      },
    });
  }

  view(employee: EmployeeResponse): void {
    this.router.navigate(['/employees', employee.id]);
  }

  edit(employee: EmployeeResponse): void {
    this.router.navigate(['/employees', employee.id, 'edit']);
  }

  add(): void {
    this.router.navigate(['/employees/new']);
  }

  confirmDelete(employee: EmployeeResponse): void {
    this.confirmation.confirm({
      header: 'Delete employee',
      message: `Delete ${employee.firstName ?? ''} ${employee.lastName ?? ''}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => this.delete(employee.id),
    });
  }

  private delete(id: number): void {
    this.employeeService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Employee deleted.' });
        this.load();
      },
      error: (err) =>
        this.messages.add({ severity: 'error', summary: 'Error', detail: errorMessage(err, 'Delete failed.') }),
    });
  }
}
