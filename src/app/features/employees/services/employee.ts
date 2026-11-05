import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { EmployeeRequest, EmployeeResponse } from '../../../core/models/employee.model';

@Service()
export class EmployeeService {
  private readonly api = inject(Api);

  list(): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(API_PATHS.employees);
  }

  get(id: number): Observable<EmployeeResponse> {
    return this.api.get<EmployeeResponse>(`${API_PATHS.employees}/${id}`);
  }

  create(body: EmployeeRequest): Observable<EmployeeResponse> {
    return this.api.post<EmployeeResponse>(API_PATHS.employees, body);
  }

  update(id: number, body: EmployeeRequest): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.employees}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.employees}/${id}`);
  }
}
