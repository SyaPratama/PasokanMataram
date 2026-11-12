/**
 * @file packages/cache/src/index.ts
 * @description Redis caching layer with tenant-scoped keys
 */

import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const socketValue = process.env.REDIS_SOCKET
  || process.env.REDIS_PATH
  || (redisUrl.startsWith('unix://') || redisUrl.startsWith('/') ? redisUrl : undefined);
const socketPath = socketValue?.replace(/^unix:\/\//, '');

const client = socketPath
  ? createClient({ socket: { path: socketPath } })
  : createClient({ url: redisUrl });

client.on('error', (err) => console.error('[Redis Error]', err));

let connected = false;

async function ensureConnection(): Promise<void> {
  if (!connected) {
    await client.connect();
    connected = true;
  }
}

export async function get(key: string): Promise<string | null> {
  await ensureConnection();
  return client.get(key);
}

export async function set(key: string, value: string, ttlSeconds?: number): Promise<void> {
  await ensureConnection();
  if (ttlSeconds) {
    await client.setEx(key, ttlSeconds, value);
  } else {
    await client.set(key, value);
  }
}

export async function del(key: string): Promise<void> {
  await ensureConnection();
  await client.del(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
  await ensureConnection();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}

export { client };
