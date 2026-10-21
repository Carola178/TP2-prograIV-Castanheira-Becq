import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordValidator } from '../../validators/login-validator';

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
    identifier: new FormControl('', {
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
    return this.loginModel.controls.identifier;
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

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.loginModel.invalid) {
      this.loginModel.markAllAsTouched();
      
      if (this.passwordControl.hasError('passwordStrength')) {
        this.mostrarModal('La contraseña no cumple con los requisitos de seguridad.');
      } else {
        this.mostrarModal('Por favor, completa los campos correctamente.');
      }
      return;
    }

    const { identifier, password } = this.loginModel.getRawValue();
    const resultado = await this.auth.signIn(identifier, password);

    if (resultado.error) {
      this.mostrarModal('Las credenciales son incorrectas. Intentelo nuevamente.');
      return;
    }

    this.router.navigate(['/publicaciones']);
  }
}