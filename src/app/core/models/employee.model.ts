export interface EmployeeRequest {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  designation: string | null;
  salary: number | null;
  joiningDate: string | null;
}

export interface EmployeeResponse extends EmployeeRequest {
  id: number;
}

export function buildEmployeeRequest(partial: Partial<EmployeeRequest> = {}): EmployeeRequest {
  return {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    department: null,
    designation: null,
    salary: null,
    joiningDate: null,
    ...partial,
  };
}
