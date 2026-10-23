import { Controller, Post, Body, Res, Get, Param, UseGuards } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service.js';
import { CrearUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard.js';

@Controller('autenticacion')
export class AutenticacionController {
    constructor(private readonly autenticacionService: AutenticacionService) {}

    @Post('registro')
    async create(
        @Body() crearAuthDto: CrearUsuarioDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.autenticacionService.registrar(crearAuthDto);
        this.autenticacionService.setTokenCookie(res, result.token);
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
    async validateToken(@Param('id') id: string) {
        return this.autenticacionService.getPerfil(id);
    }
}