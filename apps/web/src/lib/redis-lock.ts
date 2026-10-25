/**
 * @file src/lib/redis-lock.ts
 * @description Implementasi distributed mutex lock menggunakan Redis 7 (SET resource token NX EX ttl).
 * Dilengkapi in-memory fallback terisolasi untuk lingkungan pengujian dan mitigasi kondisi balapan lokal.
 * Mematuhi Prinsip VII dan IX Konstitusi PasokMataram v1.5.0.
 */

import Redis from 'ioredis';
import { cacheConfig } from '../config';
import crypto from 'crypto';

export const redis = new Redis(cacheConfig.url, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('error', () => {});
async function getRedisClient(): Promise<Redis | null> {
  if (redis.status === 'ready') return redis;
  if (redis.status === 'connecting') {
    const { promise, resolve } = Promise.withResolvers<boolean>();
    const onReady = () => { cleanup(); resolve(true); };
    const onClose = () => { cleanup(); resolve(false); };
    const timer = setTimeout(() => { cleanup(); resolve(false); }, 300);
    function cleanup() {
      clearTimeout(timer);
      redis.removeListener('ready', onReady);
      redis.removeListener('close', onClose);
    }
    redis.once('ready', onReady);
    redis.once('close', onClose);
    await promise;
    return (redis.status as string) === 'ready' ? redis : null;
  }
  if (redis.status === 'wait') {
    try {
      await redis.connect();
      return (redis.status as string) === 'ready' ? redis : null;
    } catch {
      return null;
    }
  }
  return null;
}
interface InMemoryLock {
  token: string;
  expiresAt: number;
}

const inMemoryStore = new Map<string, InMemoryLock>();

function purgeExpiredInMemoryLocks(): void {
  const now = Date.now();
  for (const [key, lock] of inMemoryStore.entries()) {
    if (lock.expiresAt <= now) {
      inMemoryStore.delete(key);
    }
  }
}

/**
 * Mencoba mengunci resource tertentu secara atomik.
 * Mengembalikan lockToken unik jika berhasil, atau null jika resource sedang terkunci.
 */
export async function acquireLock(
  resourceKey: string,
  ttlSeconds = cacheConfig.defaultLockTtlSeconds,
  waitTimeoutMs = cacheConfig.defaultLockTimeoutMs
): Promise<string | null> {
  const lockKey = `${cacheConfig.keyPrefix}lock:${resourceKey}`;
  const lockToken = crypto.randomUUID();
  const startTime = Date.now();

  const client = await getRedisClient();

  while (Date.now() - startTime < waitTimeoutMs) {
    if (client) {
      try {
        const result = await client.set(lockKey, lockToken, 'EX', ttlSeconds, 'NX');
        if (result === 'OK') {
          return lockToken;
        }
      } catch {}
    } else {
      purgeExpiredInMemoryLocks();
      const current = inMemoryStore.get(lockKey);
      if (!current) {
        inMemoryStore.set(lockKey, {
          token: lockToken,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
        return lockToken;
      }
    }

    await new Promise<void>((resolve) => setTimeout(resolve, cacheConfig.retryIntervalMs));
  }

  return null;
}

/**
 * Melepaskan kunci distributed lock secara atomik menggunakan Lua script
 * untuk memastikan hanya pemilik lockToken sah yang dapat membuka kunci.
 */
export async function releaseLock(resourceKey: string, lockToken: string): Promise<boolean> {
  const lockKey = `${cacheConfig.keyPrefix}lock:${resourceKey}`;
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  const client = await getRedisClient();
  if (client) {
    try {
      const result = await client.eval(luaScript, 1, lockKey, lockToken);
      return result === 1;
    } catch {}
  }

  purgeExpiredInMemoryLocks();
  const current = inMemoryStore.get(lockKey);
  if (current && current.token === lockToken) {
    inMemoryStore.delete(lockKey);
    return true;
  }
  return false;
}

/**
 * Wrapper eksekusi fungsi terproteksi distributed lock secara otomatis.
 */
export async function withLock<T>(
  resourceKey: string,
  action: () => Promise<T>,
  ttlSeconds = cacheConfig.defaultLockTtlSeconds
): Promise<T> {
  const token = await acquireLock(resourceKey, ttlSeconds);
  if (!token) {
    throw new Error(`Gagal memperoleh lock untuk resource "${resourceKey}". Permintaan lain sedang berjalan.`);
  }

  try {
    return await action();
  } finally {
    await releaseLock(resourceKey, token);
  }
}
