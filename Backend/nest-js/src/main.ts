import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import * as dns from 'dns';
import { ValidationPipe } from '@nestjs/common';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.enableCors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Accept, Authorization',
  credentials: true,
});
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();