import { Component, computed, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Auth } from '../../core/auth/services/auth';
import { FeatureKey } from '../../core/auth/constants/roles';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  feature?: FeatureKey;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
  { label: 'Employees', icon: 'pi pi-users', route: '/employees', feature: 'employees' },
  { label: 'Departments', icon: 'pi pi-building', route: '/departments', feature: 'departments' },
  { label: 'Designations', icon: 'pi pi-id-card', route: '/designations', feature: 'designations' },
  { label: 'Salaries', icon: 'pi pi-wallet', route: '/salaries', feature: 'salaries' },
  { label: 'Attendance', icon: 'pi pi-calendar-check', route: '/attendance', feature: 'attendance' },
  { label: 'Leaves', icon: 'pi pi-calendar-minus', route: '/leaves', feature: 'leaves' },
  { label: 'Payroll', icon: 'pi pi-money-bill', route: '/payroll', feature: 'payroll' },
];

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly auth = inject(Auth);

  readonly items = computed<MenuItem[]>(() =>
    NAV_ITEMS.filter((item) => !item.feature || this.auth.canAccess(item.feature)).map((item) => ({
      label: item.label,
      icon: item.icon,
      routerLink: item.route,
    })),
  );
}
