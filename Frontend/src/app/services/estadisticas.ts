import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PublicacionesPorUsuario {
    usuario: string;
    cantidad: number;
}

export interface ComentariosPorFecha {
    fecha: string;
    cantidad: number;
}

export interface ComentariosPorPublicacion {
    idPublicacion: string;
    titulo: string;
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
    })
    export class EstadisticasService {

    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/publicaciones/estadisticas`;

    private obtenerParametros(desde: string, hasta: string): HttpParams {
        return new HttpParams()
        .set('desde', desde)
        .set('hasta', hasta);
    }

    // 1. Publicaciones por usuario
    publicacionesPorUsuario(
        desde: string,
        hasta: string
    ): Observable<PublicacionesPorUsuario[]> {

        return this.http.get<PublicacionesPorUsuario[]>(
        `${this.apiUrl}/usuarios`,
        {
            params: this.obtenerParametros(desde, hasta),
            withCredentials: true
        }
        );
    }

    // 2. Comentarios por fecha
    comentariosPorFecha(
        desde: string,
        hasta: string
    ): Observable<ComentariosPorFecha[]> {

        return this.http.get<ComentariosPorFecha[]>(
        `${this.apiUrl}/comentarios`,
        {
            params: this.obtenerParametros(desde, hasta),
            withCredentials: true
        }
        );
    }

    // 3. Comentarios por publicación
    comentariosPorPublicacion(
        desde: string,
        hasta: string
    ): Observable<ComentariosPorPublicacion[]> {

        return this.http.get<ComentariosPorPublicacion[]>(
        `${this.apiUrl}/publicaciones`,
        {
            params: this.obtenerParametros(desde, hasta),
            withCredentials: true
        }
        );
    }
}
