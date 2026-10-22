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

  private apiUrl = 'http://localhost:3000/api/auth'; // Reemplazá con tu entorno si ya lo configuraste

  // Manejo reactivo del estado de autenticación basado en el token JWT / localStorage
  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor() {}

  private getStoredUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Petición de Login contra NestJS
  signIn(identifier: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { identifier, password }).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }
      })
    );
  }

  // Petición de Registro contra NestJS
  signUp(datosRegistro: {
    nombre: string;
    apellido: string;
    identifier: string; // Puede ser email o username según tu modelo
    password: string;
    [key: string]: any;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datosRegistro);
  }

  // Cerrar sesión
  signOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}