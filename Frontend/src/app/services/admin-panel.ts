import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioAdmin {
    _id: string;
    nombre: string;
    apellido: string;
    email: string;
    nombreUsuario: string;
    perfil: 'usuario' | 'administrador';
    activo?: boolean;
    imagenPerfil?: string;
    }

export interface RespuestaUsuarioAdmin {
    mensaje: string;
    usuario: UsuarioAdmin;
    }    


export interface CrearUsuarioAdmin {
    nombre: string;
    apellido: string;
    email: string;
    nombreUsuario: string;
    fechaNacimiento: string;
    descripcionBreve?: string;
    contrasena: string;
    perfil: 'usuario' | 'administrador';
    }

    @Injectable({
    providedIn: 'root'
    })
    export class AdminPanelService {

    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/admin-panel`;

    obtenerUsuarios(): Observable<UsuarioAdmin[]> {
        return this.http.get<UsuarioAdmin[]>(
        `${this.apiUrl}/usuarios`,
        { withCredentials: true }
        );
    }

    deshabilitarUsuario(id: string): Observable<RespuestaUsuarioAdmin> {
        return this.http.delete<RespuestaUsuarioAdmin>(
        `${this.apiUrl}/usuarios/${id}`,
        { withCredentials: true }
        );
    }

    habilitarUsuario(id: string): Observable<RespuestaUsuarioAdmin> {
        return this.http.post<RespuestaUsuarioAdmin>(
        `${this.apiUrl}/usuarios/${id}/habilitar`,
        {},
        { withCredentials: true }
        );
    }
    
    crearUsuario(datos: FormData): Observable<RespuestaUsuarioAdmin> {
    return this.http.post<RespuestaUsuarioAdmin>(
        `${this.apiUrl}/usuarios`,
        datos,
        { withCredentials: true }
    );
    }
}
