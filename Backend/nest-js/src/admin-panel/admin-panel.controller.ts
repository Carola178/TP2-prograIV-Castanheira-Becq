import { Controller, Get, UseGuards, Delete, Param, Req, Post, Body } from '@nestjs/common';
import { AdminPanelService } from './admin-panel.service.js';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js';
import { AdminGuard } from './guards/admin.guard.js';
import { CrearUsuarioDto } from '../autenticacion/dto/create-usuario.dto.js';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from '../documentos/file.service.js';

@Controller('admin-panel')
@UseGuards(AuthGuard, AdminGuard)
export class AdminPanelController {
        constructor(
        private readonly adminPanelService: AdminPanelService,
        private readonly fileService: FileService
    ) {}

    @Get('usuarios')
    async listarUsuarios() {
        return this.adminPanelService.listarUsuarios();
    }

    @Delete('usuarios/:id')
    async deshabilitarUsuario(
        @Param('id') id: string,
        @Req() solicitud: any
    ) {
        const idAdministrador = solicitud.usuarioAutenticado.id
            || solicitud.usuarioAutenticado.sub;

        return this.adminPanelService.deshabilitarUsuario(
            id,
            idAdministrador
        );
    }

    @Post('usuarios/:id/habilitar')
    async habilitarUsuario(@Param('id') id: string) {
        return this.adminPanelService.habilitarUsuario(id);
    }

    @Post('usuarios')
    @UseInterceptors(
    FileInterceptor('imagenPerfil', {
        storage: memoryStorage()
    })
    )
    async crearUsuario(
    @Body() datos: CrearUsuarioDto,
    @UploadedFile() file?: Express.Multer.File
    ) {
    console.log('Archivo recibido:', file?.originalname);
    if (file) {
        const secureUrl = await this.fileService.cloudinaryUploader(
        file,
        'perfiles'
        );

        console.log('URL de Cloudinary:', secureUrl);
        datos.imagenPerfil = secureUrl;
    }
    return this.adminPanelService.crearUsuario(datos);
    }
}