import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  private cdr = inject(ChangeDetectorRef);

  registroModel: FormGroup;
  errorMessage = signal<string | null>(null);
  mostrarModal = signal<boolean>(false); 

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
      repetirContrasena: ['', [Validators.required]] 
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

  onSubmit(event: Event) {
    event.preventDefault();
    
    if (this.registroModel.invalid) {
      this.registroModel.markAllAsTouched();
      return;
    }

    const valores = { ...this.registroModel.value };
    const imagenFile = valores.imagenPerfil; 
    delete valores.imagenPerfil;

    this.authService.registro(valores, imagenFile).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso, abriendo modal...');
        
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