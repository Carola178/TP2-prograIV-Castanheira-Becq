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

  limite: number = 10;
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
    const userJson = localStorage.getItem('user');
    const userStorage = userJson ? JSON.parse(userJson) : null;
    this.idUsuarioActual = userStorage?._id || userStorage?.id || userStorage?.sub || '';

    if (!this.idUsuarioActual) {
      console.error('No se encontró el ID del usuario en localStorage');
      this.cargando = false;
      return;
    }

    this.authService.getPerfil(this.idUsuarioActual).subscribe({
      next: (userFrescos: any) => {
        this.usuario = userFrescos;
        this.cargarPublicacionesUsuario();
      },
      error: (err: any) => {
        console.error('Error al obtener perfil del backend, usando caché:', err);
        this.usuario = userStorage;
        this.cargarPublicacionesUsuario();
      }
    });
  }

  cargarPublicacionesUsuario(): void {
    this.offset = (this.paginaActual - 1) * this.limite;

    this.publicacionesService.obtenerPublicaciones({
      idUsuario: this.idUsuarioActual,
      limite: this.limite,
      offset: this.offset
    }).subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : (data.datos || data.publicaciones || data.docs || []);
        const totalRegistros = data.totalDocs || data.total || lista.length;
        this.totalPaginas = Math.ceil(totalRegistros / this.limite) || 1;

        this.publicaciones = lista.map((pub: any) => {
          return {
            id: pub._id || pub.id,
            titulo: pub.titulo,
            descripcion: pub.descripcion,
            urlImagen: pub.urlImagen,
            autor: typeof pub.autor === 'object' && pub.autor !== null 
              ? String(pub.autor._id || pub.autor.id) 
              : String(pub.autor),
            nombreAutor: pub.autor && typeof pub.autor === 'object' ? `${pub.autor.nombre} ${pub.autor.apellido || ''}`.trim() : (this.usuario?.nombre || 'Usuario'),
            avatarAutor: pub.autor && typeof pub.autor === 'object' ? pub.autor.imagenPerfil : '',
            cantidadMeGusta: pub.cantidadMeGusta || 0,
            leGustaAlUsuarioActual: pub.leGustaAlUsuarioActual || false,
            cantidadComentarios: pub.cantidadComentarios || 0,
            createdAt: pub.createdAt || new Date().toISOString()
          };
        });

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar publicaciones del perfil:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
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
        publicacion.cantidadMeGusta = publicacionActualizada.cantidadMeGusta;
        publicacion.leGustaAlUsuarioActual = !publicacion.leGustaAlUsuarioActual;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al modificar el Me gusta:', err);
        alert('No se pudo registrar el Me gusta. Inténtalo nuevamente.');
      }
    });
  }

  confirmarEliminacion(idPublicacion: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      this.publicacionesService.eliminarPublicacion(idPublicacion).subscribe({
        next: () => {
          this.publicaciones = this.publicaciones.filter(p => p.id !== idPublicacion);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar la publicación:', err);
          alert('No se pudo eliminar la publicación. Inténtalo de nuevo.');
        }
      });
    }
  }

  irAlFeed(): void {
    this.router.navigate(['/publicaciones']);
  }

  cerrarSesion() {
  this.authService.cerrarSesion();
  }
}