import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, issueSessionToken, verifySessionToken } from '../../../apps/web/src/lib/auth';

describe('Modul Autentikasi & Keamanan (Argon2id & JWT)', () => {
  it('berhasil melakukan hash dan verifikasi kata sandi dengan Argon2id', async () => {
    const plain = 'PasswordSleman123!';
    const hash = await hashPassword(plain);

    expect(hash).toContain('$argon2id$');
    const isValid = await verifyPassword(plain, hash);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword('SalahPassword!', hash);
    expect(isWrong).toBe(false);
  });

  it('berhasil menerbitkan dan memvalidasi token sesi JWT dengan SecurityContext', () => {
    const payload = {
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '223e4567-e89b-12d3-a456-426614174000',
      role: 'OWNER',
      isSuperAdmin: false,
      email: 'owner@horekajogja.id',
      businessName: 'Gudeg Yu Djum Cabang Sleman',
    };

    const token = issueSessionToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.tenantId).toBe(payload.tenantId);
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.role).toBe('OWNER');
    expect(decoded?.businessName).toBe(payload.businessName);
  });

  it('mengembalikan null jika token tidak valid atau dimanipulasi', () => {
    const invalidToken = 'eyAiYWxnIjogIkhTMjU2In0.invalidpayload.invalidsignature';
    const decoded = verifySessionToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
