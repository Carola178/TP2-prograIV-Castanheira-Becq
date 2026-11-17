import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { EstadisticasService } from '../../services/estadisticas';

@Component({
    selector: 'app-estadisticas',
    standalone: true,
    imports: [FormsModule, BaseChartDirective],
    templateUrl: './estadisticas.html',
    styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit {

    private estadisticasService = inject(EstadisticasService);

    desde = '';
    hasta = '';

    cargando = signal(false);
    error = signal('');
    busquedaRealizada = signal(false);

    periodoVisualizado = signal('Todo el historial');

    graficoUsuarios: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [{
            label: 'Publicaciones',
            data: [],
            backgroundColor: '#8875D9'
        }]
    };


    graficoComentarios: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [{
            label: 'Comentarios',
            data: [],
            borderColor: '#64B5F6',
            backgroundColor: '#64B5F6',
            borderWidth: 3,
            tension: 0,
            fill: false,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#64B5F6',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2
        }]
    };


    graficoPublicaciones: ChartConfiguration<'doughnut'>['data'] = {
        labels: [],
        datasets: [{
            label: 'Comentarios',
            data: [],
            backgroundColor: [
                '#8875D9',
                '#64B5F6',
                '#81C784',
                '#FFB74D',
                '#F48FB1',
                '#4DB6AC'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
        }]
    };

    opcionesVerticales: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        }
    };

    opcionesHorizontales: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        }
    };

    opcionesLineas: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    ngOnInit(): void {
        this.cargarEstadisticas();
    }

    cargarEstadisticas(): void {

        if (
            (this.desde && !this.hasta) ||
            (!this.desde && this.hasta) ||
            (this.desde && this.hasta && this.desde > this.hasta)
        ) {
            this.error.set('Seleccioná un rango de fechas válido.');
            return;
        }

        this.cargando.set(true);
        this.error.set('');

        forkJoin({
            usuarios: this.estadisticasService.publicacionesPorUsuario(
                this.desde, this.hasta
            ),
            comentarios: this.estadisticasService.comentariosPorFecha(
                this.desde, this.hasta
            ),
            publicaciones: this.estadisticasService.comentariosPorPublicacion(
                this.desde, this.hasta
            )
        }).subscribe({
            next: (respuesta) => {

                this.graficoUsuarios = {
                    labels: respuesta.usuarios.map(d => d.usuario),
                    datasets: [{
                        label: 'Publicaciones',
                        data: respuesta.usuarios.map(d => d.cantidad),
                        backgroundColor: '#8875D9'
                    }]
                };

                this.graficoComentarios = {
                    labels: respuesta.comentarios.map(d => d.fecha),
                    datasets: [{
                        label: 'Comentarios',
                        data: respuesta.comentarios.map(d => d.cantidad),
                        borderColor: '#64B5F6',
                        backgroundColor: '#64B5F6',
                        borderWidth: 3,
                        tension: 0,
                        fill: false,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#64B5F6',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 2
                    }]
                };

                this.graficoPublicaciones = {
                labels: respuesta.publicaciones.map(d => d.titulo),
                datasets: [{
                    label: 'Comentarios',
                    data: respuesta.publicaciones.map(d => d.cantidad),
                    backgroundColor: respuesta.publicaciones.map((_, indice) =>
                        [
                            '#8875D9',
                            '#64B5F6',
                            '#81C784',
                            '#FFB74D',
                            '#F48FB1',
                            '#4DB6AC'
                        ][indice % 6]
                    ),
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            };

                this.periodoVisualizado.set(
                    this.desde && this.hasta
                        ? `${this.desde} al ${this.hasta}`
                        : 'Todo el historial'
                );

                this.busquedaRealizada.set(true);
                this.cargando.set(false);
            },

            error: (err) => {
                console.error('Error al cargar estadísticas:', err);
                this.error.set('No se pudieron cargar las estadísticas.');
                this.cargando.set(false);
            }
        });
    }

    mostrarTodo(): void {
        this.desde = '';
        this.hasta = '';
        this.cargarEstadisticas();
    }
}
