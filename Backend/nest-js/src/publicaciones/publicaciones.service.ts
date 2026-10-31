import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './entities/publicaciones.dto.js';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity.js'; 
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionDto } from './dto/filtrar-publicacion.dto.js';

@Injectable()
export class PublicacionesService {
    constructor(
        @InjectModel(Publicacion.name) private publicacionModel: Model<PublicacionDocument>,
        @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
    ) {}

    async crear(crearPublicacionDto: CrearPublicacionDto, idUsuario: string) {
        // 1. Crear y guardar la publicación
        const nuevaPublicacion = new this.publicacionModel({
            ...crearPublicacionDto,
            autor: idUsuario
        });
        await nuevaPublicacion.save();

        // 2. Vincularla al usuario para que el populate la encuentre
        await this.usuarioModel.findByIdAndUpdate(idUsuario, {
            $push: { publicaciones: nuevaPublicacion._id }
        });

        return nuevaPublicacion;
    }

    async obtenerTodos(filtros: FiltrarPublicacionDto, idUsuarioActual?: string) {
        const limite = Number(filtros.limite) || 10;
        const offset = Number(filtros.offset) || 0;
        
        // Mapeamos 'fechaCreacion' al nombre real del campo generado por timestamps ('createdAt')
        const criterio = filtros.ordenarPor === 'fechaCreacion' ? 'createdAt' : 'cantidadMeGusta';

        // Filtramos solo las publicaciones activas (baja lógica)
        const query: any = { activo: true };
        if (filtros.idUsuario) {
            query.autor = filtros.idUsuario;
        }

        const datos = await this.publicacionModel
            .find(query)
            .sort({ [criterio]: -1 }) // Orden descendente (más recientes o más likes primero)
            .skip(offset)
            .limit(limite)
            .populate('autor', 'nombre avatar')
            .exec();

        const total = await this.publicacionModel.countDocuments(query);

        // Mapeamos los datos para inyectar si le gusta al usuario actual según tu esquema
        const datosConLike = datos.map(pub => {
            const pubObj = pub.toObject();
            const leGusta = idUsuarioActual 
                ? pub.usuariosQueDieronMeGusta?.some(id => id.toString() === idUsuarioActual)
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

    async eliminar(idPublicacion: string, idUsuarioActual: string, rolUsuario?: string) {
    const publicacion = await this.publicacionModel.findById(idPublicacion);
    if (!publicacion) {
        throw new NotFoundException('Publicación no encontrada');
    }

    // Permitir si es el autor O si es administrador
    const esAutor = publicacion.autor.toString() === idUsuarioActual;
    const esAdmin = rolUsuario === 'admin'; // Ajusta esto según cómo guardes el rol en tu BD (ej: rol, roles, etc.)

    if (!esAutor && !esAdmin) {
        throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    // Eliminar de la colección principal
    await this.publicacionModel.findByIdAndDelete(idPublicacion);

    // Remover la referencia del array de publicaciones del autor original
    await this.usuarioModel.findByIdAndUpdate(publicacion.autor, {
        $pull: { publicaciones: idPublicacion }
    });

    return { mensaje: 'Publicación eliminada con éxito' };
}

    async darMeGusta(idPublicacion: string, idUsuario: string) {
        const publicacion = await this.publicacionModel.findById(idPublicacion);
        if (!publicacion) {
            throw new NotFoundException('Publicación no encontrada');
        }

        // $addToSet asegura que el usuario no se duplique en el array
        // $inc incrementa en 1 el contador cantidadMeGusta
        const updated = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            { 
                $addToSet: { usuariosQueDieronMeGusta: idUsuario },
                $inc: { cantidadMeGusta: 1 } 
            },
            { new: true }
        );

        return { mensaje: 'Me gusta registrado con éxito', publicacion: updated };
    }

    async quitarMeGusta(idPublicacion: string, idUsuario: string) {
        const publicacion = await this.publicacionModel.findById(idPublicacion);
        if (!publicacion) {
            throw new NotFoundException('Publicación no encontrada');
        }

        // Evitamos que la cantidad baje de 0 por seguridad
        const nuevaCantidad = Math.max(0, (publicacion.cantidadMeGusta || 1) - 1);

        // $pull saca al usuario del array de likes
        const updated = await this.publicacionModel.findByIdAndUpdate(
            idPublicacion,
            { 
                $pull: { usuariosQueDieronMeGusta: idUsuario },
                cantidadMeGusta: nuevaCantidad 
            },
            { new: true }
        );

        return { mensaje: 'Me gusta eliminado con éxito', publicacion: updated };
    }
}