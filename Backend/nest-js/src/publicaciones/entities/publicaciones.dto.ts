import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion {

    @Prop({ required: true })
    titulo: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop({ default: '' })
    urlImagen?: string;

    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
    autor: Types.ObjectId; // O string si manejas los IDs como texto

    @Prop({ default: 0 })
    cantidadMeGusta: number;

    @Prop({ type: [Types.ObjectId], ref: 'Usuario', default: [] })
    usuariosQueDieronMeGusta: Types.ObjectId[]; // Clave para controlar que sea un solo like por usuario

    @Prop({ default: true })
    activo: boolean; // Necesario para la baja lógica
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);