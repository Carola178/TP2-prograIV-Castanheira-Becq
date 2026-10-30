import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>
    ) {}
    async findAll(){
        return this.usuarioModel.find().exec();
    }

    async findOne(id: string){
        return this.usuarioModel.findById(id).populate('publicaciones').exec();
    }

    // async update(id: string, updateUsuarioDto: UpdateUsuarioDto){
    //     return this.usuarioModel.findByIaAndUpdate(id, updateUsuarioDto, {upsert: true, new: true}).exec();
    // }

    async remove(id:string){
        return this.usuarioModel.deleteOne({_id: id}).exec();

    }
}
