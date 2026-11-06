import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';

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
  imports: [CommonModule]
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

  irAlFeed(): void {
    this.router.navigate(['/publicaciones']);
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
