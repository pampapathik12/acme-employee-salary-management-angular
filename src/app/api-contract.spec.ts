import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { vi } from 'vitest';
import { environment } from '../environments/environment';
import { Auth } from './core/auth/services/auth';
import { SESSION_STORAGE_KEY } from './core/constants/api.constants';
import { Api } from './core/services/api';
import { EmployeeResponse } from './core/models/employee.model';
import { AttendanceModule } from './features/attendance/attendance-module';
import { AttendanceList } from './features/attendance/components/attendance-list/attendance-list';
import { AttendanceService } from './features/attendance/services/attendance';
import { DashboardService } from './features/dashboard/services/dashboard';
import { DepartmentService } from './features/departments/services/department';
import { DesignationService } from './features/designations/services/designation';
import { EmployeeService } from './features/employees/services/employee';
import { EmployeesModule } from './features/employees/employees-module';
import { EmployeeList } from './features/employees/components/employee-list/employee-list';
import { EmployeeDetails } from './features/employees/components/employee-details/employee-details';
import { EmployeeForm } from './features/employees/components/employee-form/employee-form';
import { LeaveList } from './features/leave-management/components/leave-list/leave-list';
import { LeaveManagementModule } from './features/leave-management/leave-management-module';
import { LeaveResponse, LeaveService } from './features/leave-management/services/leave';
import { PayrollService } from './features/payroll/services/payroll';
import { PayrollModule } from './features/payroll/payroll-module';
import { PayrollList } from './features/payroll/components/payroll-list/payroll-list';
import { SalaryService } from './features/salary-structure/services/salary';

const employee = {
  firstName: 'Asha', lastName: 'Patel', email: 'asha@example.com', phone: '9876543210',
  department: 'Engineering', designation: 'Developer', salary: 75000, joiningDate: '2026-01-15',
};
const attendance = {
  employeeId: 4, attendanceDate: '2026-11-05', checkIn: '09:00:00', checkOut: '17:30:00', status: 'PRESENT',
};
const employeeRecord: EmployeeResponse = {
  id: 4, employeeId: 4, employeeCode: 'EMP-00000002', department: 'Finance', designation: 'Accountant',
  email: 'employee2@company.com', firstName: 'Employee2', joiningDate: '2020-01-03', lastName: 'Kumar',
  phone: '9000000002', salary: 25002,
};
const leave = {
  employeeId: 4, leaveType: 'Annual', startDate: '2026-11-10', endDate: '2026-11-12', reason: 'Personal leave',
};
const leaveRecord: LeaveResponse = {
  id: 7, employeeId: 4, firstName: 'Asha', lastName: 'Patel', relatedTypeId: 2,
  startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason, status: 'PENDING',
};
const payrollPeriod = {
  periodName: 'November 2026', startDate: '2026-11-05', endDate: '2026-11-05', status: 'OPEN',
};

interface ContractCase {
  name: string;
  invoke: () => Observable<unknown>;
  method: string;
  path: string;
  body?: unknown;
  params?: Record<string, string>;
}

