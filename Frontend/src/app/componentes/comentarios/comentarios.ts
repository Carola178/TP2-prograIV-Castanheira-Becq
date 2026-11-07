import {Component, OnInit, OnChanges, SimpleChanges, Input, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import {ComentariosService, Comentario} from '../../services/comentarios';
import { PublicacionesService } from '../../services/publicaciones';

@Component({
    selector: 'app-comentarios',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './comentarios.html',
    styleUrls: ['./comentarios.css']
})
export class Comentarios implements OnInit, OnChanges {

    @Input() idPublicacion = '';

    @Input() modoIntegrado = false;

    idUsuarioActual = '';

    publicacion: any = null;
    comentarios: Comentario[] = [];

    nuevoComentario = '';
    mensajeEditado = '';
    idComentarioEditando: string | null = null;

    limite = 3;
    offset = 0;
    hayMas = false;

    cargando = false;
    cargandoPublicacion = false;
    publicando = false;
    guardandoEdicion = false;

    mensajeError = '';

    private versionCarga = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: Auth,
        private comentariosService: ComentariosService,
        private publicacionesService: PublicacionesService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const usuario = this.authService.usuarioActual;

        this.idUsuarioActual = String(
        usuario?._id || usuario?.id || usuario?.sub || ''
        );

        if (!this.modoIntegrado && !this.idPublicacion) {
        this.idPublicacion =
            this.route.snapshot.paramMap.get('id') || '';
        }

        if (!this.idPublicacion) {
        this.mensajeError = 'No se encontró la publicación.';
        return;
        }

        if (!this.modoIntegrado) {
        this.cargarPublicacion();
        }

        this.recargarComentarios();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
        changes['idPublicacion'] &&
        !changes['idPublicacion'].firstChange &&
        this.idPublicacion
        ) {
        this.publicacion = null;

        if (!this.modoIntegrado) {
            this.cargarPublicacion();
        }

        this.recargarComentarios();
        }
    }

    cargarPublicacion(): void {
        this.cargandoPublicacion = true;

        this.publicacionesService
        .obtenerPublicacionPorId(this.idPublicacion)
        .subscribe({
            next: (respuesta: any) => {
            this.publicacion = respuesta;
            this.cargandoPublicacion = false;
            this.cdr.detectChanges();
            },
            error: (error: any) => {
            console.error('Error al obtener publicación:', error);

            this.mensajeError =
                'No se pudo cargar la publicación.';

            this.cargandoPublicacion = false;
            this.cdr.detectChanges();
            }
        });
    }


    cargarComentarios(): void {
        if (this.cargando || !this.idPublicacion) return;

        this.cargando = true;
        this.mensajeError = '';

        const versionActual = this.versionCarga;
        const idActual = this.idPublicacion;

        this.comentariosService
        .obtenerComentarios(
            idActual,
            this.limite,
            this.offset
        )
        .subscribe({
            next: (respuesta) => {
            if (
                versionActual !== this.versionCarga ||
                idActual !== this.idPublicacion
            ) {
                return;
            }

            const idsExistentes = new Set(
                this.comentarios.map(c => c._id)
            );

            const nuevos = respuesta.comentarios.filter(
                c => !idsExistentes.has(c._id)
            );

            this.comentarios = [
                ...this.comentarios,
                ...nuevos
            ];

            this.offset += respuesta.comentarios.length;
            this.hayMas = respuesta.hayMas;

            this.cargando = false;
            this.cdr.detectChanges();
            },

            error: (error: any) => {
            if (versionActual !== this.versionCarga) return;

            console.error('Error al obtener comentarios:', error);

            this.mensajeError =
                'No se pudieron cargar los comentarios.';

            this.cargando = false;
            this.cdr.detectChanges();
            }
        });
    }

    recargarComentarios(): void {
        const cantidadVisible = Math.max(
        this.limite,
        this.comentarios.length
        );

        this.versionCarga++;

        this.comentarios = [];
        this.offset = 0;
        this.hayMas = false;
        this.cargando = false;

        this.recargarCantidad(cantidadVisible);
    }

    private recargarCantidad(cantidad: number): void {
        if (!this.idPublicacion) return;

        this.cargando = true;

        const versionActual = this.versionCarga;
        const idActual = this.idPublicacion;

        const cargarPagina = (offsetActual: number): void => {
        const limiteActual = Math.min(
            this.limite,
            cantidad - offsetActual
        );

        if (limiteActual <= 0) {
            this.cargando = false;
            this.cdr.detectChanges();
            return;
        }

        this.comentariosService
            .obtenerComentarios(
            idActual,
            limiteActual,
            offsetActual
            )
            .subscribe({
            next: (respuesta) => {
                if (
                versionActual !== this.versionCarga ||
                idActual !== this.idPublicacion
                ) {
                return;
                }

                this.comentarios = [
                ...this.comentarios,
                ...respuesta.comentarios
                ];

                this.offset += respuesta.comentarios.length;
                this.hayMas = respuesta.hayMas;

                if (
                this.offset < cantidad &&
                respuesta.hayMas &&
                respuesta.comentarios.length > 0
                ) {
                cargarPagina(this.offset);
                } else {
                this.cargando = false;
                this.cdr.detectChanges();
                }
            },

            error: (error: any) => {
                if (versionActual !== this.versionCarga) return;

                console.error('Error al recargar comentarios:', error);

                this.mensajeError =
                'No se pudieron actualizar los comentarios.';

                this.cargando = false;
                this.cdr.detectChanges();
            }
            });
        };

        cargarPagina(0);
    }

    publicarComentario(): void {
        const mensaje = this.nuevoComentario.trim();

        if (!mensaje || this.publicando) return;

        this.publicando = true;
        this.mensajeError = '';

        this.comentariosService
        .crearComentario(this.idPublicacion, mensaje)
        .subscribe({
            next: () => {
            this.nuevoComentario = '';
            this.publicando = false;

            this.recargarComentarios();
            },

            error: (error: any) => {
            console.error('Error al publicar comentario:', error);

            this.mensajeError =
                'No se pudo publicar el comentario.';

            this.publicando = false;
            this.cdr.detectChanges();
            }
        });
    }

    esAutor(comentario: Comentario): boolean {
        const autor = comentario.autor;

        const idAutor = typeof autor === 'string'
        ? autor
        : autor?._id;

        return !!this.idUsuarioActual &&
        String(idAutor) === this.idUsuarioActual;
    }

    obtenerNombreAutor(comentario: Comentario): string {
        const autor = comentario.autor;

        if (typeof autor === 'string') {
        return 'Usuario';
        }

        return `${autor?.nombre || ''} ${autor?.apellido || ''}`.trim()
        || autor?.nombreUsuario
        || 'Usuario';
    }

    typeofAutorImagen(comentario: Comentario): string {
        const autor = comentario.autor;

        if (typeof autor === 'string') {
        return '';
        }

        return autor?.imagenPerfil || '';
    }

    editarComentario(comentario: Comentario): void {
        if (!this.esAutor(comentario)) return;

        this.idComentarioEditando = comentario._id;
        this.mensajeEditado = comentario.mensaje;
    }

    cancelarEdicion(): void {
        this.idComentarioEditando = null;
        this.mensajeEditado = '';
    }

    guardarEdicion(comentario: Comentario): void {
        const mensaje = this.mensajeEditado.trim();

        if (
        !mensaje ||
        this.guardandoEdicion ||
        !this.esAutor(comentario)
        ) {
        return;
        }

        this.guardandoEdicion = true;
        this.mensajeError = '';

        this.comentariosService
        .editarComentario(
            this.idPublicacion,
            comentario._id,
            mensaje
        )
        .subscribe({
            next: () => {
            this.guardandoEdicion = false;
            this.cancelarEdicion();

            this.recargarComentarios();
            },

            error: (error: any) => {
            console.error('Error al editar comentario:', error);

            this.mensajeError =
                'No se pudo editar el comentario.';

            this.guardandoEdicion = false;
            this.cdr.detectChanges();
            }
        });
    }

    volverAlFeed(): void {
        this.router.navigate(['/publicaciones']);
    }
}
