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
      if (err.status === 401 && !isLoginCall) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
