/**
 * @file src/config/app.ts
 * @description Konfigurasi runtime server dan aplikasi Next.js.
 * Mematuhi Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

const environment = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

const envFile = environment === 'production'
  ? '.env.production'
  : (environment === 'test' ? '.env.local' : '.env.local');

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  appUrl: z.string().url().default('http://localhost:3000'),
  port: z.coerce.number().int().positive().default(3000),
  host: z.string().default('0.0.0.0'),
  appName: z.string().default('PasokMataram'),
  version: z.string().default('1.5.0'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export const appConfig: AppConfig = appConfigSchema.parse({
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  appName: 'PasokMataram',
  version: '1.5.0',
});

export const isProduction = appConfig.nodeEnv === 'production';
export const isDevelopment = appConfig.nodeEnv === 'development';
export const isTest = appConfig.nodeEnv === 'test';
