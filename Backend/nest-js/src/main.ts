
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import * as dns from 'dns';
import { ValidationPipe } from '@nestjs/common';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://patitas-al-refugio-angular.vercel.app',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use((req: any, res: any, next: any) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', 'https://patitas-al-refugio-angular.vercel.app');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.sendStatus(204); // Éxito limpio sin redirección
      }
      next();
    });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
