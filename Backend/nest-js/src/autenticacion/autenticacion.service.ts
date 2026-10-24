import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrearUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '@nestjs/authentication';
import { Response } from 'express';

@Injectable()
export class AutenticacionService {
    constructor(
        @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,
        private readonly jwtService: JwtService,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async login(loginAuthDto: LoginDto) {
            const user = await this.usuarioModel.findOne({
                $or: [
                    { email: loginAuthDto.email },
                    { nombreUsuario: loginAuthDto.email }
                ]
            });

            const isPasswordValid = user ? await this.passwordHasher.verify(loginAuthDto.contrasena, user.contrasena) : false;

            if (!user || !isPasswordValid) {
                throw new UnauthorizedException('Credenciales incorrectas. Intente nuevamente');
            }

            return this.generateToken(user);
        }

    async registrar(createAuthDto: CrearUsuarioDto) {
            if (!createAuthDto.email || !createAuthDto.nombreUsuario) {
                throw new BadRequestException('Faltan datos obligatorios en el registro.');
            }

            const existeUsuario = await this.usuarioModel.findOne({
                $or: [
                    { email: createAuthDto.email }, 
                    { nombreUsuario: createAuthDto.nombreUsuario }
                ]
            });

            if (existeUsuario) {
                throw new BadRequestException('El correo o el nombre de usuario ya se encuentran registrados.');
            }

            const hashedPassword = await this.passwordHasher.hash(createAuthDto.contrasena);

            const nuevoUsuarioData = {
                ...createAuthDto,
                contrasena: hashedPassword,
                perfil: createAuthDto.perfil || 'usuario', 
            };

            const nuevoUsuario = await this.usuarioModel.create(nuevoUsuarioData);
            if (!nuevoUsuario) {
                throw new InternalServerErrorException('No se pudo crear el usuario.');
            }
            return this.generateToken(nuevoUsuario);
        }

    async getPerfil(id: string) {
        const user = await this.usuarioModel.findById(id).select('-contrasena');
        if (!user) {
            throw new BadRequestException('No se pudo obtener el perfil del usuario');
        }
        return user;
    }

    async generateToken(usuario: UsuarioDocument) {
        const payload = { email: usuario.email, sub: usuario._id, perfil: usuario.perfil };
        const token = await this.jwtService.signAsync(payload);
        return { token, usuario };
    }

    setTokenCookie(res: Response, token: string) {
        res.cookie('Token', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
            maxAge: 1000 * 60 * 15,
        });
    }
}