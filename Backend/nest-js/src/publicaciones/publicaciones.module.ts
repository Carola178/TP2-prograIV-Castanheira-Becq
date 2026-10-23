import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { PublicacionSchema } from './entities/publicaciones.dto.js';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Publicaciones', schema: PublicacionSchema}])],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
