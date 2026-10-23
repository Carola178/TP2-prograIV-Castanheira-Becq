import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El formato de correo no es válido' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
    contrasena: string;
}