const contracts: ContractCase[] = [
  { name: 'load payroll periods', invoke: () => TestBed.inject(PayrollService).listPeriods(), method: 'GET', path: '/api/payroll-periods/getAllPayrollPeriods' },
  { name: 'add payroll period', invoke: () => TestBed.inject(PayrollService).createPeriod(payrollPeriod), method: 'POST', path: '/api/payroll-periods/addPayrollPeriod', body: payrollPeriod },
  { name: 'list employees', invoke: () => TestBed.inject(EmployeeService).list(), method: 'GET', path: '/api/employees/getAllEmployees' },
  { name: 'get employee', invoke: () => TestBed.inject(EmployeeService).get(4), method: 'GET', path: '/api/employees/getEmployee/4' },
  { name: 'add employee', invoke: () => TestBed.inject(EmployeeService).create(employee), method: 'POST', path: '/api/employees/addEmployee', body: employee },
  { name: 'update employee', invoke: () => TestBed.inject(EmployeeService).update(4, employee), method: 'PUT', path: '/api/employees/updateEmployee/4', body: employee },
  { name: 'delete employee', invoke: () => TestBed.inject(EmployeeService).delete(4), method: 'DELETE', path: '/api/employees/deleteEmployeeById/4' },
  { name: 'list departments', invoke: () => TestBed.inject(DepartmentService).list(), method: 'GET', path: '/api/departments/getAllDepartments' },
  { name: 'get department', invoke: () => TestBed.inject(DepartmentService).get(2), method: 'GET', path: '/api/departments/getDepartment/2' },
  { name: 'add department', invoke: () => TestBed.inject(DepartmentService).create('Engineering', 'Builds software'), method: 'POST', path: '/api/departments/addDepartment', body: { department: 'Engineering', designation: 'Builds software' } },
  { name: 'update department', invoke: () => TestBed.inject(DepartmentService).update(2, 'Engineering', 'Builds software'), method: 'PUT', path: '/api/departments/updateDepartment/2', body: { department: 'Engineering', designation: 'Builds software' } },
  { name: 'delete department', invoke: () => TestBed.inject(DepartmentService).delete(2), method: 'DELETE', path: '/api/departments/deleteDepartmentById/2' },
  { name: 'list designations', invoke: () => TestBed.inject(DesignationService).list(), method: 'GET', path: '/api/designations/getAllDesignations' },
  { name: 'get designation', invoke: () => TestBed.inject(DesignationService).get(3), method: 'GET', path: '/api/designations/getDesignation/3' },
  { name: 'add designation', invoke: () => TestBed.inject(DesignationService).create('Developer'), method: 'POST', path: '/api/designations/addDesignation', body: { designation: 'Developer' } },
  { name: 'update designation', invoke: () => TestBed.inject(DesignationService).update(3, 'Developer'), method: 'PUT', path: '/api/designations/updateDesignation/3', body: { designation: 'Developer' } },
  { name: 'delete designation', invoke: () => TestBed.inject(DesignationService).delete(3), method: 'DELETE', path: '/api/designations/deleteDesignationById/3' },
  { name: 'list salaries', invoke: () => TestBed.inject(SalaryService).list(), method: 'GET', path: '/api/salaries/getAllSalaries' },
  { name: 'get salary', invoke: () => TestBed.inject(SalaryService).get(10), method: 'GET', path: '/api/salaries/getSalary/10' },
  { name: 'filter salaries', invoke: () => TestBed.inject(SalaryService).listForEmployee(4), method: 'GET', path: '/api/salaries/getSalariesByEmployeeId/4' },
  { name: 'add salary', invoke: () => TestBed.inject(SalaryService).create({ employeeId: 4, salary: 9888888 }), method: 'POST', path: '/api/salaries/addSalary', body: { employeeId: 4, salary: 9888888 } },
  { name: 'update salary', invoke: () => TestBed.inject(SalaryService).update(10, { employeeId: 4, salary: 9888888 }), method: 'PUT', path: '/api/salaries/updateSalary/10', body: { employeeId: 4, salary: 9888888 } },
  { name: 'delete salary', invoke: () => TestBed.inject(SalaryService).delete(10), method: 'DELETE', path: '/api/salaries/deleteSalaryById/10' },
  { name: 'list attendance', invoke: () => TestBed.inject(AttendanceService).list(), method: 'GET', path: '/api/attendance/getAllAttendance' },
  { name: 'get attendance', invoke: () => TestBed.inject(AttendanceService).get(12), method: 'GET', path: '/api/attendance/getAttendance/12' },
  { name: 'filter attendance', invoke: () => TestBed.inject(AttendanceService).listForEmployee(4), method: 'GET', path: '/api/attendance/getAttendanceByEmployeeId/4' },
  { name: 'mark attendance', invoke: () => TestBed.inject(AttendanceService).create(attendance), method: 'POST', path: '/api/attendance/markAttendance', body: attendance },
  { name: 'update attendance', invoke: () => TestBed.inject(AttendanceService).update(12, attendance), method: 'PUT', path: '/api/attendance/updateAttendance/12', body: attendance },
  { name: 'delete attendance', invoke: () => TestBed.inject(AttendanceService).delete(12), method: 'DELETE', path: '/api/attendance/deleteAttendanceById/12' },
  { name: 'list leaves', invoke: () => TestBed.inject(LeaveService).list(), method: 'GET', path: '/api/leaves/getAllLeaves' },
  { name: 'get leave', invoke: () => TestBed.inject(LeaveService).get(7), method: 'GET', path: '/api/leaves/getLeave/7' },
  { name: 'filter leaves', invoke: () => TestBed.inject(LeaveService).listForEmployee(4), method: 'GET', path: '/api/leaves/getLeavesByEmployeeId/4' },
  { name: 'apply leave', invoke: () => TestBed.inject(LeaveService).create(leave), method: 'POST', path: '/api/leaves/applyLeave', body: leave },
  { name: 'update leave', invoke: () => TestBed.inject(LeaveService).update(7, leave), method: 'PUT', path: '/api/leaves/updateLeave/7', body: leave },
  { name: 'approve leave', invoke: () => TestBed.inject(LeaveService).approve(7), method: 'PUT', path: '/api/leaves/approveLeave/7' },
  { name: 'reject leave', invoke: () => TestBed.inject(LeaveService).reject(7), method: 'PUT', path: '/api/leaves/rejectLeave/7' },
  { name: 'delete leave', invoke: () => TestBed.inject(LeaveService).delete(7), method: 'DELETE', path: '/api/leaves/deleteLeaveById/7' },
  { name: 'list payrolls', invoke: () => TestBed.inject(PayrollService).list(), method: 'GET', path: '/api/payroll/getAllPayrolls' },
  { name: 'get payroll', invoke: () => TestBed.inject(PayrollService).get(15), method: 'GET', path: '/api/payroll/getPayroll/15' },
  { name: 'filter payrolls', invoke: () => TestBed.inject(PayrollService).listForEmployee(4), method: 'GET', path: '/api/payroll/getPayrollsByEmployeeId/4' },
  { name: 'generate payroll', invoke: () => TestBed.inject(PayrollService).generate(4, 2), method: 'POST', path: '/api/payroll/generatePayroll', params: { employeeId: '4', payrollPeriodId: '2' } },
  ...(['PENDING', 'PAID', 'FAILED', 'CANCELLED'] as const).map((paymentStatus): ContractCase => ({
    name: `set payment status ${paymentStatus}`,
    invoke: () => TestBed.inject(PayrollService).updatePaymentStatus(15, paymentStatus),
    method: 'PUT', path: '/api/payroll/updatePaymentStatus/15', params: { paymentStatus },
  })),
];

