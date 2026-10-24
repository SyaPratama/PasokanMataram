/**
 * @file apps/api/src/common/idempotency.guard.ts
 * @description NestJS guard implementing IETF draft idempotency key specification and SHA-256 payload protection.
 * Prevents double-spending and duplicate transaction submissions per tamaku-payment-gateway architecture report 03.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import crypto from 'crypto';
import type { Request } from 'express';

interface CachedEntry {
  hash: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  timestamp: number;
}

const MAX_ENTRIES = 10000;
const TTL_MS = 24 * 60 * 60 * 1000;
const IN_PROGRESS_LOCK_MS = 60 * 1000;
const memoryIdempotencyRegistry = new Map<string, CachedEntry>();

function pruneExpiredEntries(): void {
  const now = Date.now();
  if (memoryIdempotencyRegistry.size > MAX_ENTRIES) {
    for (const [k, v] of memoryIdempotencyRegistry.entries()) {
      if (now - v.timestamp > TTL_MS) {
        memoryIdempotencyRegistry.delete(k);
      }
    }
    if (memoryIdempotencyRegistry.size > MAX_ENTRIES) {
      const keysToDelete = Array.from(memoryIdempotencyRegistry.keys()).slice(0, 1000);
      keysToDelete.forEach((k) => memoryIdempotencyRegistry.delete(k));
    }
  }
}

@Injectable()
export class IdempotencyGuard implements CanActivate {
  /**
   * Memvalidasi apakah header Idempotency-Key unik dan tidak terjadi tabrakan hash payload.
   * @param context Konteks eksekusi HTTP.
   * @returns True jika permintaan absah diproses.
   */
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const rawKey = request.headers['idempotency-key'] as string | undefined;

    if (!rawKey) {
      return true;
    }

    if (rawKey.length < 8 || rawKey.length > 100) {
      throw new HttpException(
        'Header Idempotency-Key wajib memiliki panjang antara 8 hingga 100 karakter.',
        HttpStatus.BAD_REQUEST
      );
    }

    const tenantId = (request.headers['x-tenant-id'] as string) || 'public';
    const scopedKey = `${tenantId}:${rawKey}`;

    const payloadString = JSON.stringify(request.body || {});
    const currentHash = crypto.createHash('sha256').update(payloadString).digest('hex');
    const now = Date.now();

    pruneExpiredEntries();

    const existing = memoryIdempotencyRegistry.get(scopedKey);
    if (existing) {
      if (existing.hash !== currentHash) {
        throw new HttpException(
          'Idempotency-Key telah digunakan untuk parameter transaksi yang berbeda (Payload Hash Mismatch).',
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }

      if (existing.status === 'IN_PROGRESS' && now - existing.timestamp < IN_PROGRESS_LOCK_MS) {
        throw new HttpException(
          'Permintaan transaksi sedang diproses di server. Silakan tunggu beberapa saat.',
          HttpStatus.CONFLICT
        );
      }

      return true;
    }

    memoryIdempotencyRegistry.set(scopedKey, {
      hash: currentHash,
      status: 'IN_PROGRESS',
      timestamp: now,
    });

    return true;
  }
}
