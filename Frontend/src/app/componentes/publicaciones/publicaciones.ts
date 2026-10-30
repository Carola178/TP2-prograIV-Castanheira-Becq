import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class Publicaciones implements OnInit {
  publicaciones: Publicacion[] = [];
  paginaActual: number = 1;
  totalPaginas: number = 1;
  criterioOrden: 'fechaCreacion' | 'cantidadMeGusta' = 'fechaCreacion';
  idUsuarioActual: string = '';

  limite: number = 10;
  offset: number = 0;

  mostrarModalError: boolean = false;
  mensajeErrorModal: string = '';

  mostrarModalConfirmacion: boolean = false;
  idPublicacionAEliminar: string | null = null;

  constructor(
    private router: Router,
    private publicacionesService: PublicacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioLogueado();
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.offset = (this.paginaActual - 1) * this.limite;

    this.publicacionesService.obtenerPublicaciones(this.criterioOrden, this.limite, this.offset).subscribe({
      next: (data: any) => {
        console.log('Datos crudos que llegan del backend:', data);

        const lista = Array.isArray(data) ? data : (data.datos || data.publicaciones || data.docs || []);
        const totalRegistros = data.totalDocs || data.total || lista.length;
        this.totalPaginas = Math.ceil(totalRegistros / this.limite) || 1;

        if (!lista || lista.length === 0) {
          if (this.paginaActual === 1) {
            this.mensajeErrorModal = 'No se encontraron publicaciones disponibles en este momento.';
            this.mostrarModalError = true;
          }
          this.publicaciones = [];
          this.cdr.detectChanges();
          return;
        }

        this.publicaciones = lista.map((pub: any) => {
          return {
            id: pub._id || pub.id,
            titulo: pub.titulo,
            descripcion: pub.descripcion,
            urlImagen: pub.urlImagen,
            autor: typeof pub.autor === 'object' && pub.autor !== null 
              ? String(pub.autor._id || pub.autor.id) 
              : String(pub.autor),
            nombreAutor: pub.nombreAutor || (typeof pub.autor === 'object' && pub.autor !== null ? pub.autor.nombre : 'Usuario'),
            avatarAutor: pub.avatarAutor,
            cantidadMeGusta: pub.cantidadMeGusta || 0,
            leGustaAlUsuarioActual: pub.leGustaAlUsuarioActual || false,
            cantidadComentarios: pub.cantidadComentarios || 0,
            createdAt: pub.createdAt || new Date().toISOString()
          };
        });

        this.aplicarOrdenamiento();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar publicaciones:', err);
        this.mensajeErrorModal = 'Ocurrió un error al intentar obtener las publicaciones. Inténtalo de nuevo más tarde.';
        this.mostrarModalError = true;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUsuarioLogueado(): void {
    const usuarioGuardado = localStorage.getItem('user');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.idUsuarioActual = String(usuario.id || usuario._id);
        console.log('ID de usuario actual cargado:', this.idUsuarioActual);
      } catch (e) {
        console.error('Error al leer el usuario del localStorage', e);
      }
    } else {
      console.warn('No se encontró el item "user" en el localStorage');
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
        return tiempoB - tiempoA; // De más nuevo a más viejo
      } else {
        const likesA = a.cantidadMeGusta || 0;
        const likesB = b.cantidadMeGusta || 0;
        return likesB - likesA; // De mayor a menor cantidad de Me gusta
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarPublicaciones();
    }
  }

  alternarMeGusta(publicacion: Publicacion): void {
    if (publicacion.leGustaAlUsuarioActual) {
      publicacion.cantidadMeGusta = Math.max(0, publicacion.cantidadMeGusta - 1);
      publicacion.leGustaAlUsuarioActual = false;
    } else {
      publicacion.cantidadMeGusta++;
      publicacion.leGustaAlUsuarioActual = true;
    }
    // Mantenemos la actualización limpia sin reordenar de golpe para que la tarjeta no desaparezca del front
    this.cdr.detectChanges();
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
        alert('No se pudo eliminar la publicación. Inténtalo de nuevo.');
        this.cancelarEliminacion();
      }
    });
  }

  cerrarModalError(): void {
    this.mostrarModalError = false;
  }

  irAMiPerfil(): void {
    this.router.navigate(['/perfil']);
  }
}