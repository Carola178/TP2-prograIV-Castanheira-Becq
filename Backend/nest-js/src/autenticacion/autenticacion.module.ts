import { Module } from '@nestjs/common';
import { AutenticacionController } from './autenticacion.controller.js';
import { AutenticacionService } from './autenticacion.service.js';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity.js';
import { PasswordHasher } from '@nestjs/authentication';
import { FileService } from '../documentos/file.service.js';

@Module({
  imports: [ConfigModule.forRoot(), JwtModule.register({
      global: true,
      secret: process.env.JWT_secret || 'secreto_super_seguro',
      signOptions: { expiresIn: '15m' },
    }),
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, PasswordHasher, FileService],
  exports: [AutenticacionService, PasswordHasher],
})
export class AutenticacionModule {} 