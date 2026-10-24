import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
// import { environment } from '../../enviroments/enviroment'; 

export interface AuthResponse {
  access_token: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = 'http://localhost:3000/autenticacion';

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor() {}

  private getStoredUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  login(email: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, contrasena }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.usuario) {
            localStorage.setItem('user', JSON.stringify(response.usuario));
            this.currentUserSubject.next(response.usuario);
          }
        }
      })
    );
  }

  registro(datosRegistro: any, imagenFile?: File): Observable<any> {
      const formData = new FormData();

      for (const key in datosRegistro) {
        if (datosRegistro[key] !== undefined && datosRegistro[key] !== null) {
          formData.append(key, datosRegistro[key]);
        }
      }

      if (imagenFile) {
        formData.append('imagenPerfil', imagenFile);
      }

      return this.http.post(`${this.apiUrl}/registro`, formData);
    }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}