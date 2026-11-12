/**
 * @file src/config/database.ts
 * @description Konfigurasi koneksi MySQL 8.0 dan connection pool.
 * Mematuhi Prinsip VII dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const databaseConfigSchema = z.object({
  connectionString: z.string().optional(),
  host: z.string().default('localhost'),
  port: z.coerce.number().int().default(3307),
  user: z.string().default('pasok_user'),
  password: z.string().default('Tama123'),
  database: z.string().default('pasokmataram_db'),
  ssl: z.boolean().default(false),
  pool: z.object({
    maxConnections: z.number().int().positive().default(20),
    idleTimeoutMillis: z.number().int().positive().default(30000),
    connectionTimeoutMillis: z.number().int().positive().default(5000),
  }),
  dbRetry: z.object({
    maxRetries: z.number().int().min(1).default(5),
    baseDelayMs: z.number().int().min(10).default(100),
    maxDelayMs: z.number().int().min(100).default(2000),
  }).default({}),
  slowQueryThresholdMs: z.number().int().positive().default(200),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

const rawDatabaseUrl = `mysql://${process.env.DB_USER || 'pasok_user'}:${process.env.DB_PASSWORD || 'Tama123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3307}/${process.env.DB_NAME || 'pasokmataram_db'}`;

const resolvedHost =
  process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : 'localhost');
const isLoopbackHost = ['localhost', '127.0.0.1', '::1'].includes(resolvedHost);
const sslEnabled =
  process.env.DB_SSL === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false' && !isLoopbackHost);

export const databaseConfig: DatabaseConfig = databaseConfigSchema.parse({
  connectionString: rawDatabaseUrl,
  host: resolvedHost,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.NODE_ENV === 'production' ? 3306 : 3307),
  user: process.env.DB_USER || 'pasok_user',
  password: process.env.DB_PASSWORD || 'Tama123',
  database: process.env.DB_NAME || 'pasokmataram_db',
  ssl: sslEnabled,
  pool: {
    maxConnections: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  slowQueryThresholdMs: 200,
});
