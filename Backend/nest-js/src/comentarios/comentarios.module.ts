import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import {Comentario, ComentarioSchema} from './entities/comentarios.dto.js';
import {Publicacion, PublicacionSchema} from '../publicaciones/entities/publicaciones.dto.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comentario.name,
        schema: ComentarioSchema
      },
      {
        name: Publicacion.name,
        schema: PublicacionSchema
      }
    ])
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService]
})
export class ComentariosModule {}