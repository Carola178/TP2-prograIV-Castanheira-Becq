import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

export type PublicacionesDocument = HydratedDocument<Publicacion>

@Schema()
export class Publicacion{

    @Prop()
    autor: string;

    @Prop()
    contenido: string;

    @Prop()
    likes: number;

    
}
//Con esto le asignamos el esquema a la clase, la convertimos en uno. Despues se lo pasamos a services
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
