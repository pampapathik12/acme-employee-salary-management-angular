import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { Payroll, PaymentStatus } from '../../../core/models/payroll.model';

@Service()
export class PayrollService {
  private readonly api = inject(Api);

  list(): Observable<Payroll[]> {
    return this.api.get<Payroll[]>(API_PATHS.payroll);
  }

  listForEmployee(employeeId: number): Observable<Payroll[]> {
    return this.api.get<Payroll[]>(`${API_PATHS.payroll}/employee/${employeeId}`);
  }

  generate(employeeId: number, payrollPeriodId: number): Observable<Payroll> {
    return this.api.post<Payroll>(`${API_PATHS.payroll}/generate`, null, { employeeId, payrollPeriodId });
  }

  updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Observable<Payroll> {
    return this.api.put<Payroll>(`${API_PATHS.payroll}/${id}/payment-status`, null, { paymentStatus });
  }
}
