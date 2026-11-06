import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones';

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
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class Publicaciones implements OnInit {
  publicaciones: Publicacion[] = [];
  paginaActual: number = 1;
  totalPaginas: number = 1;
  criterioOrden: 'fechaCreacion' | 'cantidadMeGusta' = 'fechaCreacion';
  idUsuarioActual: string = '';
  publicando: boolean = false;


  limite: number = 10;
  offset: number = 0;

  mostrarModalError: boolean = false;
  mensajeErrorModal: string = '';

  mostrarModalConfirmacion: boolean = false;
  idPublicacionAEliminar: string | null = null;

  mostrarModalCrear: boolean = false;
  archivoSeleccionado: File | null = null;

  publicacionForm = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] })
  });

  constructor(
    private router: Router,
    private authService: Auth,
    private publicacionesService: PublicacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioLogueado();
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.offset = (this.paginaActual - 1) * this.limite;

    this.publicacionesService.obtenerPublicaciones({
      ordenarPor: this.criterioOrden,
      limite: this.limite,
      offset: this.offset
    }).subscribe({
      next: (data: any) => {
        console.log('Respuesta de publicaciones:', data);

        const lista = Array.isArray(data)
          ? data
          : (data?.datos || data?.publicaciones || data?.docs || []);

        const totalRegistros =
          data?.totalDocs ?? data?.total ?? lista.length;

        this.totalPaginas = Math.ceil(totalRegistros / this.limite) || 1;

        this.publicaciones = lista.map((pub: any) => ({
          id: pub._id || pub.id,
          titulo: pub.titulo,
          descripcion: pub.descripcion,
          urlImagen: pub.urlImagen,
          autor: typeof pub.autor === 'object' && pub.autor !== null
            ? String(pub.autor._id || pub.autor.id)
            : String(pub.autor),
          nombreAutor: pub.autor && typeof pub.autor === 'object'
            ? `${pub.autor.nombre || ''} ${pub.autor.apellido || ''}`.trim()
            : 'Usuario',
          avatarAutor: pub.autor && typeof pub.autor === 'object'
            ? pub.autor.imagenPerfil
            : '',
          cantidadMeGusta: pub.cantidadMeGusta || 0,
          leGustaAlUsuarioActual: pub.leGustaAlUsuarioActual || false,
          cantidadComentarios: pub.cantidadComentarios || 0,
          createdAt: pub.createdAt || ''
        }));

        this.aplicarOrdenamiento();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);
        console.error('Código HTTP:', err.status);
        console.error('Detalle:', err.error);

        this.mensajeErrorModal =
          err.status === 401
            ? 'Tu sesión no es válida o ha expirado.'
            : err.status === 403
            ? 'No tenés permisos para consultar las publicaciones.'
            : err.status === 0
            ? 'No se pudo conectar con el servidor. Verificá que el backend esté funcionando.'
            : 'Ocurrió un error al obtener las publicaciones.';

        this.mostrarModalError = true;
        this.cdr.detectChanges();
      }
    });
  }
  
  obtenerUsuarioLogueado(): void {
    const usuario = this.authService.usuarioActual;

    this.idUsuarioActual = String(
      usuario?._id || usuario?.id || usuario?.sub || ''
    );

    if (!this.idUsuarioActual) {
      console.error('No se encontró un usuario autenticado');
      this.router.navigate(['/login']);
    }
  }
  cambiarOrden(evento: Event): void {
    const seleccion = (evento.target as HTMLSelectElement).value as 'fechaCreacion' | 'cantidadMeGusta';
    this.criterioOrden = seleccion;
    this.paginaActual = 1;
    this.cargarPublicaciones();
  }

  aplicarOrdenamiento(): void {
    this.publicaciones = [...this.publicaciones].sort((a, b) => {
      if (this.criterioOrden === 'fechaCreacion') {
        const tiempoA = new Date(a.createdAt).getTime() || 0;
        const tiempoB = new Date(b.createdAt).getTime() || 0;
        return tiempoB - tiempoA;
      } else {
        const likesA = a.cantidadMeGusta || 0;
        const likesB = b.cantidadMeGusta || 0;
        return likesB - likesA;
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarPublicaciones();
    }
  }

  abrirModalCrear(): void {
    this.publicacionForm.reset();
    this.archivoSeleccionado = null;
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
  }

  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.archivoSeleccionado = null;
      return;
    }
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    const maximo = 5 * 1024 * 1024;
    if (!tiposPermitidos.includes(file.type)) {
      this.mensajeErrorModal =
        'Solo se permiten imágenes JPG, PNG o WEBP.';
      this.mostrarModalError = true;
      this.archivoSeleccionado = null;
      input.value = '';
      return;
    }
    if (file.size > maximo) {
      this.mensajeErrorModal =
        'La imagen no puede superar los 5 MB.';
      this.mostrarModalError = true;
      this.archivoSeleccionado = null;
      input.value = '';
      return;
    }
    this.archivoSeleccionado = file;
  }

  ejecutarCrearPublicacion(): void {
    if (this.publicacionForm.invalid) {
      this.publicacionForm.markAllAsTouched();
      return;
    }
    if (this.publicando) return;
    this.publicando = true;
    const formData = new FormData();
    formData.append(
      'titulo',
      this.publicacionForm.controls.titulo.value.trim()
    );
    formData.append(
      'descripcion',
      this.publicacionForm.controls.descripcion.value.trim()
    );
    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }
    this.publicacionesService.crearPublicacion(formData).subscribe({
      next: () => {
        this.publicando = false;
        this.cerrarModalCrear();
        this.publicacionForm.reset();
        this.archivoSeleccionado = null;
        this.paginaActual = 1;
        this.cargarPublicaciones();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.publicando = false;
        console.error('Error al crear publicación:', err);
        this.mensajeErrorModal =
          err.status === 401
            ? 'Tu sesión expiró. Volvé a iniciar sesión.'
            : err.status === 400
            ? 'Los datos de la publicación no son válidos.'
            : 'No se pudo crear la publicación. Intentá nuevamente.';
        this.mostrarModalError = true;
        this.cdr.detectChanges();
      }
    });
  }

  alternarMeGusta(publicacion: Publicacion): void {
    const accion = publicacion.leGustaAlUsuarioActual
      ? this.publicacionesService.quitarMeGusta(publicacion.id)
      : this.publicacionesService.darMeGusta(publicacion.id);

    accion.subscribe({
      next: (respuesta: any) => {
        const publicacionActualizada = respuesta.publicacion;
        publicacion.cantidadMeGusta = publicacionActualizada.cantidadMeGusta;
        publicacion.leGustaAlUsuarioActual = !publicacion.leGustaAlUsuarioActual;

        if (this.criterioOrden === 'cantidadMeGusta') {
          this.cargarPublicaciones();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al modificar el Me gusta:', err);
        if (err.status === 401) {
          return;
        }

        this.mensajeErrorModal = 'No se pudo registrar el Me gusta. Inténtalo nuevamente.';
        this.mostrarModalError = true;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarEliminacion(idPublicacion: string): void {
    this.idPublicacionAEliminar = idPublicacion;
    this.mostrarModalConfirmacion = true;
  }

  cancelarEliminacion(): void {
    this.mostrarModalConfirmacion = false;
    this.idPublicacionAEliminar = null;
  }

  ejecutarEliminacion(): void {
    if (!this.idPublicacionAEliminar) return;

    this.publicacionesService.eliminarPublicacion(this.idPublicacionAEliminar).subscribe({
      next: () => {
        this.publicaciones = this.publicaciones.filter(p => p.id !== this.idPublicacionAEliminar);
        this.cancelarEliminacion();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar la publicación:', err);
        this.cancelarEliminacion();

        if (err.status === 401) {
          return;
        }
        this.mensajeErrorModal =
          'No se pudo eliminar la publicación. Inténtalo de nuevo.';
        this.mostrarModalError = true;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalError(): void {
    this.mostrarModalError = false;
  }

  irAMiPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }
}