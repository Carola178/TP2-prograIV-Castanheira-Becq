import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service.js';
import { FileService } from '../documentos/file.service.js'; 
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionDto } from './dto/filtrar-publicacion.dto.js';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js'; 

@Controller('publicaciones')
export class PublicacionesController {
    constructor(
        private readonly publicacionesService: PublicacionesService,
        private readonly fileService: FileService, 
    ) {}

    @Post()
    @UseGuards(AuthGuard) 
    @UseInterceptors(
        FileInterceptor('imagen', { 
            storage: memoryStorage(),
        }),
    )
    async crearPublicacion(
        @Body() crearPublicacionDto: CrearPublicacionDto, 
        @Req() req: any,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const idUsuario = req.user.id || req.user.sub || req.user._id; 
        if (file) {
            const secureUrl = await this.fileService.cloudinaryUploader(file, 'publicaciones');
            crearPublicacionDto.urlImagen = secureUrl; 
        }

        return this.publicacionesService.crear(crearPublicacionDto, idUsuario);
    }

    @UseGuards(AuthGuard)
    @Get()  
    listarPublicaciones(
        @Query() filtros: FiltrarPublicacionDto,
        @Req() req: any
    ) {
        const idUsuarioActual =
            req.user?.id || req.user?.sub || req.user?._id;
        return this.publicacionesService.obtenerTodos(
            filtros,
            idUsuarioActual
        );
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async eliminarPublicacion(@Param('id') id: string, @Req() req: any) {
        const idUsuarioActual = req.user?.id || req.user?.sub || req.user?._id;
        return await this.publicacionesService.eliminar(id, idUsuarioActual);
    }

    @UseGuards(AuthGuard)
    @Post(':id/me-gusta')
    darMeGusta(@Param('id') idPublicacion: string, @Req() req: any) {
        const idUsuario = req.user?.id || req.user?.sub || req.user?._id;
        return this.publicacionesService.darMeGusta(idPublicacion, idUsuario);
    }

    @UseGuards(AuthGuard)
    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') idPublicacion: string, @Req() req: any) {
        const idUsuario = req.user?.id || req.user?.sub || req.user?._id;
        return this.publicacionesService.quitarMeGusta(idPublicacion, idUsuario);
    }
}