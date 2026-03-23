import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';

/**
 * Servicio de persistencia local para el token de autenticación.
 * Abstrae el acceso a localStorage para facilitar el testing y futuras migraciones.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Recupera el token almacenado, o `null` si no existe. */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Almacena el token de sesión en localStorage. */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /** Elimina el token de sesión de localStorage. */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /** Indica si existe un token de sesión almacenado. */
  hasToken(): boolean {
    return !!this.getToken();
  }
}
