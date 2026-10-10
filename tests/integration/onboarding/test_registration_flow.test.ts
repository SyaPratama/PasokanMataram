import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { TenantService } from '../../../apps/web/src/services/tenant-service';
import { pool } from '@pasok/database';

describe('User Story 1 Integration Flow (Pendaftaran & Upload KYB - MVP)', () => {
  let isDbConnected = false;
  const testEmail = `budi_${Date.now()}@kopimataram.id`;
  let registeredTenantId: string;
  let registeredUserId: string;
  let sessionToken: string;

  beforeAll(async () => {
    try {
      const client = await pool.connect();
      client.release();
      isDbConnected = true;
    } catch {
      isDbConnected = false;
      console.warn('[INTEGRATION TEST INFO] PostgreSQL offline. Pengujian live flow dilewati secara terisolasi.');
    }
  });

  afterAll(async () => {
    if (isDbConnected && registeredTenantId) {
      await pool.query('DELETE FROM tenants WHERE id = $1', [registeredTenantId]);
      await pool.end();
    }
  });

  it('berhasil mendaftarkan entitas bisnis HoReKa baru dan akun pemilik (T015, T022)', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const registerInput = {
      businessName: 'Warung Kopi Mataram Baru',
      tenantType: 'HOREKA_BUYER' as const,
      regency: 'SLEMAN' as const,
      ownerName: 'Budi Santoso',
      email: testEmail,
      phoneNumber: '081234567890',
      password: 'PasswordAman123!',
    };

    const result = await TenantService.registerBusiness(registerInput);

    expect(result.tenant).toBeDefined();
    expect(result.tenant.businessName).toBe('Warung Kopi Mataram Baru');
    expect(result.tenant.kybStatus).toBe('PENDING_VERIFICATION');
    expect(result.tenant.tenantType).toBe('HOREKA_BUYER');

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.role).toBe('OWNER');

    expect(result.sessionToken).toBeDefined();
    expect(typeof result.sessionToken).toBe('string');

    registeredTenantId = result.tenant.id;
    registeredUserId = result.user.id;
    sessionToken = result.sessionToken;
  });

  it('menolak pendaftaran dengan alamat email yang sama (409 Conflict)', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const duplicateInput = {
      businessName: 'Warung Kopi Cabang Lain',
      tenantType: 'HOREKA_BUYER' as const,
      regency: 'BANTUL' as const,
      ownerName: 'Budi Santoso',
      email: testEmail,
      phoneNumber: '081299998888',
      password: 'PasswordLain123!',
    };

    await expect(TenantService.registerBusiness(duplicateInput)).rejects.toThrow(
      'Alamat email sudah terdaftar dalam sistem.'
    );
  });

  it('berhasil melakukan autentikasi login dengan kredensial yang didaftarkan', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const authResult = await TenantService.authenticateUser(testEmail, 'PasswordAman123!');
    expect(authResult.user.id).toBe(registeredUserId);
    expect(authResult.tenant.id).toBe(registeredTenantId);
    expect(authResult.sessionToken).toBeDefined();
  });

  it('menolak login dengan kata sandi salah', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    await expect(TenantService.authenticateUser(testEmail, 'PasswordSalah!')).rejects.toThrow(
      'Kredensial tidak valid.'
    );
  });

  it('berhasil menyerahkan metadata dokumen KYB (NIB) dengan status PENDING_VERIFICATION', async (ctx) => {
    if (!isDbConnected) {
      ctx.skip();
      return;
    }
    const context = {
      tenantId: registeredTenantId,
      userId: registeredUserId,
      role: 'OWNER',
      isSuperAdmin: false,
    };

    const docInput = {
      documentType: 'NIB' as const,
      documentNumber: '0123456789012',
      fileStorageKey: `kyb/${registeredTenantId}/NIB_sample.pdf`,
      fileMimeType: 'application/pdf' as const,
      fileSizeBytes: 1420580,
    };

    const document = await TenantService.submitKybDocument(context, docInput);

    expect(document.id).toBeDefined();
    expect(document.tenantId).toBe(registeredTenantId);
    expect(document.documentType).toBe('NIB');
    expect(document.documentNumber).toBe('0123456789012');
    expect(document.status).toBe('PENDING_VERIFICATION');

    const docs = await TenantService.getTenantKybDocuments(context);
    expect(docs.length).toBeGreaterThanOrEqual(1);
    expect(docs[0]?.documentType).toBe('NIB');
  });
});
