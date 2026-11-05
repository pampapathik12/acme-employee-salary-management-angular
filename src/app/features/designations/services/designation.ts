import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { EmployeeResponse, buildEmployeeRequest } from '../../../core/models/employee.model';

@Service()
export class DesignationService {
  private readonly api = inject(Api);

  list(): Observable<EmployeeResponse[]> {
    return this.api.get<EmployeeResponse[]>(API_PATHS.designations);
  }

  create(designation: string): Observable<EmployeeResponse> {
    return this.api.post<EmployeeResponse>(API_PATHS.designations, buildEmployeeRequest({ designation }));
  }

  update(id: number, designation: string): Observable<EmployeeResponse> {
    return this.api.put<EmployeeResponse>(`${API_PATHS.designations}/${id}`, buildEmployeeRequest({ designation }));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.designations}/${id}`);
  }
}
