import { describe, it, expect } from 'vitest';
import { acquireLock, releaseLock, withLock } from '../../../apps/web/src/lib/redis-lock';

describe('Distributed Mutex Lock Redis 7 (Prinsip VII Konstitusi)', () => {
  const resourceKey = 'test:lock:pool-quota-123';

  it('berhasil memperoleh lock dan melepaskannya secara atomik', async () => {
    const token = await acquireLock(resourceKey, 5);
    expect(token).not.toBeNull();

    // Mencoba memperoleh lock pada resource yang sama saat belum expired
    const secondTry = await acquireLock(resourceKey, 5, 200);
    expect(secondTry).toBeNull();

    // Lepaskan lock
    const released = await releaseLock(resourceKey, token!);
    expect(released).toBe(true);

    // Sekarang resource dapat dikunci kembali
    const thirdTry = await acquireLock(resourceKey, 5);
    expect(thirdTry).not.toBeNull();
    if (thirdTry) {
      await releaseLock(resourceKey, thirdTry);
    }
  });

  it('mengeksekusi action terproteksi secara eksklusif dengan withLock', async () => {
    let executed = false;
    const result = await withLock('test:protected-job', async () => {
      executed = true;
      return 'JOB_DONE';
    });

    expect(executed).toBe(true);
    expect(result).toBe('JOB_DONE');
  });
});
