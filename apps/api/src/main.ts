/**
 * @file apps/api/src/main.ts
 * @description Bootstrap entrypoint for the PasokMataram NestJS Microservices Backend.
 * Implements Global Prefix, CORS, and IETF Idempotency Guard.
 */

import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { IdempotencyGuard } from './common/idempotency.guard';
import { AuthGuard } from './common/auth.guard';
import { RolesGuard } from './common/roles.guard';
import { TenantContextGuard } from './common/tenant-context.guard';
import { autoMigrate } from '@pasok/database';
/**
 * Menginisialisasi dan menjalankan server backend NestJS.
 */
async function bootstrap(): Promise<void> {
  console.log('[NestJS Startup] Running auto-migration...');
  const migrationResult = await autoMigrate(false);
  
  if (!migrationResult.success) {
    console.error('[NestJS Startup] Migration failed:', migrationResult.error);
    console.error('[NestJS Startup] App will continue but database may be outdated');
  } else {
    console.log(`[NestJS Startup] Migration complete (${migrationResult.migrationsRun} migrations)`);
  }

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

  app.use(cookieParser());

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.solosmartpay.com'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    noSniff: true,
  }));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(
    new AuthGuard(reflector),
    new RolesGuard(reflector),
    new TenantContextGuard(),
    new IdempotencyGuard()
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`[PASOKMATARAM-API] NestJS Backend berjalan pada port ${port}`);
}

bootstrap();
