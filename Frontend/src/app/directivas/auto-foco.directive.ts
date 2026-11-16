import {Directive, ElementRef, AfterViewInit} from '@angular/core';

@Directive({selector: '[appAutoFocus]', standalone: true})
export class AutoFocusDirective implements AfterViewInit {

    constructor(
        private elemento: ElementRef<HTMLInputElement>
    ) {}

    ngAfterViewInit(): void {
        this.elemento.nativeElement.focus();
    }
}