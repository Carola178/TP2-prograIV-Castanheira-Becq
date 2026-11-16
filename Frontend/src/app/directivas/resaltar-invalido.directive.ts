import {Directive, ElementRef, Renderer2, OnInit, OnDestroy, inject} from '@angular/core';
import { NgControl } from '@angular/forms';
import { merge, Subscription } from 'rxjs';

@Directive({selector: '[appResaltarInvalido]', standalone: true})
export class ResaltarInvalidoDirective implements OnInit, OnDestroy {

    private elemento = inject(ElementRef);
    private renderer = inject(Renderer2);
    private ngControl = inject(NgControl, { self: true });

    private suscripcion?: Subscription;

    ngOnInit(): void {
        const control = this.ngControl.control;

        if (!control) return;

        this.suscripcion = merge(
        control.valueChanges,
        control.statusChanges,
        control.events
        ).subscribe(() => {
        this.actualizarEstilo();
        });

        this.actualizarEstilo();
    }

    private actualizarEstilo(): void {
        const control = this.ngControl.control;

        if (!control) return;

        const esInvalido = control.invalid && control.touched;

        if (esInvalido) {
        this.renderer.addClass(
            this.elemento.nativeElement,
            'campo-invalido'
        );
        } else {
        this.renderer.removeClass(
            this.elemento.nativeElement,
            'campo-invalido'
        );
        }
    }

    ngOnDestroy(): void {
        this.suscripcion?.unsubscribe();
    }
}
