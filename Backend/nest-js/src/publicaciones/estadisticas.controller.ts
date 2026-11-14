import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js';
import { AdminGuard } from '../admin-panel/guards/admin.guard.js';
import { EstadisticasService } from './estadisticas.service.js';

@Controller('publicaciones/estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {

    constructor(
        private readonly estadisticasService: EstadisticasService
    ) {}

    @Get('usuarios')
    publicacionesPorUsuario(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string
    ) {
        return this.estadisticasService.publicacionesPorUsuario(
        desde,
        hasta
        );
    }

    @Get('comentarios')
    comentariosPorFecha(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string
    ) {
        return this.estadisticasService.comentariosPorFecha(
        desde,
        hasta
        );
    }

    @Get('publicaciones')
    comentariosPorPublicacion(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string
    ) {
        return this.estadisticasService.comentariosPorPublicacion(
        desde,
        hasta
        );
    }
}
