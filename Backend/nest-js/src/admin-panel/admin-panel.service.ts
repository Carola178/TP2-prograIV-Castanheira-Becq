import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {Usuario, UsuarioDocument} from '../usuarios/entities/usuario.entity.js';
import { PasswordHasher } from '@nestjs/authentication';
import { CrearUsuarioDto } from '../autenticacion/dto/create-usuario.dto.js';

@Injectable()
export class AdminPanelService {
    constructor(
        @InjectModel(Usuario.name)
        private readonly usuarioModel: Model<UsuarioDocument>,
        private readonly passwordHasher: PasswordHasher
    ) {}

    async listarUsuarios() {
        return this.usuarioModel
            .find()
            .select('-contrasena')
            .sort({ createdAt: -1 })
            .exec();
    }
    
        async deshabilitarUsuario(
        id: string,
        idAdministrador: string
    ) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID de usuario inválido');
        }
        if (id === idAdministrador) {
            throw new ForbiddenException(
                'No podés deshabilitar tu propia cuenta'
            );
        }

        const usuario = await this.usuarioModel.findById(id);
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        if (usuario.activo === false) {
            throw new BadRequestException(
                'El usuario ya se encuentra deshabilitado'
            );
        }
        usuario.activo = false;
        await usuario.save();
        return {
            mensaje: 'Usuario deshabilitado correctamente',
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                perfil: usuario.perfil,
                activo: usuario.activo
            }
        };
    }


    async habilitarUsuario(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('ID de usuario inválido');
        }
        const usuario = await this.usuarioModel.findById(id);
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        if (usuario.activo !== false) {
            throw new BadRequestException(
                'El usuario ya se encuentra habilitado'
            );
        }
        usuario.activo = true;
        await usuario.save();
        return {
            mensaje: 'Usuario habilitado correctamente',
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                perfil: usuario.perfil,
                activo: usuario.activo
            }
        };
    }


    async crearUsuario(datos: CrearUsuarioDto) {
    const perfil = datos.perfil ?? 'usuario';
    if (!['usuario', 'administrador'].includes(perfil)) {
        throw new BadRequestException('Perfil inválido');
    }
    const existeUsuario = await this.usuarioModel.findOne({
        $or: [
            { email: datos.email },
            { nombreUsuario: datos.nombreUsuario }
        ]
    });
    if (existeUsuario) {
        throw new ConflictException(
            'El correo o nombre de usuario ya está registrado'
        );
    }
    const contrasenaHash = await this.passwordHasher.hash(datos.contrasena);
    const nuevoUsuario = await this.usuarioModel.create({
        ...datos,
        contrasena: contrasenaHash,
        perfil,
        activo: true
    });
    const { contrasena, ...usuarioSeguro } = nuevoUsuario.toObject();
    return {
        mensaje: 'Usuario creado correctamente',
        usuario: usuarioSeguro
    };
}
}
