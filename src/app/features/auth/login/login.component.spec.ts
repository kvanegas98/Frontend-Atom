import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse } from '../../../core/models';

const mockUserResponse: UserResponse = {
  data: { id: 'u1', email: 'test@example.com', createdAt: '2024-01-01T00:00:00Z' },
  token: 'jwt-abc',
};

describe('LoginComponent', () => {
  let authServiceSpy: {
    getUserByEmail: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let dialogSpy: { open: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceSpy = {
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
      logout: vi.fn(),
    };
    dialogSpy = { open: vi.fn() };
    snackBarSpy = { open: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('marks form as touched and does NOT call API when submitted with invalid email', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.controls.email.setValue('');
    component.onSubmit();

    expect(authServiceSpy.getUserByEmail).not.toHaveBeenCalled();
    expect(component.emailControl.touched).toBe(true);
  });

  it('navigates to /tasks when user exists (200) — synchronous observable', () => {
    // of() completes synchronously, no fakeAsync needed
    authServiceSpy.getUserByEmail.mockReturnValue(of(mockUserResponse));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.controls.email.setValue('test@example.com');
    component.onSubmit();

    expect(authServiceSpy.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('opens a confirmation dialog when user is not found (404)', () => {
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    authServiceSpy.getUserByEmail.mockReturnValue(throwError(() => error));
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) });

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.controls.email.setValue('new@example.com');
    component.onSubmit();

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('creates user and navigates to /tasks when dialog is confirmed', () => {
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    authServiceSpy.getUserByEmail.mockReturnValue(throwError(() => error));
    authServiceSpy.createUser.mockReturnValue(of(mockUserResponse));
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) });

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.controls.email.setValue('new@example.com');
    component.onSubmit();

    expect(authServiceSpy.createUser).toHaveBeenCalledWith({ email: 'new@example.com' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('shows an error snackbar on unexpected API errors (5xx)', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    authServiceSpy.getUserByEmail.mockReturnValue(throwError(() => error));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.controls.email.setValue('test@example.com');
    component.onSubmit();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Error al iniciar sesión. Intenta de nuevo.',
      'Cerrar',
      expect.objectContaining({ panelClass: 'snack-error' })
    );
  });
});
