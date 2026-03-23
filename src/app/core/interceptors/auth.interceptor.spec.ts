import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { StorageService } from '../services/storage.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let storageSpy: {
    getToken: ReturnType<typeof vi.fn>;
    clearToken: ReturnType<typeof vi.fn>;
    hasToken: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storageSpy = {
      getToken: vi.fn().mockReturnValue('mock-jwt'),
      clearToken: vi.fn(),
      hasToken: vi.fn().mockReturnValue(true),
      setToken: vi.fn(),
    };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega el header Authorization en requests a /tasks', () => {
    http.get(`${environment.apiUrl}/tasks`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt');
    req.flush([]);
  });

  it('no agrega el header en requests a /users', () => {
    http.get(`${environment.apiUrl}/users/test@test.com`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/users/test@test.com`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('no agrega el header si no hay token almacenado', () => {
    storageSpy.getToken.mockReturnValue(null);

    http.get(`${environment.apiUrl}/tasks`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('limpia el token y redirige a /auth/login cuando la API responde 401', () => {
    http.get(`${environment.apiUrl}/tasks`).subscribe({
      error: () => { /* esperado */ },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(storageSpy.clearToken).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('propaga errores no-401 sin limpiar el token', () => {
    let errorStatus: number | undefined;

    http.get(`${environment.apiUrl}/tasks`).subscribe({
      error: err => { errorStatus = err.status; },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(errorStatus).toBe(500);
    expect(storageSpy.clearToken).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
