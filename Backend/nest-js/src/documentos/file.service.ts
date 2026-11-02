import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { parse } from 'node:path';
import { Readable } from 'node:stream';

@Injectable()
export class FileService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    // Agregamos folderName con un valor por defecto 'perfiles'
    async cloudinaryUploader(file: Express.Multer.File, folderName: string = 'perfiles'): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderName, // <--- Acá usa dinámicamente la carpeta que le pases
                    public_id: parse(file.originalname).name,
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) {
                        reject(new Error('No se pudo subir la foto a Cloudinary'));
                    } else if (!result?.secure_url) {
                        reject(new Error('Cloudinary no devolvió la url de la foto'));
                    } else {
                        resolve(result.secure_url);
                    }
                },
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }
}