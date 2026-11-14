/**
 * @file packages/cache/src/index.ts
 * @description Upstash Redis caching layer with tenant-scoped keys
 */

import { createClient } from 'redis';

/**
 * Menurunkan URL TCP ber-TLS dari kredensial Upstash Redis REST.
 * Token REST Upstash juga merupakan kata sandi TCP native database.
 * @returns URL rediss:// siap pakai, atau undefined bila kredensial belum lengkap.
 */
function resolveUpstashUrl(): string | undefined {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !token) return undefined;
  try {
    const host = new URL(restUrl).hostname;
    return `rediss://default:${encodeURIComponent(token)}@${host}:6379`;
  } catch {
    return undefined;
  }
}

const redisUrl = resolveUpstashUrl();

const client = redisUrl ? createClient({ url: redisUrl }) : null;

type InternalClient = NonNullable<typeof client>;

client?.on('error', (err) => console.error('[Redis Error]', err));

let connected = false;

async function ensureConnection(): Promise<InternalClient> {
  if (!client) {
    throw new Error(
      'Upstash Redis belum dikonfigurasi: isi UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN.'
    );
  }
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

export async function get(key: string): Promise<string | null> {
  return (await ensureConnection()).get(key);
}

export async function set(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const activeClient = await ensureConnection();
  if (ttlSeconds) {
    await activeClient.setEx(key, ttlSeconds, value);
  } else {
    await activeClient.set(key, value);
  }
}

export async function del(key: string): Promise<void> {
  await (await ensureConnection()).del(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const activeClient = await ensureConnection();
  const keys = await activeClient.keys(pattern);
  if (keys.length > 0) {
    await activeClient.del(keys);
  }
}

export { client };
