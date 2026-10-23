import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicacionesDocument } from './entities/publicaciones.dto.js';

@Injectable()
export class PublicacionesService {
    constructor(@InjectModel('Publicacion') private readonly publicacionModel: Model<PublicacionesDocument>){}


    //     // 1. Crear publicación (asocia título, descripción, imagen y el ID del autor)
    // async crear(createPublicacionDto: CreatePublicacionDto, usuarioId: string): Promise<Publicacion> {
    //     const nuevaPublicacion = new this.publicacionModel({
    //     ...createPublicacionDto,
    //     autor: new Types.ObjectId(usuarioId),
    //     activo: true, // Para la baja lógica
    //     likes: [],
    //     });
    //     return await nuevaPublicacion.save();
    // }

    // // 2. Listar publicaciones (con paginación, ordenamiento por fecha o likes, y filtro por usuario)
    // async findAll(query: {
    //     limit?: string;
    //     offset?: string;
    //     sort?: 'fecha' | 'likes';
    //     usuarioId?: string;
    // }) {
    //     const limit = query.limit ? parseInt(query.limit, 10) : 10;
    //     const offset = query.offset ? parseInt(query.offset, 10) : 0;

    //     // Filtro base: solo las publicaciones activas (baja lógica)
    //     const filtro: any = { activo: true };

    //     if (query.usuarioId) {
    //     filtro.autor = new Types.ObjectId(query.usuarioId);
    //     }

    //     // Definir el ordenamiento
    //     let orden: any = { createdAt: -1 }; // Por defecto por fecha (más recientes primero)
    //     if (query.sort === 'likes') {
    //     // Ordena de forma descendente según la cantidad de elementos en el array de likes
    //     // (Nota: requiere un campo virtual o lógica adicional si se maneja de otra forma, 
    //     // pero con aggregate o ordenando por tamaño de array se puede resolver. 
    //     // Una forma sencilla en Mongoose es ordenando por el tamaño del array si la versión lo soporta, 
    //     // o se puede ordenar en memoria si la cantidad es baja, pero acá te dejo la estructura estándar).
    //     }

    //     return await this.publicacionModel
    //     .find(filtro)
    //     .populate('autor', 'nombre email') // Opcional: trae los datos del autor
    //     .sort(orden)
    //     .skip(offset)
    //     .limit(limit)
    //     .exec();
    // }

    // // 3. Baja lógica (solo el creador o un administrador)
    // async bajaLogica(id: string, usuarioId: string, esAdmin: boolean): Promise<Publicacion> {
    //     const publicacion = await this.publicacionModel.findById(id);
    //     if (!publicacion || !publicacion.activo) {
    //     throw new NotFoundException('Publicación no encontrada');
    //     }

    //     // Validar si es el dueño o es admin
    //     const esDueño = publicacion.autor.toString() === usuarioId;
    //     if (!esDueño && !esAdmin) {
    //     throw new ForbiddenException('No tenés permisos para eliminar esta publicación');
    //     }

    //     publicacion.activo = false;
    //     return await publicacion.save();
    // }

    // // 4. Dar Me Gusta (un usuario solo puede dar uno por publicación)
    // async darLike(id: string, usuarioId: string): Promise<Publicacion> {
    //     const publicacion = await this.publicacionModel.findById(id);
    //     if (!publicacion || !publicacion.activo) {
    //     throw new NotFoundException('Publicación no encontrada');
    //     }

    //     // $addToSet asegura que si el ID ya está, no lo duplica
    //     const actualizada = await this.publicacionModel.findByIdAndUpdate(
    //     id,
    //     { $addToSet: { likes: new Types.ObjectId(usuarioId) } },
    //     { new: true }
    //     );

    //     return actualizada;
    // }

    // // 5. Quitar Me Gusta (solo si previamente lo había realizado)
    // async quitarLike(id: string, usuarioId: string): Promise<Publicacion> {
    //     const publicacion = await this.publicacionModel.findById(id);
    //     if (!publicacion || !publicacion.activo) {
    //     throw new NotFoundException('Publicación no encontrada');
    //     }

    //     // $pull saca al usuario del array de likes si existía
    //     const actualizada = await this.publicacionModel.findByIdAndUpdate(
    //     id,
    //     { $pull: { likes: new Types.ObjectId(usuarioId) } },
    //     { new: true }
    //     );

    //     return actualizada;
    // }
}
