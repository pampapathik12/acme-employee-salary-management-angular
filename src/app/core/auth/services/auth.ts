import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Api } from '../../services/api';
import { API_PATHS, SESSION_STORAGE_KEY } from '../../constants/api.constants';
import { FEATURE_ROLES, FeatureKey } from '../constants/roles';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';

export interface AuthSession {
  token: string;
  tokenType: string;
  email: string;
  role: string;
  id: number | null;
}

@Service()
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly sessionState = signal<AuthSession | null>(this.loadSession());

  readonly session = this.sessionState.asReadonly();
  readonly role = computed(() => this.sessionState()?.role ?? null);
  readonly email = computed(() => this.sessionState()?.email ?? null);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(API_PATHS.login, request).pipe(
      tap((res) =>
        this.saveSession({
          token: res.token,
          tokenType: res.tokenType,
          email: res.email,
          role: res.role,
          id: res.id ?? null,
        }),
      ),
    );
  }

  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.sessionState.set(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return this.sessionState()?.token ?? null;
  }

  get userId(): number | null {
    return this.sessionState()?.id ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const role = this.role();
    return !!role && roles.includes(role);
  }

  canAccess(feature: FeatureKey): boolean {
    return this.hasAnyRole(FEATURE_ROLES[feature]);
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private loadSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
