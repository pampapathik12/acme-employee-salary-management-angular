import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing-module';
import { EmployeeList } from './components/employee-list/employee-list';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeDetails } from './components/employee-details/employee-details';

@NgModule({
  declarations: [EmployeeList, EmployeeForm, EmployeeDetails],
  imports: [CommonModule, EmployeesRoutingModule],
})
export class EmployeesModule {}
