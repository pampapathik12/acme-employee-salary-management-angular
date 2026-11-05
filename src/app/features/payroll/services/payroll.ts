import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../../../core/services/api';
import { API_PATHS } from '../../../core/constants/api.constants';
import { Payroll, PayrollPeriod, PayrollPeriodRequest, PaymentStatus } from '../../../core/models/payroll.model';

@Service()
export class PayrollService {
  private readonly api = inject(Api);

  list(): Observable<Payroll[]> {
    return this.api.get<Payroll[]>(`${API_PATHS.payroll}/getAllPayrolls`);
  }

  get(id: number): Observable<Payroll> {
    return this.api.get<Payroll>(`${API_PATHS.payroll}/getPayroll/${id}`);
  }

  listForEmployee(employeeId: number): Observable<Payroll[]> {
    return this.api.get<Payroll[]>(`${API_PATHS.payroll}/getPayrollsByEmployeeId/${employeeId}`);
  }

  generate(employeeId: number, payrollPeriodId: number): Observable<Payroll> {
    return this.api.post<Payroll>(`${API_PATHS.payroll}/generatePayroll`, null, { employeeId, payrollPeriodId });
  }

  listPeriods(): Observable<PayrollPeriod[]> {
    return this.api.get<PayrollPeriod[]>(`${API_PATHS.payrollPeriods}/getAllPayrollPeriods`);
  }

  createPeriod(body: PayrollPeriodRequest): Observable<PayrollPeriod> {
    return this.api.post<PayrollPeriod>(`${API_PATHS.payrollPeriods}/addPayrollPeriod`, body);
  }

  updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Observable<Payroll> {
    return this.api.put<Payroll>(`${API_PATHS.payroll}/updatePaymentStatus/${id}`, null, { paymentStatus });
  }
}
