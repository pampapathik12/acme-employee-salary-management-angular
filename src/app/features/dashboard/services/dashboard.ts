import { Service, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { Api } from '../../../core/services/api';
import { Auth } from '../../../core/auth/services/auth';
import { API_PATHS } from '../../../core/constants/api.constants';
import { FeatureKey } from '../../../core/auth/constants/roles';

export type DashboardCounts = Partial<Record<FeatureKey, number>>;

const COUNTED_FEATURES: { feature: FeatureKey; path: string }[] = [
  { feature: 'employees', path: API_PATHS.employees },
  { feature: 'departments', path: API_PATHS.departments },
  { feature: 'designations', path: API_PATHS.designations },
  { feature: 'salaries', path: API_PATHS.salaries },
  { feature: 'attendance', path: API_PATHS.attendance },
  { feature: 'leaves', path: API_PATHS.leaves },
  { feature: 'payroll', path: API_PATHS.payroll },
];

@Service()
export class DashboardService {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);

  loadCounts(): Observable<DashboardCounts> {
    const requests = COUNTED_FEATURES.filter((c) => this.auth.canAccess(c.feature)).map((c) =>
      this.api.get<unknown[]>(c.path).pipe(map((list) => [c.feature, list.length] as const)),
    );
    if (requests.length === 0) {
      return of({});
    }
    return forkJoin(requests).pipe(map((entries) => Object.fromEntries(entries) as DashboardCounts));
  }
}
