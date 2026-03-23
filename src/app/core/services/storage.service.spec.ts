import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('returns null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('returns the stored token', () => {
      localStorage.setItem('auth_token', 'abc123');
      expect(service.getToken()).toBe('abc123');
    });
  });

  describe('setToken', () => {
    it('persists the token in localStorage', () => {
      service.setToken('my-jwt');
      expect(localStorage.getItem('auth_token')).toBe('my-jwt');
    });
  });

  describe('clearToken', () => {
    it('removes the token from localStorage', () => {
      service.setToken('my-jwt');
      service.clearToken();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('hasToken', () => {
    it('returns false when no token is stored', () => {
      expect(service.hasToken()).toBe(false);
    });

    it('returns true when a token is stored', () => {
      service.setToken('my-jwt');
      expect(service.hasToken()).toBe(true);
    });
  });
});
