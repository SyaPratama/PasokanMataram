import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import mysql from 'mysql2/promise';
import { pool, query, withDbRetry } from '@pasok/database';
import { DbHealthController } from '../../../apps/api/src/health/dbHealth';
import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Suite pengujian integrasi ketahanan koneksi basis data (DB resilience)
 * dan simulasi gangguan jaringan live / partisi tanpa mocking berlebih.
 */
describe('Database Resilience & Live Chaos Fault-Tolerance', () => {
  let isDbLive = false;

  beforeAll(async () => {
    try {
      const client = await pool.getConnection();
      client.release();
      isDbLive = true;
    } catch {
      isDbLive = false;
    }
  });

  afterAll(async () => {
    if (isDbLive) {
      await pool.end();
    }
  });

  it('memverifikasi eksekusi SELECT 1 melalui retry wrapper terhadap MySQL aktif', async (ctx) => {
    if (!isDbLive) {
      ctx.skip();
      return;
    }

    const res = await withDbRetry(() => query<{ check_val: number }>('SELECT 1 as check_val'));
    expect(res.rows.length).toBe(1);
    const row = res.rows[0];
    expect(row?.check_val).toBe(1);
  });

  it('DbHealthController berhasil mengembalikan status OK dan database HEALTHY pada MySQL aktif', async (ctx) => {
    if (!isDbLive) {
      ctx.skip();
      return;
    }

    const controller = new DbHealthController();
    const result = await controller.check();

    expect(result).toEqual({ status: 'OK', database: 'HEALTHY' });
  });

  it('mensimulasikan partisi jaringan live (port tidak dapat dijangkau) dan memverifikasi batas retry', async () => {
    let attempts = 0;
    const testUnreachablePort = async () => {
      attempts++;
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: 33998,
        user: 'invalid_user',
        password: 'invalid_password',
        connectTimeout: 500,
      });
      await conn.end();
    };

    await expect(withDbRetry(testUnreachablePort)).rejects.toThrow();
    expect(attempts).toBe(6);
  }, 15000);

  it('DbHealthController melempar ServiceUnavailableException (HTTP 503) saat koneksi terputus total', async () => {
    const unreachableController = new DbHealthController();
    const originalQuery = pool.query;

    const mockPool = vi.spyOn(pool, 'execute').mockImplementation(async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:3307');
    });

    try {
      await expect(unreachableController.check()).rejects.toThrow(ServiceUnavailableException);
    } finally {
      mockPool.mockRestore();
    }
  }, 10000);

  it('pulih secara transparan saat terjadi gangguan sementara (transient packet drops)', async () => {
    let failureCount = 0;
    const transientOperation = async (): Promise<string> => {
      if (failureCount < 2) {
        failureCount++;
        throw new Error('read ECONNRESET (transient packet loss)');
      }
      return 'connection-restored';
    };

    const result = await withDbRetry(transientOperation);
    expect(result).toBe('connection-restored');
    expect(failureCount).toBe(2);
  });
});
