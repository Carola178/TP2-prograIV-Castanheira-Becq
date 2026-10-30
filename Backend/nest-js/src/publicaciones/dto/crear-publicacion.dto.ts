import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CrearPublicacionDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @IsOptional()
    urlImagen?: string;
}