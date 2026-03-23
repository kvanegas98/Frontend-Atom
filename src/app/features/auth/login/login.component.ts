import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';

import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../tasks/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    AutoFocusDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailControl() {
    return this.form.controls.email;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.emailControl.value as string;
    this.loading.set(true);

    this.authService.getUserByEmail(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tasks']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.openCreateUserDialog(email);
        } else {
          this.snackBar.open('Error al iniciar sesión. Intenta de nuevo.', 'Cerrar', {
            duration: 4000,
            panelClass: 'snack-error',
          });
        }
      },
    });
  }

  private openCreateUserDialog(email: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usuario no encontrado',
        message: `No existe una cuenta con el email <strong>${email}</strong>. ¿Deseas crearla?`,
        confirmLabel: 'Crear cuenta',
        cancelLabel: 'Cancelar',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.loading.set(true);
      this.authService.createUser({ email }).subscribe({
        next: () => {
          this.loading.set(false);
          this.snackBar.open('Cuenta creada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: 'snack-success',
          });
          this.router.navigate(['/tasks']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const msg =
            err.status === 409
              ? 'El email ya está registrado.'
              : 'Error al crear la cuenta.';
          this.snackBar.open(msg, 'Cerrar', {
            duration: 4000,
            panelClass: 'snack-error',
          });
        },
      });
    });
  }
}
