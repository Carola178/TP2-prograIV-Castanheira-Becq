import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
        import('./componentes/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        loadComponent: () =>
        import('./componentes/registro/registro').then(m => m.Registro)
    },
    {
        path: 'publicaciones',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./componentes/publicaciones/publicaciones')
            .then(m => m.Publicaciones)
    },
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./componentes/perfil/perfil').then(m => m.Perfil)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
