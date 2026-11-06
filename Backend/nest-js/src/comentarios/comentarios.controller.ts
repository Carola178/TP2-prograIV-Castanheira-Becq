import {Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards} from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';

@Controller('publicaciones/:id/comentarios')
@UseGuards(AuthGuard)
export class ComentariosController {

    constructor(
    private readonly comentariosService: ComentariosService) {}

    @Post()
    crear(@Param('id') idPublicacion: string, @Body() dto: CrearComentarioDto, @Req() solicitud: any) {
        const idUsuario = solicitud.usuarioAutenticado.id || solicitud.usuarioAutenticado.sub || solicitud.usuarioAutenticado._id;

        return this.comentariosService.crear(
            idPublicacion,
            idUsuario,
            dto.mensaje
        );
    }

    @Get()
    obtener(@Param('id') idPublicacion: string, @Query('limite') limite = '5', @Query('offset') offset = '0') {
        return this.comentariosService.obtener(idPublicacion, Number(limite), Number(offset)
        );
    }

    @Put(':comentarioId')
    editar(@Param('id') idPublicacion: string, @Param('comentarioId') idComentario: string, @Body() dto: EditarComentarioDto, @Req() solicitud: any) {
        const idUsuario = solicitud.usuarioAutenticado?.id || solicitud.usuarioAutenticado?.sub || solicitud.usuarioAutenticado?._id;

        return this.comentariosService.editar(idPublicacion, idComentario, idUsuario, dto.mensaje);
    }
}