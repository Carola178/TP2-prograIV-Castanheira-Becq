import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutenticacionModule } from './autenticacion/autenticacion.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { ComentariosModule } from './comentarios/comentarios.module.js';
import { AdminPanelModule } from './admin-panel/admin-panel.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('CONNECTION_STRING'),
      }),
      inject: [ConfigService],
    }),
    AutenticacionModule,
    PublicacionesModule,
    UsuariosModule,
    ComentariosModule,
    AdminPanelModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}