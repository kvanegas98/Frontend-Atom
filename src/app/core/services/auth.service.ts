import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { UserResponse, CreateUserPayload } from '../models';
import { StorageService } from './storage.service';

/**
 * Servicio encargado de la autenticación de usuarios.
 * Gestiona login, registro y cierre de sesión contra la API de usuarios.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  private readonly baseUrl = `${environment.apiUrl}/users`;

  /**
   * Busca un usuario existente por su email.
   * Si lo encuentra, almacena el token de sesión automáticamente.
   * @param email Dirección de correo del usuario a buscar.
   * @returns Observable con los datos del usuario y su token.
   */
  getUserByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${encodeURIComponent(email)}`).pipe(
      tap(res => this.storage.setToken(res.token))
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * Almacena el token de sesión automáticamente tras la creación.
   * @param payload Datos del nuevo usuario (email).
   * @returns Observable con los datos del usuario creado y su token.
   */
  createUser(payload: CreateUserPayload): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl, payload).pipe(
      tap(res => this.storage.setToken(res.token))
    );
  }

  /** Cierra la sesión eliminando el token almacenado localmente. */
  logout(): void {
    this.storage.clearToken();
  }

  /** Verifica si existe una sesión activa comprobando la presencia del token. */
  isAuthenticated(): boolean {
    return this.storage.hasToken();
  }
}
