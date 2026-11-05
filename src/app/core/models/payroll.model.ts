export type PaymentStatus = 'PENDING' | 'PAID';

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
