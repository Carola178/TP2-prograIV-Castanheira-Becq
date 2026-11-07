import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comentario {
    _id: string;
    mensaje: string;
    autor: {
        _id: string;
        nombre: string;
        apellido: string;
        nombreUsuario: string;
        imagenPerfil?: string;
    } | string;
    publicacion: string;
    modificado: boolean;
    createdAt: string;
    updatedAt: string;
    }

    export interface RespuestaComentarios {
    comentarios: Comentario[];
    total: number;
    limite: number;
    offset: number;
    hayMas: boolean;
    }

    @Injectable({
    providedIn: 'root'
    })
    export class ComentariosService {

    private apiUrl = `${environment.apiUrl}/publicaciones`;

    constructor(private http: HttpClient) {}

    obtenerComentarios(
        idPublicacion: string,
        limite: number = 5,
        offset: number = 0
    ): Observable<RespuestaComentarios> {

        const params = new HttpParams()
        .set('limite', limite.toString())
        .set('offset', offset.toString());

        return this.http.get<RespuestaComentarios>(
        `${this.apiUrl}/${idPublicacion}/comentarios`,
        {
            params,
            withCredentials: true
        }
        );
    }

    crearComentario(
        idPublicacion: string,
        mensaje: string
    ): Observable<Comentario> {

        return this.http.post<Comentario>(
        `${this.apiUrl}/${idPublicacion}/comentarios`,
        { mensaje },
        { withCredentials: true }
        );
    }

    editarComentario(
        idPublicacion: string,
        idComentario: string,
        mensaje: string
    ): Observable<Comentario> {

        return this.http.put<Comentario>(
        `${this.apiUrl}/${idPublicacion}/comentarios/${idComentario}`,
        { mensaje },
        { withCredentials: true }
        );
    }
}
