import { describe, it, expect, vi } from 'vitest';
import { withDbRetry } from '@pasok/database';
import { DbHealthController } from '../../../apps/api/src/health/dbHealth';
import { ServiceUnavailableException } from '@nestjs/common';
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

  it('DbHealthController mengembalikan 200 OK saat database sehat', async () => {
    const spy = vi.spyOn(dbModule, 'query').mockResolvedValueOnce({
      rows: [{ '1': 1 }],
      rowCount: 1,
    } as unknown as { rows: Record<string, unknown>[]; rowCount: number });

    const controller = new DbHealthController();
    const result = await controller.check();

    expect(result).toEqual({ status: 'OK', database: 'HEALTHY' });
    spy.mockRestore();
  });
  it('DbHealthController melempar ServiceUnavailableException (503) saat retry habis', async () => {
    const spy = vi.spyOn(dbModule, 'withDbRetry').mockRejectedValueOnce(new Error('Connection timeout'));

    const controller = new DbHealthController();
    await expect(controller.check()).rejects.toThrow(ServiceUnavailableException);

    spy.mockRestore();
  });
});
