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

    // 3. DELETE: Baja lógica de una publicación (solo el creador o un administrador)
    // @UseGuards(AuthGuard)
    @Delete(':id')
        async eliminarPublicacion(@Param('id') id: string) {
            // Si ya estás manejando guardias de autenticación, puedes extraer el ID del usuario desde el request.
            // Por ahora, llamamos directamente al servicio de eliminación:
            return await this.publicacionesService.eliminar(id, '');
        }

    // 4. POST: Dar "me gusta" a una publicación (un usuario solo puede dar uno por post)
    // @UseGuards(AuthGuard)
    @Post(':id/me-gusta')
    darMeGusta(@Param('id') idPublicacion: string, @Req() req: any) {
        const idUsuario = req.user?.id || 'id_usuario_prueba';
        return this.publicacionesService.darMeGusta(idPublicacion, idUsuario);
    }

    // 5. DELETE: Quitar "me gusta" de una publicación
    // @UseGuards(AuthGuard)
    @Delete(':id/me-gusta')
    quitarMeGusta(@Param('id') idPublicacion: string, @Req() req: any) {
        const idUsuario = req.user?.id || 'id_usuario_prueba';
        return this.publicacionesService.quitarMeGusta(idPublicacion, idUsuario);
    }
}