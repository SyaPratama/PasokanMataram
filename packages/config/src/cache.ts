/**
 * @file src/config/cache.ts
 * @description Konfigurasi Upstash Redis Cache & Distributed Mutex Lock.
 * Mematuhi Prinsip VII.1 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const cacheConfigSchema = z.object({
  url: z.string(),
  defaultLockTtlSeconds: z.number().int().positive().default(10),
  defaultLockTimeoutMs: z.number().int().positive().default(2000),
  retryIntervalMs: z.number().int().positive().default(50),
  keyPrefix: z.string().default('pasokmataram:'),
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;

/**
 * Menurunkan URL TCP ber-TLS dari kredensial Upstash Redis REST.
 * Token REST Upstash juga merupakan kata sandi TCP native database.
 * @returns URL rediss:// siap pakai, atau string kosong bila kredensial belum lengkap.
 */
function buildRedisUrl(): string {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !token) return '';
  try {
    const host = new URL(restUrl).hostname;
    return `rediss://default:${encodeURIComponent(token)}@${host}:6379`;
  } catch {
    return '';
  }
}

export const cacheConfig: CacheConfig = cacheConfigSchema.parse({
  url: buildRedisUrl(),
  defaultLockTtlSeconds: 10,
  defaultLockTimeoutMs: 2000,
  retryIntervalMs: 50,
  keyPrefix: 'pasokmataram:',
});
