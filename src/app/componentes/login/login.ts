import { Component, OnInit, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { passwordsIncorrectas } from '../validators/usuario.validators';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  errorMessage = signal<string | null>(null);

  loginModel = new FormGroup({
    email: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.email]
    }),
    password: new FormControl("", {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(12)]
    })
  });

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
    this.loginModel.valueChanges.subscribe(estado => console.log(estado));
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    this.errorMessage.set(null);

    if (this.loginModel.invalid) {
      this.errorMessage.set('Por favor, completa los campos correctamente.');
      return;
    }

    const credenciales = this.loginModel.value;
    const resultado = await this.auth.signIn(credenciales.email!, credenciales.password!);

    if (resultado.error) {
      this.errorMessage.set('El correo electrónico o la contraseña ingresados no son correctos.');
      return;
    }

    console.log('Login exitoso: ', resultado.data);
    this.router.navigate(['/cartelera']);
  }

  onContinuarComoInvitado(): void {
    this.router.navigate(['/cartelera']);
  }
}