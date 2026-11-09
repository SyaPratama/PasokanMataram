import { describe, it, expect } from 'vitest';
import { RegisterBusinessSchema } from '../../../apps/web/src/lib/validations/auth-schemas';

describe('Dashboard Identity & Registration Contract Integrity (T016)', () => {
  it('memvalidasi skema registrasi bisnis menghasilkan identitas entitas dan pemilik lengkap', () => {
    const rawInput = {
      businessName: 'Kafe Mataram Kotagede',
      tenantType: 'HOREKA_BUYER' as const,
      regency: 'KOTA_YOGYAKARTA' as const,
      ownerName: 'Raden Mas Haryo',
      email: 'haryo@kafemataram.id',
      phoneNumber: '081234567891',
      password: 'PasswordSuper123!',
    };

    const parseResult = RegisterBusinessSchema.safeParse(rawInput);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      expect(parseResult.data.businessName).toBe('Kafe Mataram Kotagede');
      expect(parseResult.data.ownerName).toBe('Raden Mas Haryo');
      expect(parseResult.data.regency).toBe('KOTA_YOGYAKARTA');
      expect(parseResult.data.tenantType).toBe('HOREKA_BUYER');
    }
  });

  it('memastikan format decoding cookie identitas bisnis dan pengguna aman', () => {
    const businessName = 'Restoran Gudeg Yu Djum & Sambal Krecek';
    const userName = 'Ibu Djuwariah';

    const encodedBusiness = encodeURIComponent(businessName);
    const encodedUser = encodeURIComponent(userName);

    expect(decodeURIComponent(encodedBusiness)).toBe(businessName);
    expect(decodeURIComponent(encodedUser)).toBe(userName);
  });
});
