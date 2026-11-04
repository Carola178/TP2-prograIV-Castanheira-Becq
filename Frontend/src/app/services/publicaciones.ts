import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PublicacionesService {
    private apiUrl = `${environment.apiUrl}/publicaciones`; 

    constructor(private http: HttpClient) {}

    obtenerPublicaciones(filtros: { ordenarPor?: string; limite?: number; offset?: number; idUsuario?: string } = {}): Observable<any> {
        let params = new HttpParams();

        if (filtros.ordenarPor) {
            params = params.set('ordenarPor', filtros.ordenarPor);
        }
        if (filtros.limite !== undefined) {
            params = params.set('limite', filtros.limite.toString());
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

    // Nuevo método añadido para soportar la creación de publicaciones con FormData (imagen a Cloudinary)
    crearPublicacion(formData: FormData): Observable<any> {
        return this.http.post<any>(this.apiUrl, formData, {
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