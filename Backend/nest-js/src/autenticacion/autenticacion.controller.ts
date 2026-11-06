import { Controller, Post, Body, Res, Get, Req, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service.js';
import { FileService } from '../documentos/file.service.js'; 
import { CrearUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard.js';

@Controller('autenticacion')
export class AutenticacionController {
    constructor(
        private readonly autenticacionService: AutenticacionService,
        private readonly fileService: FileService,
    ) {}

    @Post('registro')
    @UseInterceptors(
        FileInterceptor('imagenPerfil', {
            storage: memoryStorage(),
        }),
    )
    async registro(
        @Body() crearUsuarioDto: CrearUsuarioDto,
        @UploadedFile() file?: Express.Multer.File,
        @Res({ passthrough: true }) res?: any
    ) {
        if (file) {
            const secureUrl = await this.fileService.cloudinaryUploader(file, 'perfiles');
            crearUsuarioDto.imagenPerfil = secureUrl; 
        }
        const result = await this.autenticacionService.registrar(crearUsuarioDto);
        if (res) {
            this.autenticacionService.setTokenCookie(res, result.token);
        }
        return {
            usuario: result.usuario,
            expiraEn: result.expiraEn
        };
    }

    @Post('login')
    async login(
        @Body() loginAuthDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.autenticacionService.login(loginAuthDto);
        this.autenticacionService.setTokenCookie(res, result.token);
        return {
            usuario: result.usuario,
            expiraEn: result.expiraEn
        };
    }

    @Get('perfil/:id')
    @UseGuards(AuthGuard)
    async obtenerPerfil(@Param('id') id: string) {
        return this.autenticacionService.getPerfil(id);
    }
    
    @Post('autorizar')
    @UseGuards(AuthGuard)
    async autorizar(@Req() solicitud: any) {
        const idUsuario =
            solicitud.usuarioAutenticado.sub ||
            solicitud.usuarioAutenticado.id ||
            solicitud.usuarioAutenticado._id;

        const usuario = await this.autenticacionService.autorizar(idUsuario);

        return {
            usuario,
            expiraEn: solicitud.usuarioAutenticado.exp * 1000
        };
    }


    @Post('refrescar')
    @UseGuards(AuthGuard)
    async refrescar(
        @Req() solicitud: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const idUsuario =
            solicitud.usuarioAutenticado.sub ||
            solicitud.usuarioAutenticado.id ||
            solicitud.usuarioAutenticado._id;

        const resultado = await this.autenticacionService.refrescar(idUsuario);
        this.autenticacionService.setTokenCookie(res, resultado.token);
        return {
            mensaje: 'Sesión renovada correctamente',
            usuario: resultado.usuario,
            expiraEn: resultado.expiraEn
        };
    }


    @Post('logout')
    @UseGuards(AuthGuard)
    cerrarSesion(@Res({ passthrough: true }) res: Response) {
        const esProduccion = process.env.NODE_ENV === 'production';

        res.clearCookie('Token', {
            httpOnly: true,
            secure: esProduccion,
            sameSite: esProduccion ? 'none' : 'lax',
            path: '/'
        });

        return {
            mensaje: 'Sesión cerrada correctamente'
        };
    }

}