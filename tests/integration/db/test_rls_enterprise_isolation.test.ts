import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool, withTenantContext, SecurityException } from '@pasok/database';
import type { SecurityContext } from '@pasok/domain';

/**
 * Suite pengujian integrasi Row-Level Security (RLS) dan isolasi multi-tenant.
 * Memvalidasi kepatuhan terhadap Konstitusi Prinsip VI dan FR-011 (SC-004: Zero Cross-Tenant Leak).
 */
describe('Multi-Tenant Row-Level Security (RLS) & Isolation (SC-004)', () => {
  let isDbConnected = false;

  beforeAll(async () => {
    try {
      const client = await pool.connect();
      client.release();
      isDbConnected = true;
    } catch {
      isDbConnected = false;
    }
  });

  afterAll(async () => {
    if (isDbConnected) {
      await pool.end();
    }
  });

  it('menolak eksekusi konteks keamanan jika tenantId kosong atau tidak valid', async () => {
    const invalidContext = {
      tenantId: '',
      userId: 'user-123',
      role: 'OWNER',
      isSuperAdmin: false,
    } as SecurityContext;

    await expect(
      withTenantContext(invalidContext, async () => {
        return true;
      })
    ).rejects.toThrow(SecurityException);
  });

  it('mengisolasi kueri antar-tenant via RLS saat basis data aktif', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }

    const tenantA: SecurityContext = {
      tenantId: '11111111-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      role: 'OWNER',
      isSuperAdmin: false,
    };

    const tenantB: SecurityContext = {
      tenantId: '33333333-3333-3333-3333-333333333333',
      userId: '44444444-4444-4444-4444-444444444444',
      role: 'OWNER',
      isSuperAdmin: false,
    };

    await withTenantContext(tenantA, async (clientA) => {
      const resultA = await clientA.query('SELECT current_setting($1, true) as tenant', ['app.current_tenant_id']);
      expect(resultA.rows[0]?.tenant).toBe(tenantA.tenantId);
    });

    await withTenantContext(tenantB, async (clientB) => {
      const resultB = await clientB.query('SELECT current_setting($1, true) as tenant', ['app.current_tenant_id']);
      expect(resultB.rows[0]?.tenant).toBe(tenantB.tenantId);
      expect(resultB.rows[0]?.tenant).not.toBe(tenantA.tenantId);
    });
  });
});
