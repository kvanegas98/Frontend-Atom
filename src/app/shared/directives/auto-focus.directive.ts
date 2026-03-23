import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Directiva que enfoca automáticamente el elemento host cuando se renderiza.
 * Útil en formularios donde el primer campo debe estar listo para escritura.
 *
 * @example
 * ```html
 * <input matInput appAutoFocus />
 * ```
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
