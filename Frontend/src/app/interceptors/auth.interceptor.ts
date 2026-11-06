import { inject } from '@angular/core';
import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    const api = new URL(environment.apiUrl, window.location.origin);
    const urlPeticion = new URL(req.url, window.location.origin);

    const esApiPropia = urlPeticion.origin === api.origin;

    const esLogin = urlPeticion.pathname.endsWith('/autenticacion/login');
    const esRegistro = urlPeticion.pathname.endsWith('/autenticacion/registro');
    const esLogout = urlPeticion.pathname.endsWith('/autenticacion/logout');

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
        if (
            esApiPropia &&
            error.status === 401 &&
            !esLogin &&
            !esRegistro &&
            !esLogout
        ) {
            console.warn('Sesión inválida o vencida. Redirigiendo al login.');

            router.navigateByUrl('/login');
        }

        return throwError(() => error);
        })
    );
};
