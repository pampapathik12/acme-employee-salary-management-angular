import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { EmployeeRequest } from '../../../core/models/employee.model';

export interface SalaryRequest {
  employeeId: number;
  salary: number;
  salaryComponentId?: number;
  componentName?: string;
  componentType?: string;
}

export interface SalaryResponse extends EmployeeRequest {
  id: number;
  employeeId: number;
  salary: number;
  relatedTypeId: number;
  amount: number;
}

@Service()
export class SalaryService {
  private readonly api = inject(Api);

  list(): Observable<SalaryResponse[]> {
    return this.api.get<SalaryResponse[]>(`${API_PATHS.salaries}/getAllSalaries`);
  }

  get(id: number): Observable<SalaryResponse> {
    return this.api.get<SalaryResponse>(`${API_PATHS.salaries}/getSalary/${id}`);
  }

  listForEmployee(employeeId: number): Observable<SalaryResponse[]> {
    return this.api.get<SalaryResponse[]>(`${API_PATHS.salaries}/getSalariesByEmployeeId/${employeeId}`);
  }

  create(request: SalaryRequest): Observable<SalaryResponse> {
    return this.api.post<SalaryResponse>(`${API_PATHS.salaries}/addSalary`, request);
  }

  update(id: number, request: SalaryRequest): Observable<SalaryResponse> {
    return this.api.put<SalaryResponse>(`${API_PATHS.salaries}/updateSalary/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.salaries}/deleteSalaryById/${id}`);
  }
}
