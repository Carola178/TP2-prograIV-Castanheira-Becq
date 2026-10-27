import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicacionesDocument } from './entities/publicaciones.dto.js';

@Injectable()
export class PublicacionesService {
    constructor(@InjectModel('Publicacion') private readonly publicacionModel: Model<PublicacionesDocument>){}


}
