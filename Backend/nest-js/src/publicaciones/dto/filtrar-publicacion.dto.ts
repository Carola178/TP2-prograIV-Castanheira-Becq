import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrarPublicacionDto {
    @IsOptional()
    @IsEnum(['fechaCreacion', 'cantidadMeGusta'])
    ordenarPor?: 'fechaCreacion' | 'cantidadMeGusta' = 'fechaCreacion';

    @IsOptional()
    @IsString()
    idUsuario?: string;

    @IsOptional()
    @Type(() => Number) 
    limite?: number; 

    @IsOptional()
    @Type(() => Number) 
    offset?: number; 
}