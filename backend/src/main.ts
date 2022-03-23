import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { fastifyHelmet } from 'fastify-helmet';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  // Middlewares
  app.enableCors({
    origin: [
      'http://localhost:8080', // Front-end client
    ],
  });
  await app.register(fastifyHelmet);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configService.get('API_PORT'));
}
bootstrap();
