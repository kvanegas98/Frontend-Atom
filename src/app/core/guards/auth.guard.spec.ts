import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { authGuard, guestGuard } from './auth.guard';
import { StorageService } from '../services/storage.service';

function runGuard(
  guard: typeof authGuard | typeof guestGuard,
  hasToken: boolean
): boolean | UrlTree {
  const storageSpy = { hasToken: vi.fn().mockReturnValue(hasToken) };

  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [{ provide: StorageService, useValue: storageSpy }],
  });

  return TestBed.runInInjectionContext(() =>
    guard({} as never, {} as never)
  ) as boolean | UrlTree;
}

describe('authGuard', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('returns true when a token exists', () => {
    const result = runGuard(authGuard, true);
    expect(result).toBe(true);
  });

  it('returns a UrlTree redirecting to /auth/login when no token', () => {
    const result = runGuard(authGuard, false);
    expect(result).toBeInstanceOf(UrlTree);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});

describe('guestGuard', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('returns true when no token exists (user is a guest)', () => {
    const result = runGuard(guestGuard, false);
    expect(result).toBe(true);
  });

  it('returns a UrlTree redirecting to /tasks when already authenticated', () => {
    const result = runGuard(guestGuard, true);
    expect(result).toBeInstanceOf(UrlTree);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe('/tasks');
  });
});
