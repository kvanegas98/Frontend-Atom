import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { TasksPageComponent } from './tasks-page.component';
import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Task, TasksResponse } from '../../../../core/models';

const mockTask: Task = {
  id: 't1',
  userId: 'u1',
  title: 'Do laundry',
  description: 'Use cold water',
  status: 'pending',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockTasksResponse: TasksResponse = {
  data: [mockTask],
  nextCursor: null,
  hasMore: false,
};

function createTaskServiceSpy() {
  return {
    getTasks: vi.fn().mockReturnValue(of(mockTasksResponse)),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  };
}

describe('TasksPageComponent', () => {
  let taskServiceSpy: ReturnType<typeof createTaskServiceSpy>;
  let authServiceSpy: { logout: ReturnType<typeof vi.fn> };
  let dialogSpy: { open: ReturnType<typeof vi.fn> };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    taskServiceSpy = createTaskServiceSpy();
    authServiceSpy = { logout: vi.fn() };
    dialogSpy = { open: vi.fn() };
    snackBarSpy = { open: vi.fn() };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        TasksPageComponent,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('should create and load tasks on init', () => {
    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(taskServiceSpy.getTasks).toHaveBeenCalled();
    expect(component.tasks()).toHaveLength(1);
    expect(component.tasks()[0].id).toBe('t1');
  });

  it('sorts tasks by createdAt ascending', () => {
    const older: Task = { ...mockTask, id: 't0', createdAt: '2024-01-10T00:00:00Z' };
    const newer: Task = { ...mockTask, id: 't2', createdAt: '2024-01-20T00:00:00Z' };
    taskServiceSpy.getTasks.mockReturnValue(
      of({ data: [newer, older, mockTask], nextCursor: null, hasMore: false })
    );

    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const ids = component.tasks().map(t => t.id);
    expect(ids).toEqual(['t0', 't1', 't2']);
  });

  it('sets error signal when getTasks fails', () => {
    taskServiceSpy.getTasks.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error()).toBe('No se pudieron cargar las tareas. Intenta de nuevo.');
    expect(component.tasks()).toHaveLength(0);
  });

  it('adds new task to list and shows success snackbar', () => {
    taskServiceSpy.createTask.mockReturnValue(of({ ...mockTask, id: 't2', title: 'New' }));

    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onTaskCreated({ title: 'New' });

    expect(component.tasks()).toHaveLength(2);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Tarea creada exitosamente',
      'Cerrar',
      expect.objectContaining({ panelClass: 'snack-success' })
    );
  });

  it('toggles task status from pending to completed', () => {
    const updated: Task = { ...mockTask, status: 'completed' };
    taskServiceSpy.updateTask.mockReturnValue(of(updated));

    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onToggleStatus(mockTask);

    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith('t1', { status: 'completed' });
    expect(component.tasks()[0].status).toBe('completed');
  });

  it('removes deleted task from list and shows success snackbar', () => {
    taskServiceSpy.deleteTask.mockReturnValue(of(undefined));
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) });

    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onDeleteTask(mockTask);

    expect(component.tasks()).toHaveLength(0);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Tarea eliminada',
      'Cerrar',
      expect.objectContaining({ panelClass: 'snack-success' })
    );
  });

  it('does NOT delete task when confirmation dialog is cancelled', () => {
    dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) });

    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onDeleteTask(mockTask);

    expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
    expect(component.tasks()).toHaveLength(1);
  });

  it('calls authService.logout and navigates to /auth/login on logout', () => {
    const fixture = TestBed.createComponent(TasksPageComponent);
    const component = fixture.componentInstance;

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  describe('pendingCount and completedCount', () => {
    it('returns correct counts', () => {
      const completed: Task = { ...mockTask, id: 't2', status: 'completed' };
      taskServiceSpy.getTasks.mockReturnValue(
        of({ data: [mockTask, completed], nextCursor: null, hasMore: false })
      );

      const fixture = TestBed.createComponent(TasksPageComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.pendingCount).toBe(1);
      expect(component.completedCount).toBe(1);
    });
  });
});
