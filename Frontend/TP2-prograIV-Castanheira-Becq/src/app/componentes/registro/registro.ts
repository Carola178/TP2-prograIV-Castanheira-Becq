import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  registroModel: FormGroup;
  errorMessage = signal<string | null>(null); // O podés usar una propiedad común si no usas signals

  constructor(private fb: FormBuilder, private router: Router) {
    this.registroModel = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: [''],
      imagenPerfil: [null], // Campo para el archivo
      password: [
        '', 
        [
          Validators.required, 
          Validators.minLength(8), 
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // Al menos una mayúscula y un número
        ]
      ],
      repetirPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator // Validador opcional para comparar contraseñas
    });
  }

  // Validador personalizado opcional para verificar que password y repetirPassword coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const repetirPassword = form.get('repetirPassword')?.value;
    return password === repetirPassword ? null : { mismatch: true };
  }

  // Manejo del archivo de imagen seleccionado
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroModel.patchValue({ imagenPerfil: file });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.registroModel.valid) {
      console.log('Datos del formulario de registro:', this.registroModel.value);
      // Aquí posteriormente conectarás con tu servicio de NestJS por POST
    }
  }
}