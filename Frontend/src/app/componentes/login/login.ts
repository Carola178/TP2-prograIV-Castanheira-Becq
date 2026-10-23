import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordValidator } from '../../validators/login-validator';
import { firstValueFrom } from 'rxjs';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  isModalOpen = signal<boolean>(false);
  modalMensaje = signal<string>('');

loginModel = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        passwordValidator() 
      ]
    })
  });

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {}

  get identifierControl() {
    return this.loginModel.controls.email;
  }

  get passwordControl() {
    return this.loginModel.controls.password;
  }

  private mostrarModal(mensaje: string): void {
    this.modalMensaje.set(mensaje);
    this.isModalOpen.set(true);
  }

  cerrarModal(): void {
    this.isModalOpen.set(false);
  }

  async onSubmit(event: Event) {
  event.preventDefault();

  if (this.loginModel.invalid) {
    this.loginModel.markAllAsTouched();
    this.mostrarModal('Por favor, completa los campos correctamente.');
    return;
  }

  try {
    const { email, password } = this.loginModel.getRawValue();
    await firstValueFrom(this.auth.login(email, password));
    
    this.router.navigate(['/publicaciones']);
  } catch (error: any) {
    console.error('Error en el login', error);
    this.mostrarModal('Las credenciales son incorrectas. Inténtelo nuevamente.');
    }
  }
}