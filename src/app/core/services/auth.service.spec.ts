import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../models';

const BASE_URL = `${environment.apiUrl}/users`;

const mockUserResponse: UserResponse = {
  data: { id: 'u1', email: 'test@example.com', createdAt: '2024-01-01T00:00:00Z' },
  token: 'jwt-token-abc',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageSpy: { setToken: ReturnType<typeof vi.fn>; clearToken: ReturnType<typeof vi.fn>; hasToken: ReturnType<typeof vi.fn>; getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storageSpy = {
      setToken: vi.fn(),
      clearToken: vi.fn(),
      hasToken: vi.fn().mockReturnValue(false),
      getToken: vi.fn().mockReturnValue(null),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: StorageService, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getUserByEmail', () => {
    it('calls GET /users/:email and stores the token on success', () => {
      service.getUserByEmail('test@example.com').subscribe(res => {
        expect(res.token).toBe('jwt-token-abc');
        expect(res.data.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`${BASE_URL}/test%40example.com`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserResponse);

      expect(storageSpy.setToken).toHaveBeenCalledWith('jwt-token-abc');
    });

    it('propagates the 404 error when user is not found', () => {
      let errorStatus: number | undefined;

      service.getUserByEmail('unknown@example.com').subscribe({
        error: err => { errorStatus = err.status; },
      });

      const req = httpMock.expectOne(`${BASE_URL}/unknown%40example.com`);
      req.flush({ error: 'NotFoundError', message: 'User not found' }, { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
      expect(storageSpy.setToken).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('calls POST /users and stores the token on success', () => {
      service.createUser({ email: 'new@example.com' }).subscribe(res => {
        expect(res.token).toBe('jwt-token-abc');
      });

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'new@example.com' });
      req.flush(mockUserResponse);

      expect(storageSpy.setToken).toHaveBeenCalledWith('jwt-token-abc');
    });

    it('propagates the 409 error when email is already registered', () => {
      let errorStatus: number | undefined;

      service.createUser({ email: 'existing@example.com' }).subscribe({
        error: err => { errorStatus = err.status; },
      });

      const req = httpMock.expectOne(BASE_URL);
      req.flush({ error: 'ConflictError' }, { status: 409, statusText: 'Conflict' });

      expect(errorStatus).toBe(409);
      expect(storageSpy.setToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears the stored token', () => {
      service.logout();
      expect(storageSpy.clearToken).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token is stored', () => {
      storageSpy.hasToken.mockReturnValue(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('returns true when a token is stored', () => {
      storageSpy.hasToken.mockReturnValue(true);
      expect(service.isAuthenticated()).toBe(true);
    });
  });
});
