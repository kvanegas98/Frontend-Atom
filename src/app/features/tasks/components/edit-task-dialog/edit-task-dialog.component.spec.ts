import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import {
  EditTaskDialogComponent,
  EditTaskDialogData,
} from './edit-task-dialog.component';
import { Task } from '../../../../core/models';

const mockTask: Task = {
  id: 't-edit-1',
  userId: 'u1',
  title: 'Tarea original',
  description: 'Descripción original',
  status: 'pending',
  createdAt: '2024-06-01T12:00:00Z',
  updatedAt: '2024-06-01T12:00:00Z',
};

const dialogData: EditTaskDialogData = { task: mockTask };

function createDialogRefSpy() {
  return { close: vi.fn() };
}

describe('EditTaskDialogComponent', () => {
  let dialogRefSpy: ReturnType<typeof createDialogRefSpy>;

  beforeEach(async () => {
    dialogRefSpy = createDialogRefSpy();

    await TestBed.configureTestingModule({
      imports: [EditTaskDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();
  });

  it('crea el componente correctamente', () => {
    const fixture = TestBed.createComponent(EditTaskDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('inicializa el formulario con los datos de la tarea existente', () => {
    const fixture = TestBed.createComponent(EditTaskDialogComponent);
    const comp = fixture.componentInstance;

    expect(comp.titleControl.value).toBe('Tarea original');
    expect(comp.descriptionControl.value).toBe('Descripción original');
  });

  it('save() cierra el dialog con los datos actualizados', () => {
    const fixture = TestBed.createComponent(EditTaskDialogComponent);
    const comp = fixture.componentInstance;

    comp.titleControl.setValue('Título editado');
    comp.descriptionControl.setValue('  Nueva descripción  ');
    comp.save();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      title: 'Título editado',
      description: 'Nueva descripción',
    });
  });

  it('save() no cierra el dialog si el formulario es inválido', () => {
    const fixture = TestBed.createComponent(EditTaskDialogComponent);
    const comp = fixture.componentInstance;

    comp.titleControl.setValue('');
    comp.save();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
    expect(comp.titleControl.touched).toBe(true);
  });

  it('cancel() cierra el dialog con null', () => {
    const fixture = TestBed.createComponent(EditTaskDialogComponent);
    const comp = fixture.componentInstance;

    comp.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
  });

  it('validación de maxlength funciona en el título', () => {
    const fixture = TestBed.createComponent(EditTaskDialogComponent);
    const comp = fixture.componentInstance;

    comp.titleControl.setValue('x'.repeat(201));
    expect(comp.titleControl.hasError('maxlength')).toBe(true);
  });
});
