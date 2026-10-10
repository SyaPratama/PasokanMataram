import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { query, withTenantContext, pool } from '@pasok/database';

describe('PostgreSQL 16 Connection & Row-Level Security Wrapper', () => {
  let isDbConnected = false;

  beforeAll(async () => {
    try {
      const client = await pool.connect();
      client.release();
      isDbConnected = true;
    } catch {
      isDbConnected = false;
      console.warn('[DB TEST INFO] PostgreSQL offline di localhost:5432. Pengujian live database dilewati secara terisolasi.');
    }
  });

  afterAll(async () => {
    if (isDbConnected) {
      await pool.end();
    }
  });

  it('berhasil terhubung ke database PostgreSQL di Docker dan membaca versi', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const res = await query<{ connected: number; db_name: string }>('SELECT 1 as connected, current_database() as db_name');
    expect(res.rows.length).toBe(1);
    const firstRow = res.rows[0];
    expect(firstRow?.connected).toBe(1);
    expect(firstRow?.db_name).toBe('pasokmataram_db');
  });

  it('memastikan tabel-tabel 3NF telah terpasang di database', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const res = await query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    const tableNames = res.rows.map((r) => r.table_name);

    expect(tableNames).toContain('tenants');
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('kyb_documents');
    expect(tableNames).toContain('business_outlets');
  });

  it('menerapkan konteks RLS app.current_tenant_id dalam sesi transaksi', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
    const context = {
      tenantId: mockTenantId,
      userId: '223e4567-e89b-12d3-a456-426614174000',
      role: 'OWNER',
      isSuperAdmin: false,
    };

    const sessionTenantId = await withTenantContext(context, async (client) => {
      const res = await client.query("SELECT current_setting('app.current_tenant_id', true) as tenant_id");
      return res.rows[0].tenant_id;
    });

    expect(sessionTenantId).toBe(mockTenantId);
  });
});
