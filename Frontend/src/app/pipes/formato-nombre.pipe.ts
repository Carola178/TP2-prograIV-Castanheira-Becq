import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatoNombre', standalone: true})
export class FormatoNombrePipe implements PipeTransform {

    transform(nombre: string | null | undefined): string {

        if (!nombre) return '';

        return nombre
        .trim()
        .toLocaleLowerCase('es-AR')
        .split(/\s+/)
        .map(palabra =>
            palabra.charAt(0).toLocaleUpperCase('es-AR') +
            palabra.slice(1)
        )
        .join(' ');
    }
    }