import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Auth } from '../services/auth';

export const AdminGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (auth.usuarioActual) {
        return auth.usuarioActual.perfil === 'administrador'
            ? true
            : router.createUrlTree(['/publicaciones']);
    }

    return auth.autorizar().pipe(
        map((respuesta: any) => {
            const usuario = respuesta.usuario;

            return usuario?.perfil === 'administrador'
                ? true
                : router.createUrlTree(['/publicaciones']);
        }),
        catchError(() => of(router.createUrlTree(['/login'])))
    );
};
