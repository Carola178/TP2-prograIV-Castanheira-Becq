import { Pipe, PipeTransform } from '@angular/core';
@Pipe({name: 'tiempoTranscurrido', standalone: true})

export class TiempoTranscurridoPipe implements PipeTransform {

    transform(fecha: string | Date): string {

        if (!fecha) return '';

        const fechaPublicacion = new Date(fecha);
        const ahora = new Date();

        const diferencia = ahora.getTime() - fechaPublicacion.getTime();

        if (isNaN(diferencia)) return '';

        const minutos = Math.floor(diferencia / (1000 * 60));
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        if (minutos < 1) {
        return 'Hace un momento';
        }

        if (minutos < 60) {
        return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        }

        if (horas < 24) {
        return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        }

        if (dias === 1) {
        return 'Hace 1 día';
        }

        return `Hace ${dias} días`;
    }
}