export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface PayrollPeriodRequest {
  periodName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface PayrollPeriod extends PayrollPeriodRequest {
  id: number;
}

export interface Payroll {
  payrollId: number;
  employeeId: number;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: PaymentStatus;
  paymentDate: string | null;
}
