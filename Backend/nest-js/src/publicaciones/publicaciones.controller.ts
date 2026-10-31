import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionDto } from './dto/filtrar-publicacion.dto.js';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js'; 

@Controller('publicaciones')
export class PublicacionesController {
    constructor(private readonly publicacionesService: PublicacionesService) {}

    @Post()
    @UseGuards(AuthGuard) 
    crearPublicacion(@Body() crearPublicacionDto: CrearPublicacionDto, @Req() req: any) {
        // 2. Extraemos el ID directamente del usuario autenticado por el token
        // (fíjate si en tu estrategia JWT lo guardas como .id o .sub)
        const idUsuario = req.user.id || req.user.sub; 

        return this.publicacionesService.crear(crearPublicacionDto, idUsuario);
    }

    // 2. GET: Listar publicaciones (con ordenamiento, filtro por usuario, offset y limit)
    @Get()
    listarPublicaciones(@Query() filtros: FiltrarPublicacionDto) {
        return this.publicacionesService.obtenerTodos(filtros);
    }

    @UseGuards(AuthGuard)
        @Delete(':id')
        async eliminarPublicacion(@Param('id') id: string, @Req() req: any) {
            // Extraemos el ID del usuario autenticado del token JWT
            const idUsuarioActual = req.user?.id || req.user?.sub || req.user?._id;

            // Se lo pasamos al servicio junto con el ID de la publicación
            return await this.publicacionesService.eliminar(id, idUsuarioActual);
        }

    @UseGuards(AuthGuard)
        @Post(':id/me-gusta')
        darMeGusta(@Param('id') idPublicacion: string, @Req() req: any) {
            // Asegúrate de que tu JWT guarde el id en .id, .sub o _id (ajústalo según tu estrategia)
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