
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import * as dns from 'dns';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://patitas-al-refugio-angular.vercel.app',
      'https://patitas-al-refugio-angular-i4pl57ys8-progra-iv-castanheira-becq.vercel.app'
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
