/**
 * Queue broker supporting eager payload validation and lazy Redis connection initialization.
 */

import Redis from 'ioredis';
import { cacheConfig } from '@pasok/config';
import { lazyAsync } from '@pasok/domain';
import { QueueJobRegistry, type QueueName, type JobPayload, type QueueJob } from './types';

const inMemoryQueues = new Map<string, QueueJob[]>();

/**
 * Eager contract validator checking job payload against registered Zod schema.
 * Throws ZodError immediately if payload fails contract.
 */
export function validateJobPayload<Q extends QueueName>(queue: Q, payload: unknown): JobPayload<Q> {
  const schema = QueueJobRegistry[queue];
  if (!schema) {
    throw new Error(`Queue "${queue}" tidak terdaftar dalam QueueJobRegistry.`);
  }
  return schema.parse(payload) as JobPayload<Q>;
}

/**
 * Lazy connection initializer for Redis queue broker.
 * Defers connection until the first message enqueue or worker startup.
 */
export const getQueueRedisClient = lazyAsync<Redis | null>(async () => {
  try {
    const client = new Redis(cacheConfig.url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
      lazyConnect: true,
      retryStrategy: () => null,
    });
    client.on('error', () => {
      // Ignored when running offline with in-memory fallback
    });
    await client.connect();
    return client;
  } catch {
    return null;
  }
});

/**
 * Enqueues a job with eager schema validation and lazy broker resolution.
 */
export async function enqueueJob<Q extends QueueName>(
  queue: Q,
  rawPayload: unknown
): Promise<QueueJob<Q>> {
  // 1. Eager contract validation (fail-fast)
  const validatedPayload = validateJobPayload(queue, rawPayload);

  const job: QueueJob<Q> = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    queue,
    payload: validatedPayload,
    attempts: 0,
    createdAt: Date.now(),
  };

  // 2. Lazy broker connection
  const redis = await getQueueRedisClient();
  if (redis && redis.status === 'ready') {
    await redis.lpush(`queue:${queue}`, JSON.stringify(job));
  } else {
    // In-memory fallback
    const list = inMemoryQueues.get(queue) || [];
    list.push(job as QueueJob);
    inMemoryQueues.set(queue, list);
  }

  return job;
}

/**
 * Dequeues next job from queue, trying Redis or in-memory fallback.
 */
export async function dequeueJob<Q extends QueueName>(queue: Q): Promise<QueueJob<Q> | null> {
  const redis = await getQueueRedisClient();
  if (redis && redis.status === 'ready') {
    const raw = await redis.rpop(`queue:${queue}`);
    if (!raw) return null;
    return JSON.parse(raw) as QueueJob<Q>;
  }

  const list = inMemoryQueues.get(queue) || [];
  const next = list.shift() || null;
  return next as QueueJob<Q> | null;
}

/**
 * Clears in-memory queue state (useful for test isolation).
 */
export function clearInMemoryQueue(queue?: QueueName): void {
  if (queue) {
    inMemoryQueues.delete(queue);
  } else {
    inMemoryQueues.clear();
  }
}
