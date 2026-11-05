import {Injectable, ForbiddenException, NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {Comentario, ComentarioDocument} from './entities/comentarios.dto.js';

@Injectable()
export class ComentariosService {

  constructor(
    @InjectModel(Comentario.name)
    private comentarioModel: Model<ComentarioDocument>,

    @InjectModel('Publicacion')
    private publicacionModel: Model<any>
  ) {}

  async crear(
    idPublicacion: string,
    idUsuario: string,
    mensaje: string
  ) {

    if (!Types.ObjectId.isValid(idPublicacion)) {
      throw new BadRequestException('ID de publicación inválido');
    }

    const publicacion = await this.publicacionModel.findOne({
      _id: idPublicacion,
      activo: true
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comentario = new this.comentarioModel({
      publicacion: idPublicacion,
      autor: idUsuario,
      mensaje
    });

    await comentario.save();

    return comentario;
  }

  async obtener(
    idPublicacion: string,
    limite = 5,
    offset = 0
  ) {
    if (!Types.ObjectId.isValid(idPublicacion)) {
      throw new BadRequestException('ID de publicación inválido');
    }
    if (
      !Number.isInteger(limite) ||
      limite < 1 ||
      limite > 20 ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      throw new BadRequestException('Paginación inválida');
    }

    const publicacion = await this.publicacionModel.exists({
      _id: idPublicacion,
      activo: true
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const filtro = { publicacion: new Types.ObjectId(idPublicacion) };

    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 })
        .skip(offset)
        .limit(limite)
        .populate('autor', 'nombre apellido nombreUsuario imagenPerfil')
        .exec(),

      this.comentarioModel.countDocuments(filtro)
    ]);

    return {
      comentarios,
      total,
      limite,
      offset,
      hayMas: offset + comentarios.length < total
    };
  }

  async editar(idPublicacion: string, idComentario: string, idUsuario: string, mensaje: string) {
      if (!Types.ObjectId.isValid(idPublicacion) || !Types.ObjectId.isValid(idComentario)
      ) {
          throw new BadRequestException('ID inválido');
      }
      const comentario = await this.comentarioModel.findOne({_id: idComentario, publicacion: idPublicacion});

      if (!comentario) {
          throw new NotFoundException('Comentario no encontrado');
      }
      if (comentario.autor.toString() !== idUsuario.toString()) {
          throw new ForbiddenException(
              'No tenés permiso para editar este comentario'
          );
      }
      comentario.mensaje = mensaje;
      comentario.modificado = true;

      await comentario.save();
      return comentario;
  }
}