import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeList } from './components/employee-list/employee-list';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeDetails } from './components/employee-details/employee-details';

const routes: Routes = [
  { path: '', component: EmployeeList },
  { path: 'new', component: EmployeeForm },
  { path: ':id', component: EmployeeDetails },
  { path: ':id/edit', component: EmployeeForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeesRoutingModule {}