describe('Backend API contract', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AttendanceModule, LeaveManagementModule, EmployeesModule, PayrollModule],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]), FormBuilder,
        Api, EmployeeService, DepartmentService, DesignationService, SalaryService,
        AttendanceService, LeaveService, PayrollService, DashboardService,
        ConfirmationService, MessageService,
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '4' }) } } },
        { provide: Auth, useValue: { userId: null, canAccess: () => true } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads payroll periods without looking up employees when opening generation', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    expect(component.generateForm.getRawValue()).toEqual({ employeeId: null, payrollPeriodId: null });
    expect(component.loadingGenerateOptions()).toBe(true);
    http.expectNone(`${environment.apiBaseUrl}/api/employees/getAllEmployees`);
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    expect(component.periodOptions()).toEqual([{ label: 'November 2026 (2026-11-05 - 2026-11-05)', value: 2 }]);
    expect(component.loadingGenerateOptions()).toBe(false);
    expect(component.generateForm.invalid).toBe(true);
  });

  it('generates payroll with the entered employee ID and selected period as query parameters', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    component.generateForm.setValue({ employeeId: 4, payrollPeriodId: 2 });
    component.generate();
    component.generate();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/payroll/generatePayroll?employeeId=4&payrollPeriodId=2`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush({ payrollId: 15 });
    expect(component.generateVisible()).toBe(false);
    expect(component.generating()).toBe(false);
    http.expectOne(`${environment.apiBaseUrl}/api/payroll/getAllPayrolls`).flush([]);
  });

  it('blocks generation while choices are loading or selections are incomplete', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    component.generate();
    http.expectNone((request) => request.method === 'POST');
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    component.generateForm.controls.employeeId.setValue(4);
    component.generate();
    expect(component.generateForm.controls.payrollPeriodId.touched).toBe(true);
    http.expectNone((request) => request.method === 'POST');
  });

  it('handles an empty period list without accepting an arbitrary period ID', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([]);
    expect(component.periodOptions()).toEqual([]);
    component.generateForm.setValue({ employeeId: 4, payrollPeriodId: 2 });
    component.generate();
    expect(component.generateError()).not.toBeNull();
    http.expectNone((request) => request.method === 'POST');
  });

  it('shows a lookup error and reloads choices on retry', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush(
      { message: 'Periods unavailable' }, { status: 500, statusText: 'Server Error' },
    );
    expect(component.loadingGenerateOptions()).toBe(false);
    expect(component.generateError()).toBe('Periods unavailable');
    component.generate();
    http.expectNone((request) => request.method === 'POST');
    component.loadGenerateOptions();
    expect(component.generateError()).toBeNull();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    expect(component.periodOptions().length).toBe(1);
  });

  it('refreshes payroll periods and clears previous selections when reopened', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    component.generateForm.setValue({ employeeId: 4, payrollPeriodId: 2 });
    component.openGenerate();
    expect(component.generateForm.getRawValue()).toEqual({ employeeId: null, payrollPeriodId: null });
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 3, periodName: 'December 2026' }]);
    expect(component.periodOptions()[0].label).toContain('December 2026');
  });

  it('renders an employee ID input and period dropdown with required values', () => {
    const fixture = TestBed.createComponent(PayrollList);
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll/getAllPayrolls`).flush([]);
    fixture.componentInstance.openGenerate();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(form.querySelectorAll('p-select').length).toBe(1);
    expect(form.querySelectorAll('p-inputnumber').length).toBe(1);
    expect(form.querySelector('label[for="gen-employeeId"]')?.textContent).toBe('Employee ID *');
    expect(form.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    fixture.componentInstance.generateForm.setValue({ employeeId: 4, payrollPeriodId: 2 });
    fixture.detectChanges();
    expect(form.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(false);
  });

  it('rejects missing, nonpositive, or fractional employee IDs when generating payroll', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openGenerate();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/getAllPayrollPeriods`).flush([{ ...payrollPeriod, id: 2 }]);
    for (const employeeId of [null, 0, -1, 1.5]) {
      component.generateForm.setValue({ employeeId, payrollPeriodId: 2 });
      component.generate();
      expect(component.generateForm.controls.employeeId.invalid).toBe(true);
    }
    http.expectNone((request) => request.method === 'POST');
  });

  it('requires all payroll period fields and rejects blank names and statuses', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openCreatePeriod();
    component.createPeriod();
    for (const control of Object.values(component.periodForm.controls)) {
      expect(control.hasError('required')).toBe(true);
      expect(control.touched).toBe(true);
    }
    component.periodForm.setValue({ ...payrollPeriod, periodName: '   ', status: '   ' });
    component.createPeriod();
    expect(component.periodForm.invalid).toBe(true);
    http.expectNone((request) => request.method === 'POST');
  });

  it('rejects reversed payroll period dates and accepts same-day periods', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.periodForm.setValue({ ...payrollPeriod, endDate: '2026-11-04' });
    component.createPeriod();
    expect(component.periodForm.hasError('dateRange')).toBe(true);
    http.expectNone((request) => request.method === 'POST');
    component.periodForm.setValue(payrollPeriod);
    expect(component.periodForm.valid).toBe(true);
  });

  it('posts the four payroll period fields once and closes on success', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openCreatePeriod();
    component.periodForm.setValue({ ...payrollPeriod, periodName: ' November 2026 ', status: ' OPEN ' });
    component.createPeriod();
    component.createPeriod();
    expect(component.creatingPeriod()).toBe(true);
    const request = http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/addPayrollPeriod`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payrollPeriod);
    expect(request.request.params.keys()).toEqual([]);
    request.flush({});
    expect(component.creatingPeriod()).toBe(false);
    expect(component.periodVisible()).toBe(false);
  });

  it('retains payroll period input and displays the backend error for retry', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.openCreatePeriod();
    component.periodForm.setValue(payrollPeriod);
    component.createPeriod();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/addPayrollPeriod`).flush(
      { message: 'Period already exists', path: '/api/payroll-periods/addPayrollPeriod' },
      { status: 400, statusText: 'Bad Request' },
    );
    expect(component.creatingPeriod()).toBe(false);
    expect(component.periodVisible()).toBe(true);
    expect(component.periodError()).toBe('Period already exists');
    expect(component.periodForm.getRawValue()).toEqual(payrollPeriod);
    component.createPeriod();
    expect(component.periodError()).toBeNull();
    http.expectOne(`${environment.apiBaseUrl}/api/payroll-periods/addPayrollPeriod`).flush({});
  });

  it('resets the payroll period form and error when reopened', () => {
    const component = TestBed.runInInjectionContext(() => new PayrollList());
    component.periodForm.setValue(payrollPeriod);
    component.periodError.set('Previous error');
    component.openCreatePeriod();
    expect(component.periodForm.getRawValue()).toEqual({ periodName: '', startDate: '', endDate: '', status: '' });
    expect(component.periodError()).toBeNull();
    expect(component.periodForm.pristine).toBe(true);
  });

  it('preserves the documented employee response identifiers', () => {
    let response: EmployeeResponse | undefined;
    TestBed.inject(EmployeeService).get(4).subscribe((value) => response = value);
    http.expectOne(`${environment.apiBaseUrl}/api/employees/getEmployee/4`).flush(employeeRecord);
    expect(response).toEqual(employeeRecord);
    expect(response?.employeeId).toBe(4);
    expect(response?.employeeCode).toBe('EMP-00000002');
  });

  it('renders the employee ID and code in the employee list', () => {
    const fixture = TestBed.createComponent(EmployeeList);
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/api/employees/getAllEmployees`).flush([employeeRecord]);
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;
    expect(row.cells[0].textContent).toBe('4');
    expect(row.cells[1].textContent).toBe('EMP-00000002');
    expect(row.textContent).toContain('Employee2 Kumar');
  });

  it('renders the employee ID and code in employee details', () => {
    const fixture = TestBed.createComponent(EmployeeDetails);
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/api/employees/getEmployee/4`).flush(employeeRecord);
    fixture.detectChanges();
    const details = fixture.nativeElement.querySelector('dl') as HTMLDListElement;
    expect(details.querySelectorAll('dd')[0].textContent).toBe('4');
    expect(details.querySelectorAll('dd')[1].textContent).toBe('EMP-00000002');
    const fields = Array.from(details.querySelectorAll('.detail-field'));
    expect(fields).toHaveLength(9);
    expect(fields.map((field) => field.querySelector('dt')?.textContent)).toEqual([
      'Employee ID', 'Employee code', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Salary', 'Joining date',
    ]);
    for (const field of fields) {
      expect(field.querySelectorAll('dt')).toHaveLength(1);
      expect(field.querySelectorAll('dd')).toHaveLength(1);
    }
  });

  it('keeps response-only employee identifiers out of update requests', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(EmployeeForm);
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/api/employees/getEmployee/4`).flush(employeeRecord);
    fixture.componentInstance.submit();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/employees/updateEmployee/4`);
    const { id, employeeId, employeeCode, ...body } = employeeRecord;
    expect(request.request.body).toEqual(body);
    request.flush(employeeRecord);
  });

  for (const contract of contracts) {
    it(contract.name, () => {
      contract.invoke().subscribe();
      const request = http.expectOne((candidate) => candidate.url === `${environment.apiBaseUrl}${contract.path}`);
      expect(request.request.method).toBe(contract.method);
      expect(request.request.body).toEqual(contract.body ?? null);
      expect(request.request.params.keys().sort()).toEqual(Object.keys(contract.params ?? {}).sort());
      for (const [key, value] of Object.entries(contract.params ?? {})) {
        expect(request.request.params.get(key)).toBe(value);
      }
      if (contract.method === 'DELETE') {
        request.flush(null, { status: 204, statusText: 'No Content' });
      } else {
        request.flush(contract.method === 'GET' ? [] : {});
      }
    });
  }

  it('keeps login credentials in a JSON body', () => {
    const auth = TestBed.runInInjectionContext(() => new Auth());
    const credentials = { email: 'admin@salary.com', password: 'test-password' };
    auth.login(credentials).subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    expect(request.request.params.keys()).toEqual([]);
    request.flush({ token: 'test-token', tokenType: 'Bearer', email: credentials.email, role: 'ADMIN' });
    localStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('counts dashboard records using each documented list endpoint', () => {
    let counts: unknown;
    TestBed.inject(DashboardService).loadCounts().subscribe((value) => counts = value);
    for (const contract of contracts.filter((entry) => entry.name.startsWith('list '))) {
      http.expectOne(`${environment.apiBaseUrl}${contract.path}`).flush([{}, {}]);
    }
    expect(counts).toEqual({ employees: 2, departments: 2, designations: 2, salaries: 2, attendance: 2, leaves: 2, payroll: 2 });
  });

  it('does not send an unknown department description when updating only its name', () => {
    TestBed.inject(DepartmentService).update(2, 'Finance').subscribe();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/departments/updateDepartment/2`);
    expect(request.request.body).toEqual({ department: 'Finance' });
    request.flush({ id: 2, department: 'Finance' });
  });

  it('prevents incomplete attendance submissions', () => {
    const component = TestBed.runInInjectionContext(() => new AttendanceList());
    component.save();
    expect(component.form.invalid).toBe(true);
    expect(component.form.touched).toBe(true);
    http.expectNone((request) => request.method === 'POST');
  });

  it('serializes attendance times with seconds and no employee details', () => {
    const component = TestBed.runInInjectionContext(() => new AttendanceList());
    component.form.setValue({ ...attendance, checkIn: '09:00', checkOut: '17:30' });
    component.save();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/attendance/markAttendance`);
    expect(request.request.body).toEqual(attendance);
    request.flush({ ...attendance, id: 12, firstName: 'Asha', lastName: 'Patel' });
    http.expectOne(`${environment.apiBaseUrl}/api/attendance/getAllAttendance`).flush([]);
  });

  it('preserves attendance fields when editing', () => {
    const component = TestBed.runInInjectionContext(() => new AttendanceList());
    component.openEdit({ ...attendance, id: 12, firstName: 'Asha', lastName: 'Patel' });
    component.save();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/attendance/updateAttendance/12`);
    expect(request.request.body).toEqual(attendance);
    request.flush({});
    http.expectOne(`${environment.apiBaseUrl}/api/attendance/getAllAttendance`).flush([]);
  });

  it('requires leave details and rejects reversed dates', () => {
    const component = TestBed.runInInjectionContext(() => new LeaveList());
    component.save();
    expect(component.form.invalid).toBe(true);
    component.form.patchValue({ ...leave, endDate: '2026-11-09' });
    expect(component.form.hasError('dateRange')).toBe(true);
    component.save();
    http.expectNone((request) => request.method === 'POST');
  });

  it('applies leave using a leave type name', () => {
    const component = TestBed.runInInjectionContext(() => new LeaveList());
    component.form.patchValue(leave);
    component.save();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/leaves/applyLeave`);
    expect(request.request.body).toEqual(leave);
    request.flush(leaveRecord);
    http.expectOne(`${environment.apiBaseUrl}/api/leaves/getAllLeaves`).flush([]);
  });

  it('preserves the related leave type ID on edit without sending a blank type name', () => {
    const component = TestBed.runInInjectionContext(() => new LeaveList());
    component.openEdit(leaveRecord);
    component.save();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/leaves/updateLeave/7`);
    expect(request.request.body).toEqual({
      employeeId: 4, leaveTypeId: 2, startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason,
    });
    request.flush(leaveRecord);
    http.expectOne(`${environment.apiBaseUrl}/api/leaves/getAllLeaves`).flush([]);
  });

  it.each(['approve', 'reject'] as const)('can %s leave without a manual approver ID', (action) => {
    const component = TestBed.runInInjectionContext(() => new LeaveList());
    component[action](leaveRecord);
    const request = http.expectOne(`${environment.apiBaseUrl}/api/leaves/${action}Leave/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBeNull();
    expect(request.request.params.keys()).toEqual([]);
    request.flush({ ...leaveRecord, status: action === 'approve' ? 'APPROVED' : 'REJECTED' });
    http.expectOne(`${environment.apiBaseUrl}/api/leaves/getAllLeaves`).flush([]);
  });

  it('does not render a required approver ID field or validation message', () => {
    const fixture = TestBed.createComponent(LeaveList);
    fixture.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/api/leaves/getAllLeaves`).flush([leaveRecord]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#leave-approver')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Approver ID');
    expect(fixture.nativeElement.textContent).not.toContain('Enter a valid approver ID');
  });
});