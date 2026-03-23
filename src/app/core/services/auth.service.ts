import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { UserResponse, CreateUserPayload } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUserByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${encodeURIComponent(email)}`).pipe(
      tap(res => this.storage.setToken(res.token))
    );
  }

  createUser(payload: CreateUserPayload): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl, payload).pipe(
      tap(res => this.storage.setToken(res.token))
    );
  }

  logout(): void {
    this.storage.clearToken();
  }

  isAuthenticated(): boolean {
    return this.storage.hasToken();
  }
}
