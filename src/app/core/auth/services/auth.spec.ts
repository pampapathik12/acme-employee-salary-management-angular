import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { SESSION_STORAGE_KEY } from '../../constants/api.constants';
import { authInterceptor } from '../../interceptors/auth-interceptor';
import { errorInterceptor } from '../../interceptors/error-interceptor';
import { Api } from '../../services/api';
import { Auth } from './auth';

describe('Auth logout', () => {
  let auth: Auth;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      token: 'test-jwt', tokenType: 'Bearer', email: 'admin@example.com', role: 'ADMIN', id: 2,
    }));
    navigate = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        Api,
        Auth,
        { provide: Router, useValue: { navigate } },
      ],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('posts logout with the JWT before clearing the session', () => {
    auth.logout();
    const request = http.expectOne(`${environment.apiBaseUrl}/api/auth/logout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-jwt');
    expect(request.request.body).toBeNull();
    expect(auth.token).toBe('test-jwt');
    expect(auth.loggingOut()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(auth.session()).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(auth.loggingOut()).toBe(false);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/login']);
  });

  it('does not send duplicate logout requests while one is pending', () => {
    auth.logout();
    auth.logout();
    http.expectOne(`${environment.apiBaseUrl}/api/auth/logout`).flush({ message: 'Logged out' });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('clears local credentials if the logout endpoint fails', () => {
    auth.logout();
    http.expectOne(`${environment.apiBaseUrl}/api/auth/logout`).flush(
      { message: 'Unavailable' }, { status: 500, statusText: 'Server Error' },
    );
    expect(auth.token).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(auth.loggingOut()).toBe(false);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/login']);
  });

  it.each([401, 403])('handles logout status %s without recursive requests', (status) => {
    auth.logout();
    http.expectOne(`${environment.apiBaseUrl}/api/auth/logout`).flush(
      { message: 'Expired token' }, { status, statusText: status === 401 ? 'Unauthorized' : 'Forbidden' },
    );
    expect(auth.token).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/login']);
    http.expectNone(`${environment.apiBaseUrl}/api/auth/logout`);
  });

  it.each([401, 403])('clears the session and redirects on API status %s without calling logout', (status) => {
    const onError = vi.fn();
    TestBed.inject(Api).get('/api/employees/getAllEmployees').subscribe({ error: onError });
    http.expectOne(`${environment.apiBaseUrl}/api/employees/getAllEmployees`).flush(
      { message: 'Expired token' }, { status, statusText: status === 401 ? 'Unauthorized' : 'Forbidden' },
    );
    expect(auth.token).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/login']);
    expect(onError).toHaveBeenCalledTimes(1);
    http.expectNone(`${environment.apiBaseUrl}/api/auth/logout`);
  });

  it('does not call logout without a local token', () => {
    auth.clearSession();
    navigate.mockClear();
    auth.logout();
    http.expectNone(`${environment.apiBaseUrl}/api/auth/logout`);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(['/login']);
  });

  it.each([401, 403])('does not redirect when login returns status %s', (status) => {
    auth.login({ email: 'admin@example.com', password: 'test-password' }).subscribe({ error: () => {} });
    http.expectOne(`${environment.apiBaseUrl}/api/auth/login`).flush(
      { message: 'Invalid credentials' }, { status, statusText: status === 401 ? 'Unauthorized' : 'Forbidden' },
    );
    expect(navigate).not.toHaveBeenCalled();
    http.expectNone(`${environment.apiBaseUrl}/api/auth/logout`);
  });

  it('does not clear the session for unrelated server errors', () => {
    TestBed.inject(Api).get('/api/employees/getAllEmployees').subscribe({ error: () => {} });
    http.expectOne(`${environment.apiBaseUrl}/api/employees/getAllEmployees`).flush(
      { message: 'Unavailable' }, { status: 500, statusText: 'Server Error' },
    );
    expect(auth.token).toBe('test-jwt');
    expect(navigate).not.toHaveBeenCalled();
  });
});