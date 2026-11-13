import {Injectable, ForbiddenException, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.dto.js';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionDto } from './dto/filtrar-publicacion.dto.js';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name)
        private publicacionModel: Model<PublicacionDocument>,

        @InjectModel(Usuario.name)
        private usuarioModel: Model<UsuarioDocument>
    ) {}

    async crear(crearPublicacionDto: CrearPublicacionDto, idUsuario: string) {
        const nuevaPublicacion = new this.publicacionModel({
            ...crearPublicacionDto,
            autor: idUsuario
        });

        await nuevaPublicacion.save();

        await this.usuarioModel.findByIdAndUpdate(idUsuario, {
            $push: { publicaciones: nuevaPublicacion._id }
        });

        return nuevaPublicacion;
    }

    async obtenerTodos(filtros: FiltrarPublicacionDto, idUsuarioActual?: string) {
        const limite = Number(filtros.limite) || 10;
        const offset = Number(filtros.offset) || 0;

        const criterio = filtros.ordenarPor === 'fechaCreacion'
            ? 'createdAt'
            : 'cantidadMeGusta';

        const query: any = { activo: true };

        if (filtros.idUsuario) {
            query.autor = filtros.idUsuario;
        }

        const datos = await this.publicacionModel
            .find(query)
            .sort({ [criterio]: -1 })
            .skip(offset)
            .limit(limite)
            .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
            .exec();

        const total = await this.publicacionModel.countDocuments(query);

        const datosConLike = datos.map(pub => {
            const pubObj = pub.toObject();

            const leGusta = idUsuarioActual
                ? pub.usuariosQueDieronMeGusta?.some(
                    id => id.toString() === idUsuarioActual
                )
                : false;

            return {
                ...pubObj,
                leGustaAlUsuarioActual: leGusta
            };
        });

        return {
            limite,
            offset,
            ordenarPor: filtros.ordenarPor || 'fechaCreacion',
            filtroUsuario: filtros.idUsuario || 'todos',
            total,
            datos: datosConLike
        };
    }

    async eliminar(idPublicacion: string, idUsuarioActual: string) {
        if (!Types.ObjectId.isValid(idPublicacion)) {
            throw new BadRequestException('ID de publicación inválido');
        }

        if (!idUsuarioActual || !Types.ObjectId.isValid(idUsuarioActual)) {
            throw new ForbiddenException('Usuario no autorizado');
        }

        const publicacion = await this.publicacionModel.findById(idPublicacion);

        if (!publicacion || publicacion.activo === false) {
            throw new NotFoundException(
                'Publicación no encontrada o deshabilitada'
            );
        }

        const usuarioActual = await this.usuarioModel.findById(idUsuarioActual);
        console.log('ID usuario autenticado:', idUsuarioActual);
        console.log('Usuario encontrado:', usuarioActual?.nombreUsuario);
        console.log('Perfil del usuario:', usuarioActual?.perfil);
        console.log('Usuario activo:', usuarioActual?.activo);
        console.log('Autor de la publicación:', publicacion.autor.toString());

        if (!usuarioActual || usuarioActual.activo === false) {
            throw new ForbiddenException('Usuario no autorizado');
        }

        const esAutor = publicacion.autor.toString() === idUsuarioActual;
        const esAdministrador = usuarioActual.perfil === 'administrador';

        if (!esAutor && !esAdministrador) {
            throw new ForbiddenException(
                'No tenés permiso para deshabilitar esta publicación'
            );
        }

        publicacion.activo = false;
        await publicacion.save();

        return {
            mensaje: 'Publicación deshabilitada correctamente'
        };
    }

    async darMeGusta(idPublicacion: string, idUsuario: string) {
        if (!Types.ObjectId.isValid(idPublicacion)) {
            throw new BadRequestException('ID de publicación inválido');
        }

        if (!idUsuario || !Types.ObjectId.isValid(idUsuario)) {
            throw new ForbiddenException('Usuario no autorizado');
        }

        const publicacion = await this.publicacionModel.findOne({
            _id: idPublicacion,
            activo: true
        });

        if (!publicacion) {
            throw new NotFoundException(
                'Publicación no encontrada o deshabilitada'
            );
        }

        const updated = await this.publicacionModel.findOneAndUpdate(
            {
                _id: idPublicacion,
                activo: true,
                usuariosQueDieronMeGusta: { $ne: new Types.ObjectId(idUsuario) }
            },
            {
                $addToSet: {
                    usuariosQueDieronMeGusta: new Types.ObjectId(idUsuario)
                },
                $inc: { cantidadMeGusta: 1 }
            },
            { new: true }
        );

        if (!updated) {
            return {
                mensaje: 'El usuario ya había dado Me gusta',
                publicacion
            };
        }

        return {
            mensaje: 'Me gusta registrado con éxito',
            publicacion: updated
        };
    }

    async quitarMeGusta(idPublicacion: string, idUsuario: string) {
        if (!Types.ObjectId.isValid(idPublicacion)) {
            throw new BadRequestException('ID de publicación inválido');
        }

        if (!idUsuario || !Types.ObjectId.isValid(idUsuario)) {
            throw new ForbiddenException('Usuario no autorizado');
        }

        const publicacion = await this.publicacionModel.findOne({
            _id: idPublicacion,
            activo: true
        });

        if (!publicacion) {
            throw new NotFoundException(
                'Publicación no encontrada o deshabilitada'
            );
        }

        const updated = await this.publicacionModel.findOneAndUpdate(
            {
                _id: idPublicacion,
                activo: true,
                usuariosQueDieronMeGusta: new Types.ObjectId(idUsuario)
            },
            {
                $pull: {
                    usuariosQueDieronMeGusta: new Types.ObjectId(idUsuario)
                },
                $inc: { cantidadMeGusta: -1 }
            },
            { new: true }
        );

        if (!updated) {
            return {
                mensaje: 'El usuario no había dado Me gusta',
                publicacion
            };
        }

        return {
            mensaje: 'Me gusta eliminado con éxito',
            publicacion: updated
        };
    }

    async obtenerPorId(idPublicacion: string, idUsuarioActual?: string) {
        if (!Types.ObjectId.isValid(idPublicacion)) {
            throw new BadRequestException('ID de publicación inválido');
        }

        const publicacion = await this.publicacionModel
            .findOne({
                _id: idPublicacion,
                activo: true
            })
            .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
            .exec();

        if (!publicacion) {
            throw new NotFoundException('Publicación no encontrada');
        }

        const leGusta = idUsuarioActual
            ? publicacion.usuariosQueDieronMeGusta?.some(
                id => id.toString() === idUsuarioActual
            )
            : false;

        return {
            ...publicacion.toObject(),
            leGustaAlUsuarioActual: leGusta
        };
    }
}
