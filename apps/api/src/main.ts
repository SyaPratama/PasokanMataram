/**
 * @file apps/api/src/main.ts
 * @description Bootstrap entrypoint for the PasokMataram NestJS Microservices Backend.
 * Implements Global Prefix, CORS, and IETF Idempotency Guard.
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IdempotencyGuard } from './common/idempotency.guard';

/**
 * Menginisialisasi dan menjalankan server backend NestJS.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalGuards(new IdempotencyGuard());

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`[PASOKMATARAM-API] NestJS Backend berjalan pada port ${port}`);
}

bootstrap();
