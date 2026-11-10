import { describe, it, expect, vi } from 'vitest';
import { withDbRetry } from '@pasok/database';
import { RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HealthModule } from '../../../apps/api/src/health/health.module';
import * as dbModule from '@pasok/database';

describe('withDbRetry & DbHealthController Resilience', () => {
  it('berhasil mengembalikan hasil operasi pada percobaan pertama jika tanpa kegagalan', async () => {
    const fn = vi.fn().mockResolvedValue('ok-result');

    const result = await withDbRetry(fn);

    expect(result).toBe('ok-result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('melakukan retry otomatis saat error transien dan berhasil setelah pemulihan', async () => {
    let callCount = 0;
    const fn = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error('Connection lost (transient error)');
      }
      return 'recovered-data';
    });

    const result = await withDbRetry(fn);

    expect(result).toBe('recovered-data');
    expect(callCount).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('melempar error jika kegagalan melebihi batas maxRetries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Fatal DB crash'));

    await expect(withDbRetry(fn)).rejects.toThrow('Fatal DB crash');
    expect(fn).toHaveBeenCalledTimes(6);
  });

  it('GET /health/db returns 200 or 503 outside the API prefix', async () => {
    const spy = vi.spyOn(dbModule, 'query').mockResolvedValue({ rows: [], rowCount: 1 });
    const app = await NestFactory.create(HealthModule, { logger: false });
    app.setGlobalPrefix('api/v1', {
      exclude: [{ path: 'health/db', method: RequestMethod.GET }],
    });
    await app.listen(0, '127.0.0.1');

    try {
      const url = await app.getUrl();
      const healthy = await fetch(`${url}/health/db`);
      expect(healthy.status).toBe(200);
      expect(await healthy.json()).toEqual({ status: 'OK', database: 'HEALTHY' });

      const prefixed = await fetch(`${url}/api/v1/health/db`);
      expect(prefixed.status).toBe(404);

      spy.mockRejectedValueOnce(new Error('Connection timeout'));
      const unavailable = await fetch(`${url}/health/db`);
      expect(unavailable.status).toBe(503);
      expect(await unavailable.json()).toEqual({ status: 'ERROR', database: 'UNAVAILABLE' });
    } finally {
      spy.mockRestore();
      await app.close();
    }
  });
});
