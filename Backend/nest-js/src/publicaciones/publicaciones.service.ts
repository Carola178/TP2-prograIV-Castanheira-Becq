import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
        
        const criterio = filtros.ordenarPor === 'fechaCreacion' ? 'createdAt' : 'cantidadMeGusta';

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

    const esAutor = publicacion.autor.toString() === idUsuarioActual;
    const esAdmin = rolUsuario === 'admin'; 

    if (!esAutor && !esAdmin) {
        throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    await this.publicacionModel.findByIdAndDelete(idPublicacion);

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

    const updated = await this.publicacionModel.findOneAndUpdate(
        {
            _id: idPublicacion,
            usuariosQueDieronMeGusta: idUsuario
        },
        {
            $pull: { usuariosQueDieronMeGusta: idUsuario },
            $inc: { cantidadMeGusta: -1 }
        },
        { new: true }
    );

    if (!updated) {
        const publicacion = await this.publicacionModel.findById(idPublicacion);

        if (!publicacion) {
            throw new NotFoundException('Publicación no encontrada');
        }

        return {
            mensaje: 'El usuario no había dado me gusta',
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
          .findOne({ _id: idPublicacion, activo: true })
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