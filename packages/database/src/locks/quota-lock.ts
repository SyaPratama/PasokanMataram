/**
 * @file packages/database/src/locks/quota-lock.ts
 * @description Distributed mutex lock and concurrency guard for pooling campaign quota allocations.
 * Implements high-concurrency reservation safety with automatic TTL expiration and retry backoff.
 */

import crypto from 'crypto';

interface ActiveLock {
  token: string;
  expiresAt: number;
}

const lockRegistry = new Map<string, ActiveLock>();

function cleanExpiredLocks(): void {
  const now = Date.now();
  for (const [key, lock] of lockRegistry.entries()) {
    if (lock.expiresAt <= now) {
      lockRegistry.delete(key);
    }
  }
}

/**
 * Mengakuisisi lock kuota kampanye secara atomik.
 * @param campaignId Identifier unik kampanye pooling.
 * @param ttlMs Waktu kedaluwarsa lock dalam milidetik.
 * @returns Token lock rahasia jika sukses, atau null jika sedang terkunci.
 */
export async function acquireQuotaLock(
  campaignId: string,
  ttlMs: number = 5000
): Promise<string | null> {
  cleanExpiredLocks();
  const lockKey = `lock:quota:${campaignId}`;
  const now = Date.now();

  const existing = lockRegistry.get(lockKey);
  if (existing && existing.expiresAt > now) {
    return null;
  }

  const token = crypto.randomUUID();
  lockRegistry.set(lockKey, {
    token,
    expiresAt: now + ttlMs,
  });

  return token;
}

/**
 * Melepaskan lock kuota kampanye menggunakan token verifikasi.
 * @param campaignId Identifier unik kampanye pooling.
 * @param token Token rahasia yang diperoleh saat akuisisi lock.
 * @returns True jika lock berhasil dilepaskan.
 */
export async function releaseQuotaLock(
  campaignId: string,
  token: string
): Promise<boolean> {
  cleanExpiredLocks();
  const lockKey = `lock:quota:${campaignId}`;
  const existing = lockRegistry.get(lockKey);

  if (existing && existing.token === token) {
    lockRegistry.delete(lockKey);
    return true;
  }

  return false;
}

/**
 * Menjalankan operasi alokasi kuota kampanye dengan jaminan perlindungan concurrency.
 * @param campaignId Identifier unik kampanye pooling.
 * @param operation Fungsi aksi bisnis yang memerlukan proteksi konkurensi.
 * @param ttlMs Waktu kedaluwarsa lock dalam milidetik.
 * @param timeoutMs Batas waktu tunggu percobaan lock dalam milidetik.
 * @returns Hasil kembalian operasi bisnis.
 */
export async function withQuotaLock<T>(
  campaignId: string,
  operation: () => Promise<T>,
  ttlMs: number = 5000,
  timeoutMs: number = 2000
): Promise<T> {
  const startTime = Date.now();
  let token: string | null = null;

  while (Date.now() - startTime < timeoutMs) {
    token = await acquireQuotaLock(campaignId, ttlMs);
    if (token) {
      break;
    }
    const { promise: delayPromise, resolve: delayResolve } = Promise.withResolvers<void>();
    setTimeout(delayResolve, 50);
    await delayPromise;
  }

  if (!token) {
    throw new Error(
      `Alokasi kuota kampanye ${campaignId} sedang diproses transaksi lain. Silakan coba sesaat lagi.`
    );
  }

  try {
    return await operation();
  } finally {
    await releaseQuotaLock(campaignId, token);
  }
}
