/**
 * @file src/config/cache.ts
 * @description Konfigurasi Redis 7 Community Cache & Distributed Mutex Lock.
 * Mematuhi Prinsip VII.1 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const cacheConfigSchema = z.object({
  url: z.string().startsWith('redis://'),
  defaultLockTtlSeconds: z.number().int().positive().default(10),
  defaultLockTimeoutMs: z.number().int().positive().default(2000),
  retryIntervalMs: z.number().int().positive().default(50),
  keyPrefix: z.string().default('pasokmataram:'),
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;

export const cacheConfig: CacheConfig = cacheConfigSchema.parse({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultLockTtlSeconds: 10,
  defaultLockTimeoutMs: 2000,
  retryIntervalMs: 50,
  keyPrefix: 'pasokmataram:',
});
