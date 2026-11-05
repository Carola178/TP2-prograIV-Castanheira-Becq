import { IsNotEmpty, IsString } from 'class-validator';

export class EditarComentarioDto {

  @IsString()
  @IsNotEmpty()
  mensaje: string;
}