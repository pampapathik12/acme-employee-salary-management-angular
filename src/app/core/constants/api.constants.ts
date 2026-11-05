export const API_PATHS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  employees: '/api/employees',
  departments: '/api/departments',
  designations: '/api/designations',
  salaries: '/api/salaries',
  attendance: '/api/attendance',
  leaves: '/api/leaves',
  payroll: '/api/payroll',
  payrollPeriods: '/api/payroll-periods',
} as const;

export const SESSION_STORAGE_KEY = 'acme.session';
