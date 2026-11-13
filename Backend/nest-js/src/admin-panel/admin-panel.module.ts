import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminPanelController } from './admin-panel.controller.js';
import { AdminPanelService } from './admin-panel.service.js';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity.js';
import { AutenticacionModule } from '../autenticacion/autenticacion.module.js';
import { FileService } from '../documentos/file.service.js';
import { AuthGuard } from '../autenticacion/guards/auth.guard.js';
import { AdminGuard } from './guards/admin.guard.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Usuario.name, schema: UsuarioSchema }
        ]),
        AutenticacionModule
    ],
    controllers: [AdminPanelController],
    providers: [
        AdminPanelService,
        AuthGuard,
        AdminGuard,
        FileService
    ]
})
export class AdminPanelModule {}
