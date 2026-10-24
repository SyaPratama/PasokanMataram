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
  const rawOrigins = process.env.CORS_ALLOWED_ORIGINS;
  const allowedOrigins = rawOrigins
    ? rawOrigins.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://pasokmataram.com'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Akses diblokir oleh kebijakan keamanan CORS.'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalGuards(new IdempotencyGuard());

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`[PASOKMATARAM-API] NestJS Backend berjalan pada port ${port}`);
}

bootstrap();
