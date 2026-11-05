import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeResponse } from '../../../../core/models/employee.model';
import { errorMessage } from '../../../../core/utils/form.utils';
import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css',
})
export class EmployeeDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);

  readonly employee = signal<EmployeeResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.employeeService.get(id).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'Could not load employee.'));
        this.loading.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(['/employees']);
  }

  edit(): void {
    const employee = this.employee();
    if (employee) {
      this.router.navigate(['/employees', employee.id, 'edit']);
    }
  }
}
