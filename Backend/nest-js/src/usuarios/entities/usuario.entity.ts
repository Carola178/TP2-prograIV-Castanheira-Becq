import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    apellido: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    nombreUsuario: string;

    @Prop({ required: true })
    contrasena: string;

    @Prop({ required: true })
    fechaNacimiento: string;

    @Prop()
    descripcionBreve: string;

    @Prop()
    imagenPerfil: string;

    @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
    perfil: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion' }], default: [] })
    publicaciones: mongoose.Types.ObjectId[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);