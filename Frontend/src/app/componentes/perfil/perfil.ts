import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  urlImagen?: string;
  autor: string;
  nombreAutor?: string;
  avatarAutor?: string;
  cantidadMeGusta: number;
  leGustaAlUsuarioActual: boolean;
  cantidadComentarios?: number;
  createdAt: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class Perfil implements OnInit {
  usuario: any = null;
  publicaciones: Publicacion[] = [];

  paginaActual: number = 1;
  totalPaginas: number = 1;
  idUsuarioActual: string = '';
  cargando: boolean = true;

  limite: number = 3;
  offset: number = 0;

  mostrarModalEditar = false;
  guardandoPerfil = false;
  errorEditarPerfil = '';

  private fb = new FormBuilder();

  formularioEditar = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    descripcionBreve: ['', [Validators.maxLength(300)]]
  });

  mostrarModalFoto = false;
  fotoSeleccionada: File | null = null;
  vistaPreviaFoto: string | null = null;
  guardandoFoto = false;
  errorFoto = '';

  constructor(
    private router: Router,
    private publicacionesService: PublicacionesService,
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerDatosPerfilYPublicaciones();
  }

  obtenerDatosPerfilYPublicaciones(): void {
    const usuarioActual = this.authService.usuarioActual;

    this.idUsuarioActual = String(
      usuarioActual?._id || usuarioActual?.id || usuarioActual?.sub || ''
    );

    if (!this.idUsuarioActual) {
      console.error('No se encontró un usuario autenticado');
      this.cargando = false;
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getPerfil(this.idUsuarioActual).subscribe({
      next: (usuario: any) => {
        this.usuario = usuario;
        this.cargarPublicacionesUsuario();
      },
      error: (err: any) => {
        console.error('Error al obtener el perfil:', err);
        this.cargando = false;
        this.cdr.detectChanges();

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }


abrirModalEditar(): void {
  if (!this.usuario) return;

  this.formularioEditar.patchValue({
    nombre: this.usuario.nombre || '',
    apellido: this.usuario.apellido || '',
    email: this.usuario.email || '',
    nombreUsuario: this.usuario.nombreUsuario || '',
    descripcionBreve: this.usuario.descripcionBreve || ''
  });

  this.errorEditarPerfil = '';
  this.mostrarModalEditar = true;
}

cerrarModalEditar(): void {
  if (this.guardandoPerfil) return;

  this.mostrarModalEditar = false;
}

  guardarPerfil(): void {
    if (this.formularioEditar.invalid) {
      this.formularioEditar.markAllAsTouched();
      return;
    }

    this.guardandoPerfil = true;
    this.errorEditarPerfil = '';

    const datos = new FormData();
    const valores = this.formularioEditar.getRawValue();

    Object.entries(valores).forEach(([campo, valor]) => {
      datos.append(campo, valor.trim());
    });

this.authService.actualizarPerfil(datos).subscribe({
  next: (usuarioActualizado) => {
    console.log('Perfil actualizado correctamente:', usuarioActualizado);

    this.usuario = usuarioActualizado;
    this.guardandoPerfil = false;
    this.mostrarModalEditar = false;
    this.cdr.detectChanges();
  },
  error: (err) => {
    console.error('Error al actualizar perfil:', err);

    const mensaje = err.error?.message;

    this.errorEditarPerfil = Array.isArray(mensaje)
      ? mensaje.join(', ')
      : typeof mensaje === 'string'
        ? mensaje
        : 'No se pudo actualizar el perfil. Intentá nuevamente.';

    this.guardandoPerfil = false;
    this.cdr.detectChanges();
  }
});
  }


  cargarPublicacionesUsuario(): void {
    this.cargando = true;

    this.offset = (this.paginaActual - 1) * this.limite;

    this.publicacionesService.obtenerPublicaciones({
      idUsuario: this.idUsuarioActual,
      ordenarPor: 'fechaCreacion',
      limite: this.limite,
      offset: this.offset
    }).subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data)
          ? data
          : (data?.datos || data?.publicaciones || data?.docs || []);

        const totalRegistros =
          data?.totalDocs ?? data?.total ?? lista.length;

        this.totalPaginas =
          Math.max(1, Math.ceil(totalRegistros / this.limite));

        this.publicaciones = lista.map((pub: any) => ({
          id: pub._id || pub.id,
          titulo: pub.titulo,
          descripcion: pub.descripcion,
          urlImagen: pub.urlImagen,

          autor:
            typeof pub.autor === 'object' && pub.autor !== null
              ? String(pub.autor._id || pub.autor.id)
              : String(pub.autor),

          nombreAutor:
            pub.autor && typeof pub.autor === 'object'
              ? `${pub.autor.nombre || ''} ${pub.autor.apellido || ''}`.trim()
              : (this.usuario?.nombre || 'Usuario'),

          avatarAutor:
            pub.autor && typeof pub.autor === 'object'
              ? pub.autor.imagenPerfil
              : '',

          cantidadMeGusta: pub.cantidadMeGusta || 0,
          leGustaAlUsuarioActual:
            pub.leGustaAlUsuarioActual || false,
          cantidadComentarios: pub.cantidadComentarios || 0,
          createdAt: pub.createdAt || ''
        }));

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Error al cargar publicaciones del perfil:',
          err
        );

        this.cargando = false;
        this.cdr.detectChanges();

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  abrirModalFoto(): void {
  this.mostrarModalFoto = true;
  this.fotoSeleccionada = null;
  this.vistaPreviaFoto = null;
  this.errorFoto = '';
}

  cerrarModalFoto(): void {
    if (this.guardandoFoto) return;

    this.mostrarModalFoto = false;
    this.fotoSeleccionada = null;
    this.vistaPreviaFoto = null;
    this.errorFoto = '';
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.errorFoto = 'Seleccioná una imagen JPG, PNG o WebP.';
      input.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.errorFoto = 'La imagen no puede superar los 5 MB.';
      input.value = '';
      return;
    }

    this.fotoSeleccionada = archivo;
    this.errorFoto = '';

    const lector = new FileReader();

    lector.onload = () => {
      this.vistaPreviaFoto = lector.result as string;
      this.cdr.detectChanges();
    };

    lector.readAsDataURL(archivo);
  }

  guardarFoto(): void {
    if (!this.fotoSeleccionada || this.guardandoFoto) return;

    this.guardandoFoto = true;
    this.errorFoto = '';

    const datos = new FormData();
    datos.append('imagenPerfil', this.fotoSeleccionada);

    this.authService.actualizarPerfil(datos).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        this.guardandoFoto = false;
        this.mostrarModalFoto = false;
        this.fotoSeleccionada = null;
        this.vistaPreviaFoto = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la foto:', err);
        this.errorFoto = 'No se pudo actualizar la foto. Intentá nuevamente.';
        this.guardandoFoto = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (
      nuevaPagina >= 1 &&
      nuevaPagina <= this.totalPaginas &&
      nuevaPagina !== this.paginaActual
    ) {
      this.paginaActual = nuevaPagina;
      this.cargarPublicacionesUsuario();
    }
  }

  alternarMeGusta(publicacion: Publicacion): void {
    const accion = publicacion.leGustaAlUsuarioActual
      ? this.publicacionesService.quitarMeGusta(publicacion.id)
      : this.publicacionesService.darMeGusta(publicacion.id);

    accion.subscribe({
      next: (respuesta: any) => {
        const publicacionActualizada = respuesta.publicacion;

        publicacion.cantidadMeGusta =
          publicacionActualizada.cantidadMeGusta;

        publicacion.leGustaAlUsuarioActual =
          !publicacion.leGustaAlUsuarioActual;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al modificar el Me gusta:', err);
        alert('No se pudo registrar el Me gusta. Inténtalo nuevamente.');
      }
    });
  }

  confirmarEliminacion(idPublicacion: string): void {
    if (
      confirm('¿Estás seguro de que deseas eliminar esta publicación?')
    ) {
      this.publicacionesService
        .eliminarPublicacion(idPublicacion)
        .subscribe({
          next: () => {
            if (
              this.publicaciones.length === 1 &&
              this.paginaActual > 1
            ) {
              this.paginaActual--;
            }
            this.cargarPublicacionesUsuario();
          },

          error: (err) => {
            console.error(
              'Error al eliminar la publicación:',
              err
            );

            alert(
              'No se pudo eliminar la publicación. Inténtalo de nuevo.'
            );
          }
        });
    }
  }

}
