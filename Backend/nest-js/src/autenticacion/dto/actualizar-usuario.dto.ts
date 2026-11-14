
import { IsOptional, IsString, IsEmail, MaxLength, MinLength } from 'class-validator';

export class ActualizarPerfilDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    nombre?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    apellido?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    nombreUsuario?: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    descripcionBreve?: string;
}
