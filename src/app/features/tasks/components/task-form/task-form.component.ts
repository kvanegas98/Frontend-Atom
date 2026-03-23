import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CreateTaskPayload } from '../../../../core/models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  @Output() taskCreated = new EventEmitter<CreateTaskPayload>();
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly cdRef = inject(ChangeDetectorRef);

  readonly submitting = signal(false);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(1000)]],
  });

  get titleControl() {
    return this.form.controls.title;
  }

  get descriptionControl() {
    return this.form.controls.description;
  }

  setSubmitting(value: boolean): void {
    this.submitting.set(value);
    if (value) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateTaskPayload = {
      title: (this.titleControl.value ?? '').trim(),
      description: (this.descriptionControl.value ?? '').trim() || undefined,
    };

    this.taskCreated.emit(payload);
  }

  reset(): void {
    this.submitting.set(false);
    this.form.reset({ title: '', description: '' });
    this.form.enable();
    this.cdRef.detectChanges();

    // Re-enfocar el input de título para que el usuario pueda agregar otra tarea
    setTimeout(() => this.titleInput?.nativeElement?.focus(), 0);
  }
}
