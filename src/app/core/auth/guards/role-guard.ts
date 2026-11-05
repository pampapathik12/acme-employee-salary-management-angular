import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const roles = route.data['roles'] as readonly string[] | undefined;
  if (!roles || inject(Auth).hasAnyRole(roles)) {
    return true;
  }
  return inject(Router).createUrlTree(['/dashboard']);
};
