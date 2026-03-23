import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TaskItemComponent } from './task-item.component';
import { Task } from '../../../../core/models';

const baseTask: Task = {
  id: 't1',
  userId: 'u1',
  title: 'Comprar víveres',
  description: 'Leche, pan y huevos',
  status: 'pending',
  createdAt: '2024-03-01T10:00:00Z',
  updatedAt: '2024-03-01T10:00:00Z',
};

const longText =
  'Esta es una descripción muy larga que supera el límite de ciento veinte caracteres ' +
  'para poder verificar que el truncamiento funciona correctamente en el componente.';

describe('TaskItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  // ── isCompleted ────────────────────────────────────────────────────────────

  describe('isCompleted', () => {
    it('devuelve false cuando el estado es pending', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, status: 'pending' };
      fixture.detectChanges();
      expect(fixture.componentInstance.isCompleted).toBe(false);
    });

    it('devuelve true cuando el estado es completed', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, status: 'completed' };
      fixture.detectChanges();
      expect(fixture.componentInstance.isCompleted).toBe(true);
    });
  });

  // ── isLongDescription ──────────────────────────────────────────────────────

  describe('isLongDescription', () => {
    it('devuelve false cuando la descripción es corta', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: 'Corta' };
      fixture.detectChanges();
      expect(fixture.componentInstance.isLongDescription).toBe(false);
    });

    it('devuelve true cuando la descripción supera 120 caracteres', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: longText };
      fixture.detectChanges();
      expect(fixture.componentInstance.isLongDescription).toBe(true);
    });

    it('devuelve false cuando no hay descripción', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: '' };
      fixture.detectChanges();
      expect(fixture.componentInstance.isLongDescription).toBe(false);
    });
  });

  // ── visibleDescription ─────────────────────────────────────────────────────

  describe('visibleDescription', () => {
    it('devuelve cadena vacía si no hay descripción', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: '' };
      fixture.detectChanges();
      expect(fixture.componentInstance.visibleDescription).toBe('');
    });

    it('devuelve el texto completo si la descripción es corta', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: 'Corta' };
      fixture.detectChanges();
      expect(fixture.componentInstance.visibleDescription).toBe('Corta');
    });

    it('trunca la descripción larga cuando expanded es false', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask, description: longText };
      component.expanded.set(false);
      fixture.detectChanges();

      const result = component.visibleDescription;
      expect(result.endsWith('…')).toBe(true);
      expect(result.length).toBeLessThan(longText.length);
    });

    it('devuelve el texto completo cuando expanded es true', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask, description: longText };
      component.expanded.set(true);
      fixture.detectChanges();

      expect(component.visibleDescription).toBe(longText);
    });
  });

  // ── expanded toggle ────────────────────────────────────────────────────────

  describe('toggle "Ver más / Ver menos"', () => {
    it('expanded empieza en false', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: longText };
      fixture.detectChanges();
      expect(fixture.componentInstance.expanded()).toBe(false);
    });

    it('el botón "Ver más" aparece cuando la descripción es larga y está colapsada', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: longText };
      fixture.detectChanges();

      const btn: HTMLElement = fixture.nativeElement.querySelector('.task-item__expand');
      expect(btn).not.toBeNull();
      expect(btn.textContent?.trim()).toBe('Ver más');
    });

    it('al hacer click en "Ver más" expande la descripción', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask, description: longText };
      fixture.detectChanges();

      const btn: HTMLElement = fixture.nativeElement.querySelector('.task-item__expand');
      btn.click();
      fixture.detectChanges();

      expect(component.expanded()).toBe(true);
      expect(btn.textContent?.trim()).toBe('Ver menos');
    });

    it('no muestra el botón "Ver más" si la descripción es corta', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, description: 'Corta' };
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.task-item__expand');
      expect(btn).toBeNull();
    });
  });

  // ── @Output emitters ───────────────────────────────────────────────────────

  describe('outputs', () => {
    it('toggleStatus emite la tarea al hacer click en el checkbox', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask };
      fixture.detectChanges();

      let emitted: Task | undefined;
      component.toggleStatus.subscribe((t: Task) => (emitted = t));

      component.onToggle();
      expect(emitted).toEqual(baseTask);
    });

    it('editTask emite la tarea al llamar onEdit', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask };
      fixture.detectChanges();

      let emitted: Task | undefined;
      component.editTask.subscribe((t: Task) => (emitted = t));

      component.onEdit();
      expect(emitted).toEqual(baseTask);
    });

    it('deleteTask emite la tarea al llamar onDelete', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask };
      fixture.detectChanges();

      let emitted: Task | undefined;
      component.deleteTask.subscribe((t: Task) => (emitted = t));

      component.onDelete();
      expect(emitted).toEqual(baseTask);
    });

    it('el botón editar dispara editTask al hacer click', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask };
      fixture.detectChanges();

      let emitted: Task | undefined;
      component.editTask.subscribe((t: Task) => (emitted = t));

      const btn: HTMLElement = fixture.nativeElement.querySelector('.task-item__btn--edit');
      btn.click();
      fixture.detectChanges();

      expect(emitted).toEqual(baseTask);
    });

    it('el botón eliminar dispara deleteTask al hacer click', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      const component = fixture.componentInstance;
      component.task = { ...baseTask };
      fixture.detectChanges();

      let emitted: Task | undefined;
      component.deleteTask.subscribe((t: Task) => (emitted = t));

      const btn: HTMLElement = fixture.nativeElement.querySelector('.task-item__btn--delete');
      btn.click();
      fixture.detectChanges();

      expect(emitted).toEqual(baseTask);
    });
  });

  // ── CSS class completed ────────────────────────────────────────────────────

  describe('clase CSS task-item--completed', () => {
    it('no aplica la clase cuando la tarea está pendiente', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, status: 'pending' };
      fixture.detectChanges();

      const card: HTMLElement = fixture.nativeElement.querySelector('.task-item');
      expect(card.classList.contains('task-item--completed')).toBe(false);
    });

    it('aplica la clase cuando la tarea está completada', () => {
      const fixture = TestBed.createComponent(TaskItemComponent);
      fixture.componentInstance.task = { ...baseTask, status: 'completed' };
      fixture.detectChanges();

      const card: HTMLElement = fixture.nativeElement.querySelector('.task-item');
      expect(card.classList.contains('task-item--completed')).toBe(true);
    });
  });
});
