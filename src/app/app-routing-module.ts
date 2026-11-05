import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/auth/guards/auth-guard';
import { roleGuard } from './core/auth/guards/role-guard';
import { FEATURE_ROLES } from './core/auth/constants/roles';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard-module').then((m) => m.DashboardModule),
      },
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.employees },
        loadChildren: () => import('./features/employees/employees-module').then((m) => m.EmployeesModule),
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.departments },
        loadChildren: () => import('./features/departments/departments-module').then((m) => m.DepartmentsModule),
      },
      {
        path: 'designations',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.designations },
        loadChildren: () => import('./features/designations/designations-module').then((m) => m.DesignationsModule),
      },
      {
        path: 'salaries',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.salaries },
        loadChildren: () => import('./features/salary-structure/salary-structure-module').then((m) => m.SalaryStructureModule),
      },
      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.attendance },
        loadChildren: () => import('./features/attendance/attendance-module').then((m) => m.AttendanceModule),
      },
      {
        path: 'leaves',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.leaves },
        loadChildren: () => import('./features/leave-management/leave-management-module').then((m) => m.LeaveManagementModule),
      },
      {
        path: 'payroll',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.payroll },
        loadChildren: () => import('./features/payroll/payroll-module').then((m) => m.PayrollModule),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

