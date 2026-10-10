import { describe, it, expect } from 'vitest';
import { RegisterBusinessSchema } from '../../../apps/web/src/lib/validations/auth-schemas';

describe('Contract: Registration API Schema (T018 - auth-api-contract.md)', () => {
  it('berhasil memvalidasi payload registrasi bisnis yang sah', () => {
    const validPayload = {
      businessName: 'Warung Kopi Mataram Baru',
      tenantType: 'HOREKA_BUYER',
      regency: 'SLEMAN',
      ownerName: 'Budi Santoso',
      email: 'budi@kopimataram.id',
      phoneNumber: '081234567890',
      password: 'PasswordAman123!',
    };

    const result = RegisterBusinessSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.businessName).toBe(validPayload.businessName);
      expect(result.data.regency).toBe('SLEMAN');
    }
  });

  it('menolak payload dengan email tidak valid atau nama usaha terlalu pendek', () => {
    const invalidPayload = {
      businessName: 'WK', // Terlalu pendek (< 3)
      tenantType: 'HOREKA_BUYER',
      regency: 'SLEMAN',
      ownerName: 'Budi',
      email: 'bukan-email-valid',
      phoneNumber: '081234567890',
      password: '123', // Terlalu pendek (< 8)
    };

    const result = RegisterBusinessSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.businessName).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});
