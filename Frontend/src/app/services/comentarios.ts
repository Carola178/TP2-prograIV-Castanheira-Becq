import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
    })
    export class ComentariosService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/publicaciones`;

    obtenerComentarios(
        idPublicacion: string,
        limite: number = 5,
        offset: number = 0
    ): Observable<any> {

        const params = new HttpParams()
        .set('limite', limite.toString())
        .set('offset', offset.toString());

        return this.http.get(
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
    ): Observable<any> {

        return this.http.post(
        `${this.apiUrl}/${idPublicacion}/comentarios`,
        { mensaje },
        { withCredentials: true }
        );
    }

    editarComentario(
        idPublicacion: string,
        idComentario: string,
        mensaje: string
    ): Observable<any> {

        return this.http.put(
        `${this.apiUrl}/${idPublicacion}/comentarios/${idComentario}`,
        { mensaje },
        { withCredentials: true }
        );
    }
}
