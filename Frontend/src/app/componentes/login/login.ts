import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  isModalOpen = signal<boolean>(false);
  modalMensaje = signal<string>('');
  loginExitoso = false;
  verContrasena = false;

  loginModel = new FormGroup({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.email]}),

    password: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)]})
  });

  constructor(
    private auth: Auth, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  cerrarModal(): void {
      const wasSuccessful = this.loginExitoso;
      this.isModalOpen.set(false);
      
      if (wasSuccessful) {
        this.router.navigate(['/publicaciones']);
      }
    }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.loginModel.invalid) {
      this.loginModel.markAllAsTouched();
      this.loginExitoso = false;
      this.modalMensaje.set('Por favor, completa los campos correctamente.');
      this.isModalOpen.set(true);
      this.cdr.detectChanges();
      return;
    }

    const { email, password } = this.loginModel.getRawValue();
    
    this.auth.login(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.loginExitoso = true;
        this.modalMensaje.set('¡Has iniciado sesión correctamente!');
        this.isModalOpen.set(true);
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error en el login', error);
        this.loginExitoso = false;
        this.modalMensaje.set('Las credenciales son incorrectas. Inténtelo nuevamente.');
        this.isModalOpen.set(true);
        this.cdr.detectChanges(); 
      }
    });
  }
}