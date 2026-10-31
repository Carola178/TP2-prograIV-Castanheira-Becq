import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PublicacionesService {
    private apiUrl = 'http://localhost:3000/publicaciones';

    constructor(private http: HttpClient) {}

    // Obtenemos publicaciones enviando los filtros y opcionalmente el idUsuario actual
    obtenerPublicaciones(ordenarPor: string = 'fechaCreacion', limite: number = 10, offset: number = 0, idUsuario?: string): Observable<any> {
        let params = new HttpParams()
            .set('ordenarPor', ordenarPor)
            .set('limite', limite.toString())
            .set('offset', offset.toString());

        if (idUsuario) {
            params = params.set('idUsuario', idUsuario);
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    eliminarPublicacion(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    darMeGusta(id: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/me-gusta`, {});
    }

    quitarMeGusta(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}/me-gusta`);
    }
}