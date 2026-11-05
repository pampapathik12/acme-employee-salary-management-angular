export const API_PATHS = {
  login: '/api/auth/login',
  employees: '/api/employees',
  departments: '/api/departments',
  designations: '/api/designations',
  salaries: '/api/salaries',
  attendance: '/api/attendance',
  leaves: '/api/leaves',
  payroll: '/api/payroll',
} as const;

export const SESSION_STORAGE_KEY = 'acme.session';
