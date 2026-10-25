/**
 * @file src/config/database.ts
 * @description Konfigurasi koneksi PostgreSQL 16 dan connection pool.
 * Mematuhi Prinsip VII dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const databaseConfigSchema = z.object({
  connectionString: z.string().min(10),
  host: z.string().default('localhost'),
  port: z.coerce.number().int().default(5432),
  user: z.string().default('root'),
  password: z.string().default('Tama123'),
  database: z.string().default('pasokmataram_db'),
  ssl: z.boolean().default(false),
  pool: z.object({
    maxConnections: z.number().int().positive().default(20),
    idleTimeoutMillis: z.number().int().positive().default(30000),
    connectionTimeoutMillis: z.number().int().positive().default(5000),
  }),
  slowQueryThresholdMs: z.number().int().positive().default(200),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

const rawDatabaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || 'Tama123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pasokmataram_db'}`;

const sslEnabled =
  process.env.DB_SSL === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false' && !process.env.DB_HOST?.includes('postgres'));

export const databaseConfig: DatabaseConfig = databaseConfigSchema.parse({
  connectionString: rawDatabaseUrl,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'root',
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
