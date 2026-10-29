/**
 * @file src/config/cache.ts
 * @description Konfigurasi Redis 7 Community Cache & Distributed Mutex Lock.
 * Mematuhi Prinsip VII.1 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const cacheConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().int().positive().default(6379),
  password: z.string().optional(),
  db: z.number().int().min(0).default(0),
  url: z.string(),
  defaultLockTtlSeconds: z.number().int().positive().default(10),
  defaultLockTimeoutMs: z.number().int().positive().default(2000),
  retryIntervalMs: z.number().int().positive().default(50),
  keyPrefix: z.string().default('pasokmataram:'),
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;

/**
 * Build Redis URL from individual parameters or use REDIS_URL directly
 * Priority: REDIS_URL > individual params (HOST, PORT, PASSWORD, DB)
 */
function buildRedisUrl(): string {
  const envUrl = process.env.REDIS_URL;
  if (envUrl) {
    return envUrl;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD;
  const db = process.env.REDIS_DB || '0';

  const auth = password ? `:${password}@` : '';
  return `redis://${auth}${host}:${port}/${db}`;
}

export const cacheConfig: CacheConfig = cacheConfigSchema.parse({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  url: buildRedisUrl(),
  defaultLockTtlSeconds: 10,
  defaultLockTimeoutMs: 2000,
  retryIntervalMs: 50,
  keyPrefix: 'pasokmataram:',
});
