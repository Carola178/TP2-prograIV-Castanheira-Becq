import {Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service.js';
import { FileService } from '../documentos/file.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionDto } from './dto/filtrar-publicacion.dto.js';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {

    constructor(private readonly publicacionesService: PublicacionesService, private readonly fileService: FileService,) {}

    @Post()
    @UseInterceptors(FileInterceptor('imagen', {storage: memoryStorage(),}),)

    async crearPublicacion(@Body() crearPublicacionDto: CrearPublicacionDto, @Req() solicitud: any, @UploadedFile() file?: Express.Multer.File,) {
        const idUsuario = solicitud.usuarioAutenticado?.id;
        if (file) {
            const secureUrl = await this.fileService.cloudinaryUploader(file,'publicaciones');
            crearPublicacionDto.urlImagen = secureUrl;
        }

        return this.publicacionesService.crear(
            crearPublicacionDto,
            idUsuario
        );
    }

    @Get()
    listarPublicaciones(@Query() filtros: FiltrarPublicacionDto, @Req() solicitud: any) {
        const idUsuarioActual = solicitud.usuarioAutenticado?.id;

        return this.publicacionesService.obtenerTodos(
            filtros,
            idUsuarioActual
        );
    }

    @Delete(':id')
    async eliminarPublicacion(@Param('id') idPublicacion: string, @Req() solicitud: any) {
        const idUsuarioActual = solicitud.usuarioAutenticado?.id;

        return this.publicacionesService.eliminar(
            idPublicacion,
            idUsuarioActual
        );
    }

    @Post(':id/me-gusta')
    darMeGusta(@Param('id') idPublicacion: string, @Req() solicitud: any) {
        const idUsuario = solicitud.usuarioAutenticado?.id;

        return this.publicacionesService.darMeGusta(
            idPublicacion,
            idUsuario
        );
    }

    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') idPublicacion: string, @Req() solicitud: any) {
        const idUsuario = solicitud.usuarioAutenticado?.id;
        return this.publicacionesService.quitarMeGusta(
            idPublicacion,
            idUsuario
        );
    }
}
