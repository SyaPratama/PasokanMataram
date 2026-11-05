/**
 * @file apps/web/src/lib/rate-limit.ts
 * Rate limiting untuk prevent brute force attacks.
 * Mendukung Upstash Redis REST jika terkonfigurasi, atau in-memory fallback.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory fallback sliding window tracker
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

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(upstashUrl?.startsWith('https://') && upstashToken);

const upstashClient = hasUpstash
  ? new Redis({ url: upstashUrl!, token: upstashToken! })
  : null;

export const loginRateLimiter = upstashClient
  ? new Ratelimit({
      redis: upstashClient,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:login',
    })
  : null;

export async function checkRateLimit(
  identifier: string,
  limiter: unknown,
  limitCount = 5,
  windowMs = 15 * 60 * 1000
): Promise<RateLimitResult> {
  if (limiter && typeof limiter === 'object' && 'limit' in limiter) {
    try {
      const res = await (limiter as Ratelimit).limit(identifier);
      return { success: res.success, limit: res.limit, remaining: res.remaining, reset: res.reset };
    } catch {
      // Fallback to in-memory on error
    }
  }
  return checkMemoryLimit(identifier, limitCount, windowMs);
}
