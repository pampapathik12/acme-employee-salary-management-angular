import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';

export interface DepartmentResponse {
  id: number;
  department: string;
}

@Service()
export class DepartmentService {
  private readonly api = inject(Api);

  list(): Observable<DepartmentResponse[]> {
    return this.api.get<DepartmentResponse[]>(`${API_PATHS.departments}/getAllDepartments`);
  }

  get(id: number): Observable<DepartmentResponse> {
    return this.api.get<DepartmentResponse>(`${API_PATHS.departments}/getDepartment/${id}`);
  }

  create(department: string, designation?: string): Observable<DepartmentResponse> {
    return this.api.post<DepartmentResponse>(`${API_PATHS.departments}/addDepartment`, {
      department,
      ...(designation ? { designation } : {}),
    });
  }

  update(id: number, department: string, designation?: string): Observable<DepartmentResponse> {
    return this.api.put<DepartmentResponse>(`${API_PATHS.departments}/updateDepartment/${id}`, {
      department,
      ...(designation !== undefined ? { designation } : {}),
    });
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.departments}/deleteDepartmentById/${id}`);
  }
}
