/**
 * @file apps/web/src/lib/rate-limit.ts
 * Rate limiting untuk prevent brute force attacks.
 * Memakai Redis shared hosting (unix socket / TCP) dengan fallback in-memory.
 */

import { redis } from './redis-lock';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<string, number[]>();

function checkMemoryLimit(identifier: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (memoryStore.get(identifier) || []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(((timestamps[0] ?? now) + windowMs - now) / 1000),
    };
  }

  timestamps.push(now);
  memoryStore.set(identifier, timestamps);

  return {
    success: true,
    limit,
    remaining: limit - timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

/**
 * Mengambil koneksi Redis yang sudah siap dipakai.
 * @returns Klien Redis siap pakai, atau null bila Redis tidak tersedia.
 */
async function getReadyClient() {
  if (!redis) return null;
  if (redis.status === 'ready') return redis;
  if (redis.status === 'wait') {
    try {
      await redis.connect();
    } catch {
      return null;
    }
  }
  return redis.status === 'ready' ? redis : null;
}

/**
 * Menghitung percobaan pada jendela tetap Redis, dengan fallback in-memory saat Redis gagal.
 * @returns Hasil limit berisi status, sisa kuota, dan detik hingga reset.
 */
export async function checkRateLimit(
  identifier: string,
  limitCount = 5,
  windowMs = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const client = await getReadyClient();
  if (client) {
    const windowSeconds = Math.ceil(windowMs / 1000);
    const key = `ratelimit:${identifier}`;
    try {
      const attempts = await client.incr(key);
      if (attempts === 1) {
        await client.expire(key, windowSeconds);
      }
      const ttl = await client.ttl(key);
      return {
        success: attempts <= limitCount,
        limit: limitCount,
        remaining: Math.max(0, limitCount - attempts),
        reset: ttl > 0 ? ttl : windowSeconds,
      };
    } catch {
      return checkMemoryLimit(identifier, limitCount, windowMs);
    }
  }
  return checkMemoryLimit(identifier, limitCount, windowMs);
}
