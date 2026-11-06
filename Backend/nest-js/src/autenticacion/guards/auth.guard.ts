import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService) {}

    canActivate(contexto: ExecutionContext): boolean {
        // Obtener la solicitud HTTP
        const solicitud = contexto.switchToHttp().getRequest();
        // Buscar el token primero en la cookie y luego en el header
        const token = this.extraerTokenDeCookie(contexto);

        if (!token) {
            throw new UnauthorizedException('No se encontró un token');
        }
        try {
            // Verificar que el JWT sea válido y no esté vencido
            const datosUsuario = this.jwtService.verify(token);
            // Guardar los datos del usuario autenticado en la solicitud
            solicitud.usuarioAutenticado = datosUsuario;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Token inválido o vencido');
        }
    }
    // Obtener el JWT desde la cookie
    private extraerTokenDeCookie(contexto: ExecutionContext): string | null {
        const solicitud = contexto.switchToHttp().getRequest();
        const token = solicitud.cookies?.['Token'];
        return token || null;
    }
}
