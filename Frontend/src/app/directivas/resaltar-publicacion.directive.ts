import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({selector: '[appResaltarPublicacion]', standalone: true})
export class ResaltarPublicacionDirective {

    constructor(
        private elemento: ElementRef,
        private renderer: Renderer2
    ) {}

    @HostListener('mouseenter')
    alEntrarMouse(): void {
        this.renderer.addClass(
        this.elemento.nativeElement,
        'publicacion-resaltada'
        );
    }

    @HostListener('mouseleave')
    alSalirMouse(): void {
        this.renderer.removeClass(
        this.elemento.nativeElement,
        'publicacion-resaltada'
        );
    }
}