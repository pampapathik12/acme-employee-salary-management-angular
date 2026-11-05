import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { EmployeeRequest, EmployeeResponse } from '../../../core/models/employee.model';

@Service()
export class LeaveService {
  private readonly api = inject(Api);

  list(): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(API_PATHS.leaves);
  }

  listForEmployee(employeeId: number): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(`${API_PATHS.leaves}/employee/${employeeId}`);
  }

  create(body: EmployeeRequest): Observable<EmployeeResponse> {
    return this.api.post<EmployeeResponse>(API_PATHS.leaves, body);
  }

  update(id: number, body: EmployeeRequest): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.leaves}/${id}`, body);
  }

  approve(id: number, approvedBy: number): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.leaves}/${id}/approve`, null, { approvedBy });
  }

  reject(id: number, approvedBy: number): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.leaves}/${id}/reject`, null, { approvedBy });
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.leaves}/${id}`);
  }
}
