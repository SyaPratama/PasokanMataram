/**
 * @file src/config/cache.ts
 * @description Konfigurasi Redis 7 Community Cache & Distributed Mutex Lock.
 * Mematuhi Prinsip VII.1 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const cacheConfigSchema = z.object({
  url: z.string(),
  socketPath: z.string().optional(),
  defaultLockTtlSeconds: z.number().int().positive().default(10),
  defaultLockTimeoutMs: z.number().int().positive().default(2000),
  retryIntervalMs: z.number().int().positive().default(50),
  keyPrefix: z.string().default('pasokmataram:'),
});

export type CacheConfig = z.infer<typeof cacheConfigSchema>;

function resolveSocketPath(): string | undefined {
  const direct = process.env.REDIS_SOCKET || process.env.REDIS_PATH;
  if (direct) return direct.replace(/^unix:\/\//, '');

  const envUrl = process.env.REDIS_URL;
  if (envUrl && (envUrl.startsWith('/') || envUrl.includes('.sock') || envUrl.startsWith('unix://'))) {
    return envUrl.replace(/^unix:\/\//, '');
  }
  return undefined;
}

function buildRedisUrl(): string {
  const socketPath = resolveSocketPath();
  if (socketPath) {
    return `unix://${socketPath}`;
  }
  return process.env.REDIS_URL || 'redis://localhost:6379';
}

export const cacheConfig: CacheConfig = cacheConfigSchema.parse({
  url: buildRedisUrl(),
  socketPath: resolveSocketPath(),
  defaultLockTtlSeconds: 10,
  defaultLockTimeoutMs: 2000,
  retryIntervalMs: 50,
  keyPrefix: 'pasokmataram:',
});
