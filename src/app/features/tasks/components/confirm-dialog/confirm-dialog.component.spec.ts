import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from './confirm-dialog.component';

const defaultData: ConfirmDialogData = {
  title: 'Eliminar tarea',
  message: '¿Estás seguro de eliminar <strong>esta tarea</strong>?',
  confirmLabel: 'Eliminar',
  cancelLabel: 'No, cancelar',
};

function createDialogRefSpy() {
  return { close: vi.fn() };
}

describe('ConfirmDialogComponent', () => {
  let dialogRefSpy: ReturnType<typeof createDialogRefSpy>;

  beforeEach(async () => {
    dialogRefSpy = createDialogRefSpy();

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: defaultData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();
  });

  it('crea el componente correctamente', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el título configurado', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();

    const title: HTMLElement = fixture.nativeElement.querySelector('.dialog-title');
    expect(title.textContent).toContain('Eliminar tarea');
  });

  it('renderiza el mensaje HTML de forma segura', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const comp = fixture.componentInstance;

    expect(comp.safeMessage).toBeTruthy();
  });

  it('confirm() cierra el dialog con true', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const comp = fixture.componentInstance;

    comp.confirm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('cancel() cierra el dialog con false', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const comp = fixture.componentInstance;

    comp.cancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('usa los labels personalizados pasados por data', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const textos = Array.from(buttons).map((b: any) => b.textContent?.trim());

    expect(textos).toContain('No, cancelar');
    expect(textos).toContain('Eliminar');
  });

  describe('con labels por defecto', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      const dataNoLabels: ConfirmDialogData = {
        title: 'Confirmar',
        message: '¿Continuar?',
      };
      dialogRefSpy = createDialogRefSpy();

      await TestBed.configureTestingModule({
        imports: [ConfirmDialogComponent, NoopAnimationsModule],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: dataNoLabels },
          { provide: MatDialogRef, useValue: dialogRefSpy },
        ],
      }).compileComponents();
    });

    it('muestra "Cancelar" y "Confirmar" cuando no se pasan labels', () => {
      const fixture = TestBed.createComponent(ConfirmDialogComponent);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const textos = Array.from(buttons).map((b: any) => b.textContent?.trim());

      expect(textos).toContain('Cancelar');
      expect(textos).toContain('Confirmar');
    });
  });
});
