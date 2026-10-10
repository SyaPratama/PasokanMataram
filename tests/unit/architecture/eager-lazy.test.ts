/**
 * Unit test suite verifying Eager Initialization and Lazy Evaluation patterns across
 * API, Domain, Queue, and Service layers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lazy, lazyAsync, asTenantId, asUserId } from '@pasok/domain';
import {
  enqueueJob,
  dequeueJob,
  clearInMemoryQueue,
  validateJobPayload,
  createQueueWorker,
} from '@pasok/queue';
import {
  bootstrapAuthService,
  getStorageClient,
  createSessionToken,
  hashPassword,
} from '@pasok/auth-kyb-service';

describe('Pola Eager vs Lazy Architecture', () => {
  beforeEach(() => {
    clearInMemoryQueue();
  });

  describe('1. Native Lazy Evaluator Utilities', () => {
    it('lazy() mengeksekusi factory tepat satu kali dan memoisasi hasilnya', () => {
      const mockFactory = vi.fn(() => ({ timestamp: Date.now(), rand: Math.random() }));
      const getSingleton = lazy(mockFactory);

      expect(mockFactory).not.toHaveBeenCalled();

      const instance1 = getSingleton();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const instance2 = getSingleton();
      expect(mockFactory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
    });

    it('lazyAsync() menangguhkan pemanggilan asinkron dan mengembalikan promise memoized', async () => {
      let callCount = 0;
      const asyncFactory = async () => {
        callCount++;
        return `connection-handle-${callCount}`;
      };

      const getAsyncResource = lazyAsync(asyncFactory);
      expect(callCount).toBe(0);

      const [res1, res2] = await Promise.all([getAsyncResource(), getAsyncResource()]);
      expect(callCount).toBe(1);
      expect(res1).toBe('connection-handle-1');
      expect(res2).toBe('connection-handle-1');
    });
  });

  describe('2. Queue Layer: Eager Validation & Lazy Processing', () => {
    it('gagal seketika (fail-fast) saat payload antrean tidak memenuhi skema kontrak (Eager Validation)', async () => {
      const invalidPayload = {
        tenantId: 'invalid-non-uuid',
        documentId: 'not-a-uuid',
        documentType: 'INVALID_DOC_TYPE',
      };

      await expect(
        enqueueJob('kyb.document.uploaded', invalidPayload as any)
      ).rejects.toThrow();
    });

    it('berhasil memvalidasi payload dan memasukkan job ke antrean', async () => {
      const validPayload = {
        tenantId: '11111111-1111-1111-1111-111111111111',
        documentId: '22222222-2222-2222-2222-222222222222',
        documentType: 'NIB' as const,
        storageKey: 'tenants/1111/kyb/nib.webp',
        uploadedAt: new Date().toISOString(),
      };

      const job = await enqueueJob('kyb.document.uploaded', validPayload);
      expect(job.id).toBeDefined();
      expect(job.queue).toBe('kyb.document.uploaded');
      expect(job.payload.documentType).toBe('NIB');

      const dequeued = await dequeueJob('kyb.document.uploaded');
      expect(dequeued).not.toBeNull();
      expect(dequeued?.id).toBe(job.id);
      expect(dequeued?.payload.tenantId).toBe(validPayload.tenantId);
    });

    it('worker memproses antrean secara terisolasi tanpa memblokir runtime', async () => {
      const processedJobs: string[] = [];

      await enqueueJob('notification.welcome.email', {
        tenantId: '11111111-1111-1111-1111-111111111111',
        userId: '22222222-2222-2222-2222-222222222222',
        recipientEmail: 'pemilik@horeka.jogja.id',
        recipientName: 'Budi Santoso',
      });

      const worker = createQueueWorker('notification.welcome.email', async (job) => {
        processedJobs.push(job.payload.recipientEmail);
      });

      const didProcess = await worker.processOne();
      expect(didProcess).toBe(true);
      expect(processedJobs).toEqual(['pemilik@horeka.jogja.id']);

      const noMoreJobs = await worker.processOne();
      expect(noMoreJobs).toBe(false);
    });
  });

  describe('3. Service & Runtime Layer: Eager Bootstrap & Lazy Storage Client', () => {
    it('bootstrapAuthService() mengeksekusi pemeriksaan eager dan mengembalikan status kesiapan', async () => {
      const result = await bootstrapAuthService();
      expect(result).toHaveProperty('ready');
      expect(result).toHaveProperty('latencyMs');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('getStorageClient() menginisialisasi S3 client secara lazy', async () => {
      const client = await getStorageClient();
      expect(client).toBeDefined();
      expect(client.config).toBeDefined();
    });

    it('createSessionToken() menerbitkan JWT valid berbasis SecurityContext', () => {
      const context = {
        tenantId: asTenantId('11111111-1111-1111-1111-111111111111'),
        userId: asUserId('22222222-2222-2222-2222-222222222222'),
        role: 'OWNER',
        isSuperAdmin: false,
      };

      const token = createSessionToken(context);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('hashPassword() menggunakan algoritma Argon2id secara asinkron', async () => {
      const hash = await hashPassword('PasswordAman123!');
      expect(hash).toContain('$argon2id$');
    });
  });
});
