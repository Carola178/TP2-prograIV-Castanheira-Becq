import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth'; 

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

  registroModel: FormGroup;
  errorMessage = signal<string | null>(null); 

  constructor() {
    this.registroModel = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcionBreve: [''],
      imagenPerfil: [''], 
      contrasena: [              
        '', 
        [
          Validators.required, 
          Validators.minLength(8), 
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
        ]
      ],
      repetirContrasena: ['', [Validators.required]] // Coincide con el DTO del backend
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const contrasena = form.get('contrasena')?.value;
    const repetirContrasena = form.get('repetirContrasena')?.value;
    return contrasena === repetirContrasena ? null : { mismatch: true };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroModel.patchValue({ imagenPerfil: file });
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    
    if (this.registroModel.invalid) {
      this.registroModel.markAllAsTouched();
      return;
    }

    try {
      const datosFormulario = this.registroModel.value;
      await firstValueFrom(this.authService.registro(datosFormulario));
      
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error en el registro', error);
      this.errorMessage.set('Ocurrió un error al registrarse. Verificá los datos.');
    }
  }
}