import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { EmployeeRequest, EmployeeResponse } from '../../../core/models/employee.model';

@Service()
export class AttendanceService {
  private readonly api = inject(Api);

  list(): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(API_PATHS.attendance);
  }

  listForEmployee(employeeId: number): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(`${API_PATHS.attendance}/employee/${employeeId}`);
  }

  create(body: EmployeeRequest): Observable<EmployeeResponse> {
    return this.api.post<EmployeeResponse>(API_PATHS.attendance, body);
  }

  update(id: number, body: EmployeeRequest): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.attendance}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.attendance}/${id}`);
  }
}
