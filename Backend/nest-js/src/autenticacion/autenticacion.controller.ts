import { Controller, Post, Body, Res, Get, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service.js';
import { FileService } from '../documentos/file.service.js'; 
import { CrearUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard.js';

@Controller('autenticacion')
export class AutenticacionController {
    constructor(
        private readonly autenticacionService: AutenticacionService,
        private readonly fileService: FileService,
    ) {}

    @Post('registro')
    @UseInterceptors(
        FileInterceptor('imagenPerfil', {
            storage: memoryStorage(),
        }),
    )
    async registro(
        @Body() crearUsuarioDto: CrearUsuarioDto,
        @UploadedFile() file?: Express.Multer.File,
        @Res({ passthrough: true }) res?: any
    ) {
        if (file) {
            const secureUrl = await this.fileService.cloudinaryUploader(file, 'perfiles');
            crearUsuarioDto.imagenPerfil = secureUrl; 
        }
        const result = await this.autenticacionService.registrar(crearUsuarioDto);

        if (res) {
            this.autenticacionService.setTokenCookie(res, result.token);
        }
        return result;
    }

    @Post('login')
    async login(
        @Body() loginAuthDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.autenticacionService.login(loginAuthDto);
        this.autenticacionService.setTokenCookie(res, result.token);
        return result;
    }

    @Get('perfil/:id')
    @UseGuards(AuthGuard)
    async obtenerPerfil(@Param('id') id: string) {
        return this.autenticacionService.getPerfil(id);
    }
}