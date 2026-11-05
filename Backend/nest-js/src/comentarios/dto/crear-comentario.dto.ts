import { IsNotEmpty, IsString } from 'class-validator';

export class CrearComentarioDto {

  @IsString()
  @IsNotEmpty()
  mensaje: string;
}