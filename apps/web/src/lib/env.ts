import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Muat konfigurasi .env sesuai urutan prioritas Next.js:
// 1. .env.local (tertinggi untuk dev lokal)
// 2. .env.[NODE_ENV]
// 3. .env (fallback umum)
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : (process.env.NODE_ENV === 'test' ? '.env.local' : '.env.local');

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // PostgreSQL Connection
  DATABASE_URL: z.string().min(10, 'DATABASE_URL wajib diisi'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default('Tama123'),
  DB_NAME: z.string().default('pasokmataram_db'),
  DB_SSL: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),

  // Redis Cache & Lock
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // MinIO Storage
  MINIO_ENDPOINT: z.string().default('http://localhost:9000'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET_PRIVATE: z.string().default('kyb-documents-private'),

  // JWT Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  SESSION_EXPIRY_DAYS: z.coerce.number().default(7),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),

});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.warn(`[PERINGATAN ENV] Konfigurasi environment belum lengkap:\n${errorDetails}\nMenggunakan nilai default untuk pengembangan lokal.`);
  }
  // Fallback defaults untuk menghindari crash saat inisialisasi awal
  parsedEnv = envSchema.parse({
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://root:Tama123@localhost:5432/pasokmataram_db',
    JWT_SECRET: process.env.JWT_SECRET || 'rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars',
  });
}

export const env = parsedEnv;
