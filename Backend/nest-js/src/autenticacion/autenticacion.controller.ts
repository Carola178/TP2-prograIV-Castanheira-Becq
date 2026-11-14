import { Controller, Post, Body, Res, Get, Req, Param, Patch, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service.js';
import { FileService } from '../documentos/file.service.js'; 
import { CrearUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard.js';
import { ActualizarPerfilDto } from './dto/actualizar-usuario.dto.js';

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


    @Patch('perfil')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('imagenPerfil', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Solo se permiten imágenes JPG, PNG o WebP'),
                        false
                    );
                }
                callback(null, true);
            }
        })
    )
    async actualizarPerfil(
        @Req() solicitud: any,
        @Body() datos: ActualizarPerfilDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const idUsuario =
            solicitud.usuarioAutenticado.sub ||
            solicitud.usuarioAutenticado.id ||
            solicitud.usuarioAutenticado._id;

        let imagenPerfil: string | undefined;

        if (file) {
            imagenPerfil = await this.fileService.cloudinaryUploader(
                file,
                'perfiles'
            );
        }

        return this.autenticacionService.actualizarPerfil(
            idUsuario,
            datos,
            imagenPerfil
        );
    }
}