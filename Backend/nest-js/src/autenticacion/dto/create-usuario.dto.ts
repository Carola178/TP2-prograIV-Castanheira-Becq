import { IsString, IsEmail, MinLength, Matches, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CrearUsuarioDto {
    @IsString({ message: 'El nombre debe ser texto' })
    nombre: string;

    @IsString({ message: 'El apellido debe ser texto' })
    apellido: string;

    @IsEmail({}, { message: 'El formato de correo no es válido' })
    email: string;

    @IsString({ message: 'El nombre de usuario debe ser texto' })
    nombreUsuario: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/(?=.*[A-Z])/, { message: 'La contraseña debe incluir al menos una letra mayúscula' })
    @Matches(/(?=.*\d)/, { message: 'La contraseña debe incluir al menos un número' })
    contrasena: string;

    @IsString()
    @IsOptional() 
        repetirContrasena?: string;

    @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato válido' })
    fechaNacimiento: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    descripcionBreve?: string;

    @IsOptional()
    @IsString({ message: 'La imagen de perfil debe ser una ruta válida' })
    imagenPerfil?: string; 

    @IsOptional()
    @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser usuario o administrador' })
    perfil?: string;
}