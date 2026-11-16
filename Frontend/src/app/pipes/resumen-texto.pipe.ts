import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'resumenTexto', standalone: true})
    export class ResumenTextoPipe implements PipeTransform {

    transform(texto: string, limite: number = 120): string {
        if (!texto) return '';

        if (texto.length <= limite) {
        return texto;
        }

        return texto.substring(0, limite).trimEnd() + '...';
    }
}