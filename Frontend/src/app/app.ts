import {ChangeDetectorRef, Component, OnInit, OnDestroy, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterOutlet, RouterLink, NavigationEnd} from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {

  protected readonly title = signal('frontend');

  cargandoSesion = true;
  mostrarModalSesion = false;

  rutaActual = signal('');
  mostrarNavbar = signal(false);

  private temporizadorAviso?: ReturnType<typeof setTimeout>;

  private suscripcionVencimiento?: Subscription;
  private suscripcionRutas?: Subscription;

  private readonly MINUTOS_ANTES_DEL_VENCIMIENTO = 5;
  private readonly MILISEGUNDOS_POR_MINUTO = 60_000;

  // private readonly MINUTOS_ANTES_DEL_VENCIMIENTO = 0.1;
  // private readonly MILISEGUNDOS_POR_MINUTO = 60_000;

  private readonly tiempoRestanteAviso =
    this.MINUTOS_ANTES_DEL_VENCIMIENTO *
    this.MILISEGUNDOS_POR_MINUTO;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const rutaInicial = window.location.pathname;


    this.actualizarNavbar(this.router.url);

    this.suscripcionRutas = this.router.events
      .pipe(
        filter((evento): evento is NavigationEnd =>
          evento instanceof NavigationEnd
        )
      )
      .subscribe(evento => {
        this.actualizarNavbar(evento.urlAfterRedirects);
      });

    this.suscripcionVencimiento =
      this.authService.vencimiento$.subscribe(expiraEn => {

        if (expiraEn === null) {
          this.detenerTemporizador();
        } else {
          this.programarTemporizadores(expiraEn);
        }

      });

    this.authService.autorizar().subscribe({
      next: () => {

        this.cargandoSesion = false;
        this.cdr.detectChanges();

        if (rutaInicial === '/' || rutaInicial === '/login') {
          this.router.navigate(['/publicaciones']);
        }

      },
      error: () => {

        this.cargandoSesion = false;
        this.cdr.detectChanges();

        this.router.navigate(['/login']);

      }
    });
  }

  actualizarNavbar(ruta: string): void {
    const rutaLimpia = ruta.split('?')[0].split('#')[0];
    this.rutaActual.set(rutaLimpia);
    const rutasConNavbar = [
      '/publicaciones',
      '/perfil',
      '/admin-panel',
      '/estadisticas'
    ];
    this.mostrarNavbar.set(
      rutasConNavbar.includes(rutaLimpia)
    );
  }

  programarTemporizadores(expiraEn: number): void {
    this.detenerTemporizador();
    const ahora = Date.now();
    const tiempoHastaAviso =
      expiraEn - ahora - this.tiempoRestanteAviso;
    const tiempoHastaVencimiento =
      expiraEn - ahora;
    if (tiempoHastaVencimiento <= 0) {
      return;
    }

    if (tiempoHastaAviso > 0) {
      this.temporizadorAviso = setTimeout(() => {
        this.mostrarModalSesion = true;
        this.cdr.detectChanges();
      }, tiempoHastaAviso);
    } else {
      this.mostrarModalSesion = true;
      this.cdr.detectChanges();
    }
  }


  detenerTemporizador(): void {
    if (this.temporizadorAviso) {
      clearTimeout(this.temporizadorAviso);
      this.temporizadorAviso = undefined;
    }

    this.mostrarModalSesion = false;
  }

  cerrarSesion(): void {
    this.detenerTemporizador();
    this.authService.cerrarSesion();
  }

  cancelarRenovacion(): void {
    this.detenerTemporizador();
    this.cdr.detectChanges();
  }

  extenderSesion(): void {
    this.authService.refrescar().subscribe({
      next: () => {
        this.mostrarModalSesion = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al renovar sesión:', err);
        this.finalizarSesion();
      }
    });
  }

  finalizarSesion(): void {
    this.detenerTemporizador();
    this.authService.limpiarSesion();

    this.router.navigate(['/login']);
    this.cdr.detectChanges();
  }
  
  ngOnDestroy(): void {

    this.detenerTemporizador();

    this.suscripcionVencimiento?.unsubscribe();
    this.suscripcionRutas?.unsubscribe();
  }
}
