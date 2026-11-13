import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {AdminPanelService, UsuarioAdmin, CrearUsuarioAdmin} from '../../services/admin-panel';
import { Auth } from '../../services/auth';
import { passwordMatchValidator } from '../../validators/password-validator';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {

  private adminService = inject(AdminPanelService);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(false);
  error = signal('');
  mensaje = signal('');
  usuarioProcesando = signal<string | null>(null);

  modalConfirmacion = signal(false);
  usuarioSeleccionado = signal<UsuarioAdmin | null>(null);

  modalCrearUsuario = signal(false);
  creandoUsuario = signal(false);
  errorCreacion = signal('');

  verContrasena = false;
  verRepetirContrasena = false;


  registroAdminModel = this.fb.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    ]],
    apellido: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(40)
    ]],
    nombreUsuario: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20)
    ]],
    fechaNacimiento: ['', [
      Validators.required,
      Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    ]],
    descripcionBreve: ['', [
      Validators.maxLength(200)
    ]],
    imagenPerfil: [null as File | null],
    contrasena: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    ]],
    repetirContrasena: ['', Validators.required],
    perfil: ['usuario', Validators.required]
  }, { validators: passwordMatchValidator() });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');

    this.adminService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
        this.error.set('No se pudo cargar el listado de usuarios.');
        this.cargando.set(false);
      }
    });
  }

  esUsuarioActual(id: string): boolean {
    const actual = this.auth.usuarioActual;
    return (actual?._id ?? actual?.id) === id;
  }

  abrirModalDeshabilitar(usuario: UsuarioAdmin): void {
    if (this.usuarioProcesando() || this.esUsuarioActual(usuario._id)) {
      return;
    }

    this.usuarioSeleccionado.set(usuario);
    this.modalConfirmacion.set(true);
  }

  cerrarModalDeshabilitar(): void {
    if (this.usuarioProcesando()) return;

    this.modalConfirmacion.set(false);
    this.usuarioSeleccionado.set(null);
  }

  confirmarDeshabilitacion(): void {
    const usuario = this.usuarioSeleccionado();

    if (!usuario || this.usuarioProcesando() || this.esUsuarioActual(usuario._id)) {
      return;
    }

    this.usuarioProcesando.set(usuario._id);
    this.error.set('');
    this.mensaje.set('');

    this.adminService.deshabilitarUsuario(usuario._id).subscribe({
      next: (respuesta) => {
        this.mensaje.set(respuesta.mensaje);
        this.usuarioProcesando.set(null);
        this.cerrarModalDeshabilitar();
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error al deshabilitar usuario:', err);
        this.error.set(
          err.error?.message || 'No se pudo deshabilitar el usuario.'
        );
        this.usuarioProcesando.set(null);
        this.cerrarModalDeshabilitar();
      }
    });
  }

  habilitarUsuario(usuario: UsuarioAdmin): void {
    if (this.usuarioProcesando()) return;

    this.usuarioProcesando.set(usuario._id);
    this.error.set('');
    this.mensaje.set('');

    this.adminService.habilitarUsuario(usuario._id).subscribe({
      next: (respuesta) => {
        this.mensaje.set(respuesta.mensaje);
        this.usuarioProcesando.set(null);
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error al habilitar usuario:', err);
        this.error.set(
          err.error?.message || 'No se pudo habilitar el usuario.'
        );
        this.usuarioProcesando.set(null);
      }
    });
  }

  abrirModalCrearUsuario(): void {
    this.registroAdminModel.reset({
      perfil: 'usuario'
    });

    this.errorCreacion.set('');
    this.verContrasena = false;
    this.verRepetirContrasena = false;
    this.modalCrearUsuario.set(true);
  }

  cerrarModalCrearUsuario(): void {
    if (this.creandoUsuario()) return;

    this.modalCrearUsuario.set(false);
    this.errorCreacion.set('');
  }

  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 8);

    if (value.length > 4) {
      value = value.slice(0, 2) + '/' +
              value.slice(2, 4) + '/' +
              value.slice(4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    input.value = value;

    this.registroAdminModel.patchValue({
      fechaNacimiento: value
    });
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.registroAdminModel.patchValue({
      imagenPerfil: archivo
    });
  }

  crearUsuario(): void {
    if (this.creandoUsuario()) return;

    this.registroAdminModel.markAllAsTouched();

    if (this.registroAdminModel.errors?.['mismatch']) {
      this.errorCreacion.set('Las contraseñas no coinciden.');
      return;
    }

    if (this.registroAdminModel.invalid) {
      this.errorCreacion.set(
        'Completá correctamente todos los campos obligatorios.'
      );
      return;
    }
    this.creandoUsuario.set(true);
    this.errorCreacion.set('');

    const datos = this.registroAdminModel.getRawValue();

    const nuevoUsuario = new FormData();

    nuevoUsuario.append('nombre', datos.nombre ?? '');
    nuevoUsuario.append('apellido', datos.apellido ?? '');
    nuevoUsuario.append('email', datos.email ?? '');
    nuevoUsuario.append('nombreUsuario', datos.nombreUsuario ?? '');
    nuevoUsuario.append('fechaNacimiento', datos.fechaNacimiento ?? '');
    nuevoUsuario.append('descripcionBreve', datos.descripcionBreve ?? '');
    nuevoUsuario.append('contrasena', datos.contrasena ?? '');
    nuevoUsuario.append('perfil', datos.perfil ?? 'usuario');

    if (datos.imagenPerfil) {
      nuevoUsuario.append('imagenPerfil', datos.imagenPerfil);
    }

    this.adminService.crearUsuario(nuevoUsuario).subscribe({
      next: (respuesta) => {
        this.mensaje.set(respuesta.mensaje);
        this.creandoUsuario.set(false);
        this.modalCrearUsuario.set(false);

        this.registroAdminModel.reset({
          perfil: 'usuario'
        });

        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);

        const mensajeBackend = err.error?.message;

        this.errorCreacion.set(
          typeof mensajeBackend === 'string'
            ? mensajeBackend
            : Array.isArray(mensajeBackend)
              ? mensajeBackend.join('. ')
              : 'No se pudo crear el usuario.'
        );

        this.creandoUsuario.set(false);
      }
    });
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}
