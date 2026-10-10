import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '@pasok/database';
import { TenantService } from '../../../apps/web/src/services/tenant-service';
import type { SecurityContext, TenantId } from '@pasok/domain';

describe('User Story 2 Integration Flow: Admin KYB Verification Queue & Mutex Lock (T032)', () => {
  let isDbConnected = false;
  let testTenantId: string | undefined = undefined;
  let testUserId: string | undefined = undefined;

  const adminContext: SecurityContext = {
    tenantId: '00000000-0000-0000-0000-000000000000' as TenantId,
    userId: '11111111-1111-1111-1111-111111111111' as any,
    role: 'SUPER_ADMIN' as any,
    isSuperAdmin: true,
  };

  const nonAdminContext: SecurityContext = {
    tenantId: '22222222-2222-2222-2222-222222222222' as TenantId,
    userId: '33333333-3333-3333-3333-333333333333' as any,
    role: 'OWNER' as any,
    isSuperAdmin: false,
  };

  beforeAll(async () => {
    try {
      const client = await pool.connect();
      client.release();
      isDbConnected = true;
    } catch {
      isDbConnected = false;
      console.warn('[ADMIN TEST INFO] PostgreSQL offline. Pengujian live flow dilewati secara terisolasi.');
    }
  });

  afterAll(async () => {
    if (isDbConnected && testTenantId) {
      await pool.query('DELETE FROM tenants WHERE id = $1', [testTenantId]);
      await pool.end();
    }
  });

  it('menolak akses antrean audit jika pemanggil bukan SUPER_ADMIN', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }

    await expect(
      TenantService.getPendingKybQueue(nonAdminContext, { page: 1, limit: 25 })
    ).rejects.toThrow('Akses ditolak: Memerlukan wewenang Super Admin.');
  });

  it('berhasil memuat antrean verifikasi terpaginasi untuk SUPER_ADMIN', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }

    const queue = await TenantService.getPendingKybQueue(adminContext, { page: 1, limit: 25 });
    expect(queue.items).toBeDefined();
    expect(Array.isArray(queue.items)).toBe(true);
    expect(queue.pagination.currentPage).toBe(1);
    expect(queue.pagination.limit).toBe(25);
  });

  it('menolak keputusan verifikasi dari pengguna non-SUPER_ADMIN', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }

    await expect(
      TenantService.reviewKybSubmission(nonAdminContext, {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        decision: 'APPROVED',
      })
    ).rejects.toThrow('Akses ditolak: Memerlukan wewenang Super Admin.');
  });
});
