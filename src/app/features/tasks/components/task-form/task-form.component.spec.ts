import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TaskFormComponent } from './task-form.component';
import { CreateTaskPayload } from '../../../../core/models';

describe('TaskFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  // ── Creación ────────────────────────────────────────────────────────────────

  it('crea el componente correctamente', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────────────────

  it('inicia con los campos vacíos y submitting en false', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    expect(comp.titleControl.value).toBe('');
    expect(comp.descriptionControl.value).toBe('');
    expect(comp.submitting()).toBe(false);
  });

  // ── Validaciones ────────────────────────────────────────────────────────────

  it('el formulario es inválido si el título está vacío', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.form.valid).toBe(false);
    expect(comp.titleControl.hasError('required')).toBe(true);
  });

  it('el formulario es válido con un título no vacío', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.titleControl.setValue('Comprar leche');
    fixture.detectChanges();

    expect(comp.form.valid).toBe(true);
  });

  it('falla la validación si el título supera 200 caracteres', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.titleControl.setValue('x'.repeat(201));

    expect(comp.titleControl.hasError('maxlength')).toBe(true);
  });

  it('falla la validación si la descripción supera 1000 caracteres', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.descriptionControl.setValue('y'.repeat(1001));

    expect(comp.descriptionControl.hasError('maxlength')).toBe(true);
  });

  // ── Emisión de eventos ──────────────────────────────────────────────────────

  it('emite taskCreated con el payload limpio al hacer submit', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;
    let emitted: CreateTaskPayload | undefined;

    comp.taskCreated.subscribe((p: CreateTaskPayload) => (emitted = p));
    comp.titleControl.setValue('  Hacer ejercicio  ');
    comp.descriptionControl.setValue('  30 minutos  ');

    comp.submit();

    expect(emitted).toEqual({
      title: 'Hacer ejercicio',
      description: '30 minutos',
    });
  });

  it('emite description como undefined si está vacía', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;
    let emitted: CreateTaskPayload | undefined;

    comp.taskCreated.subscribe((p: CreateTaskPayload) => (emitted = p));
    comp.titleControl.setValue('Sin descripción');
    comp.descriptionControl.setValue('   ');

    comp.submit();

    expect(emitted?.description).toBeUndefined();
  });

  it('no emite taskCreated si el formulario es inválido', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;
    let emitted = false;

    comp.taskCreated.subscribe(() => (emitted = true));
    comp.submit();

    expect(emitted).toBe(false);
  });

  it('marca todos los controles como touched al enviar formulario inválido', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.submit();

    expect(comp.titleControl.touched).toBe(true);
  });

  // ── setSubmitting ───────────────────────────────────────────────────────────

  it('deshabilita el formulario al llamar setSubmitting(true)', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.setSubmitting(true);

    expect(comp.submitting()).toBe(true);
    expect(comp.form.disabled).toBe(true);
  });

  it('habilita el formulario al llamar setSubmitting(false)', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.setSubmitting(true);
    comp.setSubmitting(false);

    expect(comp.submitting()).toBe(false);
    expect(comp.form.enabled).toBe(true);
  });

  // ── reset ──────────────────────────────────────────────────────────────────

  it('reset limpia el formulario y lo vuelve a habilitar', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const comp = fixture.componentInstance;

    comp.titleControl.setValue('Tarea temporal');
    comp.setSubmitting(true);
    comp.reset();

    expect(comp.titleControl.value).toBe('');
    expect(comp.descriptionControl.value).toBe('');
    expect(comp.submitting()).toBe(false);
    expect(comp.form.enabled).toBe(true);
  });
});
