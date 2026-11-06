import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment'; 


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/autenticacion`; 

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();
  
private vencimientoSubject = new BehaviorSubject<number | null>(null);

public vencimiento$ = this.vencimientoSubject.asObservable();

  actualizarVencimiento(expiraEn: number): void {
    this.vencimientoSubject.next(expiraEn);
  }


  get usuarioActual(): any {
    return this.currentUserSubject.value;
  }

  constructor() {}


  
  login(email: string, contrasena: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      { email, contrasena },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response?.usuario) {
          this.currentUserSubject.next(response.usuario);
          this.actualizarVencimiento(response.expiraEn);
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

      return this.http.post<any>(
        `${this.apiUrl}/registro`,
        formData,
        { withCredentials: true }
      ).pipe(
      tap(response => {
        if (response?.usuario) {
          this.currentUserSubject.next(response.usuario);
          this.actualizarVencimiento(response.expiraEn);
        }
      })
      );
    }
    
    
  cerrarSesion(): void {
    this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.limpiarSesion();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }

  
  autorizar(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/autorizar`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.currentUserSubject.next(response.usuario);
        this.actualizarVencimiento(response.expiraEn);
      })
    );
  }

  
  refrescar(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/refrescar`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response?.usuario) {
          this.currentUserSubject.next(response.usuario);
          this.actualizarVencimiento(response.expiraEn);
        }
      })
    );
  }

  limpiarSesion(): void {
    this.currentUserSubject.next(null);
    this.vencimientoSubject.next(null);
  }

  getPerfil(id: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/perfil/${id}`, {
    withCredentials: true
  });
  }
}