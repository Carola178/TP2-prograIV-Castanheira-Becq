import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Usuario, UsuarioDocument} from '../../usuarios/entities/usuario.entity.js';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,

        @InjectModel(Usuario.name)
        private readonly usuarioModel: Model<UsuarioDocument>
    ) {}

    async canActivate(contexto: ExecutionContext): Promise<boolean> {

        const solicitud = contexto.switchToHttp().getRequest();
        const token = this.extraerTokenDeCookie(contexto);

        if (!token) {
            throw new UnauthorizedException('No se encontró un token');
        }

        let datosUsuario: any;

        try {
            datosUsuario = await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException('Token inválido o vencido');
        }

        const usuario = await this.usuarioModel.findById(datosUsuario.sub);

        if (!usuario) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        if (usuario.activo === false) {
            throw new UnauthorizedException(
                'Tu cuenta fue deshabilitada. Contactá al administrador.'
            );
        }

        solicitud.usuarioAutenticado = {
            ...datosUsuario,
            id: usuario._id.toString(),
            perfil: usuario.perfil
        };
        return true;
    }

    private extraerTokenDeCookie(
        contexto: ExecutionContext
    ): string | null {
        const solicitud = contexto.switchToHttp().getRequest();
        return solicitud.cookies?.['Token'] || null;
    }
}
