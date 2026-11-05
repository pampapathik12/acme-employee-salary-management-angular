import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';

export interface AttendanceRequest {
  employeeId: number;
  attendanceDate: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export interface AttendanceResponse extends AttendanceRequest {
  id: number;
  firstName: string | null;
  lastName: string | null;
}

@Service()
export class AttendanceService {
  private readonly api = inject(Api);

  list(): Observable<AttendanceResponse[]> {
    return this.api.get<AttendanceResponse[]>(`${API_PATHS.attendance}/getAllAttendance`);
  }

  get(id: number): Observable<AttendanceResponse> {
    return this.api.get<AttendanceResponse>(`${API_PATHS.attendance}/getAttendance/${id}`);
  }

  listForEmployee(employeeId: number): Observable<AttendanceResponse[]> {
    return this.api.get<AttendanceResponse[]>(`${API_PATHS.attendance}/getAttendanceByEmployeeId/${employeeId}`);
  }

  create(body: AttendanceRequest): Observable<AttendanceResponse> {
    return this.api.post<AttendanceResponse>(`${API_PATHS.attendance}/markAttendance`, body);
  }

  update(id: number, body: AttendanceRequest): Observable<AttendanceResponse> {
    return this.api.put<AttendanceResponse>(`${API_PATHS.attendance}/updateAttendance/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${API_PATHS.attendance}/deleteAttendanceById/${id}`);
  }
}
