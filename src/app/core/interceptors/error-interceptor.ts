import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../auth/services/auth';
import { API_PATHS } from '../constants/api.constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isLoginCall = req.url.endsWith(API_PATHS.login);
      const isLogoutCall = req.url.endsWith(API_PATHS.logout);
      if ((err.status === 401 || err.status === 403) && !isLoginCall && !isLogoutCall) {
        auth.clearSession();
      }
      return throwError(() => err);
    }),
  );
};
