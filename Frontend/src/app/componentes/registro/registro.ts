import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth'; 
import {passwordMatchValidator} from '../../validators/password-validator';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  registroModel: FormGroup;
  errorMessage = signal<string | null>(null);
  mostrarModal = signal<boolean>(false); 

  verContrasena = false;
  verRepetirContrasena = false;

  constructor() {
    this.registroModel = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(40)]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      fechaNacimiento: ['', [Validators.required, Validators.minLength(10)]],
      descripcionBreve: ['', [Validators.minLength(3), Validators.maxLength(200)]],
      imagenPerfil: [''],
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]], 
      repetirContrasena: ['', [Validators.required]] }, {validators: passwordMatchValidator()});
    }


  onDateInput(event: any) {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); 
    
    if (value.length > 2 && value.length <= 4) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    } else if (value.length > 4) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
    }
    
    input.value = value;
    this.registroModel.patchValue({ fechaNacimiento: value }, { emitEvent: false });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroModel.patchValue({ imagenPerfil: file });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    
    this.registroModel.markAllAsTouched();

    if (this.registroModel.errors?.['mismatch']) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    if (this.registroModel.invalid) {
      this.errorMessage.set('Por favor, completá todos los campos obligatorios correctamente.');
      return;
    }

    this.errorMessage.set(null);
    const valores = { ...this.registroModel.value };
    const imagenFile = valores.imagenPerfil; 
    delete valores.imagenPerfil;

    this.authService.registro(valores, imagenFile).subscribe({
      next: (response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.usuario) {
            localStorage.setItem('user', JSON.stringify(response.usuario));
          }
        }
        this.mostrarModal.set(true);
      },
      error: (error: any) => {
        console.error('Error en el registro:', error);
        this.errorMessage.set('Ocurrió un error al registrarse. Verificá los datos.');
      }
    });
  }

  irAlFeed() {
    this.mostrarModal.set(false);
    setTimeout(() => {
      this.router.navigate(['/publicaciones']);
    }, 50);
  }
}