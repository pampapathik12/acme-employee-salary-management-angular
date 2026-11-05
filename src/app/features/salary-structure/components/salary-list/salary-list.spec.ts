import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { API_PATHS } from '../../../../core/constants/api.constants';
import { Api } from '../../../../core/services/api';
import { SalaryService } from '../../services/salary';
import { SalaryStructureModule } from '../../salary-structure-module';
import { SalaryList } from './salary-list';

describe('Salary assignment', () => {
  const record = {
    id: 7, employeeId: 12, salary: 10000000, relatedTypeId: 1, amount: 10000000,
    firstName: 'Asha', lastName: 'Patel', email: 'asha@example.com', phone: '9876543210',
    department: 'Engineering', designation: 'Developer', joiningDate: '2026-01-15',
  };
  let component: SalaryList;
  let api: { post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      post: vi.fn().mockReturnValue(of(record)),
      put: vi.fn().mockReturnValue(of(record)),
      get: vi.fn().mockReturnValue(of([])),
    };
    TestBed.configureTestingModule({
      imports: [SalaryStructureModule],
      providers: [
        FormBuilder,
        SalaryService,
        ConfirmationService,
        MessageService,
        { provide: Api, useValue: api },
      ],
    });
    component = TestBed.runInInjectionContext(() => new SalaryList());
  });

  it('requires an employee and salary before submitting', () => {
    component.openCreate();
    component.save();
    expect(component.form.controls.employeeId.hasError('required')).toBe(true);
    expect(component.form.controls.salary.hasError('required')).toBe(true);
    expect(api.post).not.toHaveBeenCalled();

    component.form.controls.salary.setValue(record.salary);
    component.save();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('rejects invalid employee IDs and negative salaries', () => {
    for (const employeeId of [0, -1, 1.5]) {
      component.form.setValue({ employeeId, salary: record.salary });
      component.save();
      expect(component.form.invalid).toBe(true);
    }
    component.form.setValue({ employeeId: record.employeeId, salary: -1 });
    component.save();
    expect(component.form.invalid).toBe(true);
    expect(api.post).not.toHaveBeenCalled();
  });

  it('posts only the required salary assignment fields', () => {
    component.form.setValue({ employeeId: record.employeeId, salary: record.salary });
    component.save();
    expect(api.post).toHaveBeenCalledExactlyOnceWith(`${API_PATHS.salaries}/addSalary`, {
      employeeId: 12,
      salary: 10000000,
    });
  });

  it('preserves the employee ID when editing and puts the assignment fields', () => {
    component.openEdit(record);
    expect(component.form.getRawValue()).toEqual({ employeeId: 12, salary: 10000000 });
    component.form.controls.salary.setValue(2000);
    component.save();
    expect(api.put).toHaveBeenCalledExactlyOnceWith(`${API_PATHS.salaries}/updateSalary/7`, {
      employeeId: 12,
      salary: 2000,
      salaryComponentId: 1,
    });
  });

  it('clears the previous assignment when adding a salary', () => {
    component.openEdit(record);
    component.openCreate();
    expect(component.form.getRawValue()).toEqual({ employeeId: null, salary: null });
    expect(component.form.invalid).toBe(true);
  });

  it('does not reuse the previous component when adding a salary', () => {
    component.openEdit(record);
    component.openCreate();
    component.form.setValue({ employeeId: 4, salary: 75000 });
    component.save();
    expect(api.post).toHaveBeenCalledExactlyOnceWith(`${API_PATHS.salaries}/addSalary`, {
      employeeId: 4,
      salary: 75000,
    });
  });
});