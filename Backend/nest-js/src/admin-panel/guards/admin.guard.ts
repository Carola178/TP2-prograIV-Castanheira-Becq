import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {

    canActivate(contexto: ExecutionContext): boolean {
        const solicitud = contexto.switchToHttp().getRequest();
        const usuario = solicitud.usuarioAutenticado;

        if (!usuario || usuario.perfil !== 'administrador') {
            throw new ForbiddenException(
                'No tenés permisos de administrador'
            );
        }
        return true;
    }
}
