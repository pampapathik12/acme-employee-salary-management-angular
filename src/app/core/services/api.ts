import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type QueryParams = Record<string, string | number | boolean | null | undefined>;

@Service()
export class Api {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.toParams(params) });
  }

  post<T>(path: string, body: unknown = null, params?: QueryParams): Observable<T> {
    return this.http.post<T>(this.url(path), body, { params: this.toParams(params) });
  }

  put<T>(path: string, body: unknown = null, params?: QueryParams): Observable<T> {
    return this.http.put<T>(this.url(path), body, { params: this.toParams(params) });
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(this.url(path));
  }

  private url(path: string): string {
    return `${environment.apiBaseUrl}${path}`;
  }

  private toParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
