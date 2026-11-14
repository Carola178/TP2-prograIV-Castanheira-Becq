import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrearUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '@nestjs/authentication';
import { Response } from 'express';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ActualizarPerfilDto } from './dto/actualizar-usuario.dto.js';

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

        const isPasswordValid = user
            ? await this.passwordHasher.verify(
                loginAuthDto.contrasena,
                user.contrasena
            )
            : false;
        if (!user || !isPasswordValid) {
            throw new UnauthorizedException(
                'Credenciales incorrectas. Intente nuevamente'
            );
        }
        if (user.activo === false) {
            throw new UnauthorizedException(
                'Tu cuenta se encuentra deshabilitada. No estás autorizado para ingresar.'
            );
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
                perfil: 'usuario', 
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
        const payload = {
            email: usuario.email,
            sub: usuario._id.toString(),
            perfil: usuario.perfil
        };

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '15m'
        });

        const tokenDecodificado = this.jwtService.decode(token) as {
            exp: number;
        };

        const expiraEn = tokenDecodificado.exp * 1000;

        const { contrasena, ...usuarioSeguro } = usuario.toObject();

        return {
            token,
            usuario: usuarioSeguro,
            expiraEn
        };
    }

    setTokenCookie(res: Response, token: string) {
        const esProduccion = process.env.NODE_ENV === 'production';

        res.cookie('Token', token, {
            httpOnly: true,
            secure: esProduccion,
            sameSite: esProduccion ? 'none' : 'lax',
            maxAge: 1000 * 60 * 15,
            path: '/',
        });
    }

    async autorizar(idUsuario: string) {
        const usuario = await this.usuarioModel.findById(idUsuario).select('-contrasena');
        if (!usuario || usuario.activo === false) {
            throw new UnauthorizedException(
                'Usuario inexistente o cuenta deshabilitada'
            );
        }
        return usuario;
    }

    async refrescar(idUsuario: string) {
        const usuario = await this.usuarioModel.findById(idUsuario);

        if (!usuario || usuario.activo === false) {
            throw new UnauthorizedException(
                'Usuario inexistente o cuenta deshabilitada'
            );
        }
        const token = await this.jwtService.signAsync({
            sub: usuario._id.toString(),
            perfil: usuario.perfil
        });
        const { contrasena, ...usuarioSeguro } = usuario.toObject();
        const expiraEn = Date.now() + 15 * 60 * 1000;
        return {
            token,
            usuario: usuarioSeguro,
            expiraEn
        };
    }

    async actualizarPerfil(
        idUsuario: string,
        datos: ActualizarPerfilDto,
        imagenPerfil?: string
    ) {
        const usuario = await this.usuarioModel.findById(idUsuario);

        if (!usuario || usuario.activo === false) {
            throw new NotFoundException('Usuario no encontrado o deshabilitado');
        }

        if (datos.email || datos.nombreUsuario) {
            const condiciones: any[] = [];

            if (datos.email) {
                condiciones.push({ email: datos.email });
            }

            if (datos.nombreUsuario) {
                condiciones.push({ nombreUsuario: datos.nombreUsuario });
            }

            const usuarioExistente = await this.usuarioModel.findOne({
                _id: { $ne: idUsuario },
                $or: condiciones
            });

            if (usuarioExistente) {
                throw new ConflictException(
                    'El correo o nombre de usuario ya está registrado.'
                );
            }
        }

        Object.assign(usuario, datos);

        if (imagenPerfil) {
            usuario.imagenPerfil = imagenPerfil;
        }

        await usuario.save();

        const { contrasena, ...usuarioSeguro } = usuario.toObject();

        return usuarioSeguro;
    }

}