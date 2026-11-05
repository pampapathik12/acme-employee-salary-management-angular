import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';

export interface LeaveRequest {
  employeeId: number;
  leaveType?: string;
  leaveTypeId?: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveResponse {
  id: number;
  firstName: string | null;
  lastName: string | null;
  employeeId: number;
  relatedTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

@Service()
export class LeaveService {
  private readonly api = inject(Api);

  list(): Observable<LeaveResponse[]> {
    return this.api.get<LeaveResponse[]>(`${API_PATHS.leaves}/getAllLeaves`);
  }

  get(id: number): Observable<LeaveResponse> {
    return this.api.get<LeaveResponse>(`${API_PATHS.leaves}/getLeave/${id}`);
  }

  listForEmployee(employeeId: number): Observable<LeaveResponse[]> {
    return this.api.get<LeaveResponse[]>(`${API_PATHS.leaves}/getLeavesByEmployeeId/${employeeId}`);
  }

  create(body: LeaveRequest): Observable<LeaveResponse> {
    return this.api.post<LeaveResponse>(`${API_PATHS.leaves}/applyLeave`, body);
  }

  update(id: number, body: LeaveRequest): Observable<LeaveResponse> {
    return this.api.put<LeaveResponse>(`${API_PATHS.leaves}/updateLeave/${id}`, body);
  }

  approve(id: number): Observable<LeaveResponse> {
    return this.api.put<LeaveResponse>(`${API_PATHS.leaves}/approveLeave/${id}`);
  }

  reject(id: number): Observable<LeaveResponse> {
    return this.api.put<LeaveResponse>(`${API_PATHS.leaves}/rejectLeave/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.leaves}/deleteLeaveById/${id}`);
  }
}
