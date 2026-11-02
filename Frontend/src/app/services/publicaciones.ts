
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PublicacionesService {
    private apiUrl = 'http://localhost:3000/publicaciones';

    constructor(private http: HttpClient) {}

obtenerPublicaciones(filtros: { ordenarPor?: string; limite?: number; offset?: number; idUsuario?: string } = {}): Observable<any> {
    let params = new HttpParams();

    if (filtros.ordenarPor) {
        params = params.set('ordenarPor', filtros.ordenarPor);
    }
    if (filtros.limite !== undefined) {
        params = params.set('limite', filtros.limite.toString()); // Coincide con tu DTO 'limite'
    }
    if (filtros.offset !== undefined) {
        params = params.set('offset', filtros.offset.toString());
    }
    if (filtros.idUsuario) {
        params = params.set('idUsuario', filtros.idUsuario);
    }

    return this.http.get<any>(this.apiUrl, {
        params,
        withCredentials: true
    });
}

    eliminarPublicacion(id: string): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}`,
            { withCredentials: true }
        );
    }

    darMeGusta(id: string): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}/${id}/me-gusta`,
            {},
            { withCredentials: true }
        );
    }

    quitarMeGusta(id: string): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}/${id}/me-gusta`,
            { withCredentials: true }
        );
    }
}
