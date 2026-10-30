import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PublicacionesService {
    private apiUrl = 'http://localhost:3000/publicaciones';

    constructor(private http: HttpClient) {}

    // Actualizado para recibir los filtros de ordenamiento y paginación que espera tu backend
    obtenerPublicaciones(ordenarPor: string = 'fechaCreacion', limite: number = 10, offset: number = 0): Observable<any[]> {
        const params = new HttpParams()
        .set('ordenarPor', ordenarPor)
        .set('limite', limite.toString())
        .set('offset', offset.toString());

        return this.http.get<any>(this.apiUrl, { params }).pipe(
        map(response => {
            if (Array.isArray(response)) {
            return response;
            }
            return response.datos || response.publicaciones || [];
        })
        );
    }

    // Método para eliminar tu propia publicación conectando con el backend
    eliminarPublicacion(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    // Métodos de Me Gusta (por si los necesitas conectar también)
    darMeGusta(id: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/like`, {});
    }

    quitarMeGusta(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}/like`);
    }
}