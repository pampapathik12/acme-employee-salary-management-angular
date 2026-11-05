import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/auth/services/auth';
import { FeatureKey } from '../../../../core/auth/constants/roles';
import { DashboardCounts, DashboardService } from '../../services/dashboard';

interface DashboardCard {
  feature: FeatureKey;
  label: string;
  icon: string;
  route: string;
}

const CARDS: DashboardCard[] = [
  { feature: 'employees', label: 'Employees', icon: 'pi pi-users', route: '/employees' },
  { feature: 'departments', label: 'Departments', icon: 'pi pi-building', route: '/departments' },
  { feature: 'designations', label: 'Designations', icon: 'pi pi-id-card', route: '/designations' },
  { feature: 'salaries', label: 'Salaries', icon: 'pi pi-wallet', route: '/salaries' },
  { feature: 'attendance', label: 'Attendance', icon: 'pi pi-calendar-check', route: '/attendance' },
  { feature: 'leaves', label: 'Leaves', icon: 'pi pi-calendar-minus', route: '/leaves' },
  { feature: 'payroll', label: 'Payroll', icon: 'pi pi-money-bill', route: '/payroll' },
];

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly auth = inject(Auth);
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly counts = signal<DashboardCounts>({});
  readonly visibleCards = computed(() => CARDS.filter((card) => this.auth.canAccess(card.feature)));
  readonly email = this.auth.email;

  ngOnInit(): void {
    this.dashboardService.loadCounts().subscribe({
      next: (counts) => {
        this.counts.set(counts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load dashboard data.');
        this.loading.set(false);
      },
    });
  }
}
