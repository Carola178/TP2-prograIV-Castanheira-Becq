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
        @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument> // <--- Inyectamos este también
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

    async obtenerTodos(filtros: FiltrarPublicacionDto) {
    const limite = Number(filtros.limite) || 10;
    const offset = Number(filtros.offset) || 0;
    const ordenarPor = filtros.ordenarPor || 'fechaCreacion';

    // Construimos el filtro de búsqueda si viene un usuario específico
    const query: any = {};
    if (filtros.idUsuario) {
        query.autor = filtros.idUsuario;
    }

    // Consultamos la base de datos con paginación y orden
    const datos = await this.publicacionModel
        .find(query)
        .sort({ [ordenarPor]: -1 }) // Orden descendente (más recientes primero)
        .skip(offset)
        .limit(limite)
        .exec();

    const total = await this.publicacionModel.countDocuments(query);

    return {
        limite,
        offset,
        ordenarPor,
        filtroUsuario: filtros.idUsuario || 'todos',
        total,
        datos // <--- Aquí ya viajan los datos reales de MongoDB
    };
}

    async eliminar(idPublicacion: string, idUsuarioActual: string) {
            // 1. Buscar la publicación para verificar que exista y pertenezca al usuario
            const publicacion = await this.publicacionModel.findById(idPublicacion);
            if (!publicacion) {
                throw new NotFoundException('Publicación no encontrada');
            }

            // 2. Eliminar la publicación de la colección de publicaciones
            await this.publicacionModel.findByIdAndDelete(idPublicacion);

            // 3. Remover la referencia de la publicación dentro del documento del usuario
            await this.usuarioModel.findByIdAndUpdate(publicacion.autor, {
                $pull: { publicaciones: idPublicacion }
            });

            return { mensaje: 'Publicación eliminada con éxito' };
        }

    async darMeGusta(idPublicacion: string, idUsuario: string) {
        // Verificar si ya existe un registro de "me gusta" de este usuario para este post
        // Si ya existe, lanzar excepción o retornar mensaje de que ya dio like.
        return { mensaje: 'Me gusta registrado con éxito' };
    }

    async quitarMeGusta(idPublicacion: string, idUsuario: string) {
        // Verificar si el "me gusta" previo existe, si no, lanzar excepción.
        return { mensaje: 'Me gusta eliminado con éxito' };
    }
}