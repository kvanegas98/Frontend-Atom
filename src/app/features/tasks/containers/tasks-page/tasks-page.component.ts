import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from '../../../../core/models';

import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { EditTaskDialogComponent } from '../../components/edit-task-dialog/edit-task-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

/** Opciones de filtrado para la lista de tareas. */
export type TaskFilter = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    TaskItemComponent,
    TaskFormComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent implements OnInit {
  @ViewChild(TaskFormComponent) taskFormRef!: TaskFormComponent;

  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeFilter = signal<TaskFilter>('all');

  /** Tareas filtradas según el filtro activo. */
  readonly filteredTasks = computed(() => {
    const filter = this.activeFilter();
    const all = this.tasks();
    if (filter === 'all') return all;
    return all.filter(t => t.status === filter);
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  get pendingCount(): number {
    return this.tasks().filter(t => t.status === 'pending').length;
  }

  get completedCount(): number {
    return this.tasks().filter(t => t.status === 'completed').length;
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.getTasks().subscribe({
      next: res => {
        const sorted = [...res.data].sort((a, b) => {
          // Pendientes primero, completadas después
          if (a.status !== b.status) {
            return a.status === 'pending' ? -1 : 1;
          }
          // Dentro de cada grupo: más recientes primero
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.tasks.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las tareas. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  setFilter(filter: TaskFilter): void {
    this.activeFilter.set(filter);
  }

  onTaskCreated(payload: CreateTaskPayload): void {
    this.taskFormRef.setSubmitting(true);

    this.taskService.createTask(payload).subscribe({
      next: newTask => {
        this.tasks.update(list => {
          const updated = [...list, newTask];
          return updated.sort((a, b) => {
            if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        });
        this.taskFormRef.reset();
        this.showSuccess('Tarea creada exitosamente');
      },
      error: () => {
        this.taskFormRef.setSubmitting(false);
        this.showError('Error al crear la tarea');
      },
    });
  }

  onToggleStatus(task: Task): void {
    const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
    const payload: UpdateTaskPayload = { status: newStatus };

    this.taskService.updateTask(task.id, payload).subscribe({
      next: updated => {
        this.tasks.update(list => {
          const replaced = list.map(t => (t.id === updated.id ? updated : t));
          return replaced.sort((a, b) => {
            if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        });
      },
      error: () => this.showError('Error al actualizar el estado'),
    });
  }

  onEditTask(task: Task): void {
    const ref = this.dialog.open(EditTaskDialogComponent, {
      data: { task },
      width: '500px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((result: UpdateTaskPayload | null) => {
      if (!result) return;

      this.taskService.updateTask(task.id, result).subscribe({
        next: updated => {
          this.tasks.update(list =>
            list.map(t => (t.id === updated.id ? updated : t))
          );
          this.showSuccess('Tarea actualizada');
        },
        error: () => this.showError('Error al actualizar la tarea'),
      });
    });
  }

  onDeleteTask(task: Task): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar tarea',
        message: `¿Estás seguro de que deseas eliminar <strong>"${task.title}"</strong>? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.tasks.update(list => list.filter(t => t.id !== task.id));
          this.showSuccess('Tarea eliminada');
        },
        error: () => this.showError('Error al eliminar la tarea'),
      });
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: 'snack-success',
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: 'snack-error',
    });
  }
}
