import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Publicacion, PublicacionDocument} from './entities/publicaciones.dto.js';
import {Comentario, ComentarioDocument} from '../comentarios/entities/comentarios.dto.js';

@Injectable()
export class EstadisticasService {

    constructor(
        @InjectModel(Publicacion.name)
        private publicacionModel: Model<PublicacionDocument>,

        @InjectModel(Comentario.name)
        private comentarioModel: Model<ComentarioDocument>
    ) {}

    private obtenerFiltroFechas(desde?: string, hasta?: string) {

        if (!desde && !hasta) {
            return {};
        }

        if (!desde || !hasta) {
            throw new BadRequestException(
                'Debés indicar ambas fechas'
            );
        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(desde) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(hasta)
        ) {
            throw new BadRequestException(
                'Formato de fechas inválido'
            );
        }

        const fechaDesde = new Date(`${desde}T00:00:00-03:00`);
        const fechaHasta = new Date(`${hasta}T23:59:59.999-03:00`);

        if (
            isNaN(fechaDesde.getTime()) ||
            isNaN(fechaHasta.getTime()) ||
            fechaDesde > fechaHasta
        ) {
            throw new BadRequestException(
                'Rango de fechas inválido'
            );
        }

        return {
            createdAt: {
                $gte: fechaDesde,
                $lte: fechaHasta
            }
        };
    }

    async publicacionesPorUsuario(desde?: string, hasta?: string) {

        const filtro = this.obtenerFiltroFechas(desde, hasta);

        const publicaciones = await this.publicacionModel
            .find(filtro)
            .populate('autor', 'nombreUsuario');

        const resultado: Record<string, number> = {};

        publicaciones.forEach(publicacion => {
            const autor = publicacion.autor as any;

            if (!autor?.nombreUsuario) return;

            const nombre = autor.nombreUsuario;

            resultado[nombre] = (resultado[nombre] || 0) + 1;
        });

        return Object.entries(resultado).map(([usuario, cantidad]) => ({
            usuario,
            cantidad
        }));
    }

    async comentariosPorFecha(desde?: string, hasta?: string) {

        const filtro = this.obtenerFiltroFechas(desde, hasta);

        const comentarios = await this.comentarioModel.find(filtro);

        const resultado: Record<string, number> = {};

        comentarios.forEach(comentario => {
            const fecha = comentario.get('createdAt') as Date;

            const dia = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Argentina/Buenos_Aires',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(fecha);

            resultado[dia] = (resultado[dia] || 0) + 1;
        });

        return Object.entries(resultado)
            .map(([fecha, cantidad]) => ({ fecha, cantidad }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
    }

    async comentariosPorPublicacion(desde?: string, hasta?: string) {

        const filtro = this.obtenerFiltroFechas(desde, hasta);

        const comentarios = await this.comentarioModel
            .find(filtro)
            .populate('publicacion', 'titulo');

        const resultado: Record<string, {
            titulo: string;
            cantidad: number;
        }> = {};

        comentarios.forEach(comentario => {
            const publicacion = comentario.publicacion as any;

            if (!publicacion?._id) return;

            const id = publicacion._id.toString();

            if (!resultado[id]) {
                resultado[id] = {
                    titulo: publicacion.titulo,
                    cantidad: 0
                };
            }

            resultado[id].cantidad++;
        });

        return Object.entries(resultado).map(
            ([idPublicacion, datos]) => ({
                idPublicacion,
                ...datos
            })
        );
    }
}
