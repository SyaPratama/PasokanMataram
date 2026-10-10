/**
 * Background queue worker with eager listener registration and lazy execution.
 */

import { dequeueJob } from './broker';
import type { QueueName, QueueJob } from './types';

export type JobHandler<Q extends QueueName> = (job: QueueJob<Q>) => Promise<void>;

export interface WorkerInstance {
  start: () => void;
  stop: () => void;
  processOne: () => Promise<boolean>;
}

/**
 * Creates a queue worker that processes jobs sequentially.
 */
export function createQueueWorker<Q extends QueueName>(
  queue: Q,
  handler: JobHandler<Q>,
  pollIntervalMs: number = 200
): WorkerInstance {
  let isRunning = false;
  let timer: NodeJS.Timeout | null = null;

  async function processOne(): Promise<boolean> {
    const job = await dequeueJob(queue);
    if (!job) return false;

    try {
      await handler(job);
    } catch (err) {
      console.error(`[WORKER ERROR] Gagal memproses job ${job.id} pada ${queue}:`, err);
    }
    return true;
  }

  function tick() {
    if (!isRunning) return;
    void processOne().finally(() => {
      if (isRunning) {
        timer = setTimeout(tick, pollIntervalMs);
      }
    });
  }

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      tick();
    },
    stop() {
      isRunning = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    processOne,
  };
}
