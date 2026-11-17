
import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
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
  procesandoLogin = false;

  ingresoAdministrador = false;
  rutaDestino = '/publicaciones';

  loginModel = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40)
      ]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20)
      ]
    })
  });

  private auth = inject(Auth);

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  cerrarModal(): void {
    const wasSuccessful = this.loginExitoso;

    this.isModalOpen.set(false);

    if (wasSuccessful) {
      this.router.navigateByUrl(this.rutaDestino);
    }
  }

  ingresarComoAdministrador(): void {
    this.onSubmit(undefined, true);
  }

  onSubmit(event?: Event, comoAdministrador = false): void {
    event?.preventDefault();

    if (this.procesandoLogin) {
      return;
    }

    this.ingresoAdministrador = comoAdministrador;

    if (this.loginModel.invalid) {
      this.loginModel.markAllAsTouched();

      this.loginExitoso = false;
      this.modalMensaje.set(
        'Por favor, completa los campos correctamente.'
      );

      this.isModalOpen.set(true);
      this.cdr.detectChanges();
      return;
    }

    const { email, password } = this.loginModel.getRawValue();

    this.procesandoLogin = true;

    this.auth.login(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso');

        const esAdministrador =
          response.usuario?.perfil === 'administrador';

        // Si intenta ingresar como administrador sin tener el rol
        if (this.ingresoAdministrador && !esAdministrador) {

          this.loginExitoso = false;
          this.ingresoAdministrador = false;

          this.auth.cerrarSesionSinRedireccion().subscribe({
            next: () => {
              this.procesandoLogin = false;

              this.modalMensaje.set(
                'Tu cuenta no tiene permisos de administrador.'
              );

              this.isModalOpen.set(true);
              this.cdr.detectChanges();
            },

            error: (err) => {
              console.error('Error al cerrar sesión:', err);

              this.auth.limpiarSesion();
              this.procesandoLogin = false;

              this.modalMensaje.set(
                'Tu cuenta no tiene permisos de administrador. No se pudo confirmar el cierre de sesión.'
              );

              this.isModalOpen.set(true);
              this.cdr.detectChanges();
            }
          });

          return;
        }

        this.rutaDestino = this.ingresoAdministrador
          ? '/admin-panel'
          : '/publicaciones';

        this.loginExitoso = true;
        this.procesandoLogin = false;

        this.modalMensaje.set(
          this.ingresoAdministrador
            ? '¡Bienvenido al panel de administración!'
            : '¡Has iniciado sesión correctamente!'
        );

        this.ingresoAdministrador = false;

        this.isModalOpen.set(true);
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error en el login', error);

        this.loginExitoso = false;
        this.ingresoAdministrador = false;
        this.procesandoLogin = false;

        if (error.status === 401) {
          const mensajeBackend = error.error?.message;

          if (
            typeof mensajeBackend === 'string' &&
            mensajeBackend.includes('deshabilitada')
          ) {
            this.modalMensaje.set(
              'Tu cuenta se encuentra deshabilitada. No estás autorizado para ingresar.'
            );
          } else {
            this.modalMensaje.set(
              'Las credenciales son incorrectas. Inténtelo nuevamente.'
            );
          }
        } else {
          this.modalMensaje.set(
            'Ocurrió un error al iniciar sesión. Intentá nuevamente más tarde.'
          );
        }

        this.isModalOpen.set(true);
        this.cdr.detectChanges();
      }
    });
  }

  
}


