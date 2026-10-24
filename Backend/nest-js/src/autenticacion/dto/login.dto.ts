import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'El campo no puede estar vacío' })
    email: string; 

    @IsString()
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
    contrasena: string;
}