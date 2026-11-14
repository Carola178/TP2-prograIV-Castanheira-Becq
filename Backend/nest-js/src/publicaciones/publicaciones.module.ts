import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { EstadisticasService } from './estadisticas.service.js';
import {Publicacion, PublicacionSchema} from './entities/publicaciones.dto.js';
import {Usuario, UsuarioSchema} from '../usuarios/entities/usuario.entity.js';
import {Comentario, ComentarioSchema} from '../comentarios/entities/comentarios.dto.js';
import { FileService } from '../documentos/file.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Comentario.name, schema: ComentarioSchema }])],
      
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService, FileService]})

export class PublicacionesModule {}
