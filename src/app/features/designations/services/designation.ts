import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';

export interface DesignationResponse {
  id: number;
  designation: string;
}

@Service()
export class DesignationService {
  private readonly api = inject(Api);

  list(): Observable<DesignationResponse[]> {
    return this.api.get<DesignationResponse[]>(`${API_PATHS.designations}/getAllDesignations`);
  }

  get(id: number): Observable<DesignationResponse> {
    return this.api.get<DesignationResponse>(`${API_PATHS.designations}/getDesignation/${id}`);
  }

  create(designation: string): Observable<DesignationResponse> {
    return this.api.post<DesignationResponse>(`${API_PATHS.designations}/addDesignation`, { designation });
  }

  update(id: number, designation: string): Observable<DesignationResponse> {
    return this.api.put<DesignationResponse>(`${API_PATHS.designations}/updateDesignation/${id}`, { designation });
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.designations}/deleteDesignationById/${id}`);
  }
}
