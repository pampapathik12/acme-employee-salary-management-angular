import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { EmployeeResponse, buildEmployeeRequest } from '../../../core/models/employee.model';

@Service()
export class SalaryService {
  private readonly api = inject(Api);

  list(): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(API_PATHS.salaries);
  }

  listForEmployee(employeeId: number): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(`${API_PATHS.salaries}/employee/${employeeId}`);
  }

  create(salary: number): Observable<EmployeeResponse> {
    return this.api.post<EmployeeResponse>(API_PATHS.salaries, buildEmployeeRequest({ salary }));
  }

  update(id: number, salary: number): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.salaries}/${id}`, buildEmployeeRequest({ salary }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.salaries}/${id}`);
  }
}
