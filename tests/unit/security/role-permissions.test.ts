import { describe, it, expect } from 'vitest';
import {
  canAccessFinancials,
  canAccessKitchenCOGS,
  canRequestPoolAllocation,
  canOperateQcHub,
  canAuthorizeVariance,
  resolveUserHomeRoute,
  isRouteAllowedForRole,
  createSessionToken,
  verifySessionToken,
} from '@pasok/security';
import { hashPassword, verifyPassword } from '@pasok/security/passwords';
import { asTenantId, asUserId, asHubId } from '@pasok/domain';

/**
 * Suite pengujian unit untuk Role-Permission Evaluator dan Token Security.
 * Memvalidasi kepatuhan terhadap Konstitusi Prinsip XIII, FR-017, FR-018, dan SC-006.
 */
describe('Role-Permission & Security Evaluator (FR-017, FR-018)', () => {
  const mockTenantId = asTenantId('123e4567-e89b-12d3-a456-426614174000');
  const mockUserId = asUserId('987e6543-e89b-12d3-a456-426614174111');
  const mockHubId = asHubId('hub-bantul-01');

  it('menyembunyikan wewenang finansial dari peran operasional dapur (Head Chef & Purchasing)', () => {
    expect(canAccessFinancials('HEAD_CHEF')).toBe(false);
    expect(canAccessFinancials('PURCHASING')).toBe(false);
    expect(canAccessFinancials('FIELD_OPERATOR')).toBe(false);
    expect(canAccessFinancials('OPERATOR_QC')).toBe(false);

    expect(canAccessFinancials('OWNER')).toBe(true);
    expect(canAccessFinancials('FINANCE')).toBe(true);
    expect(canAccessFinancials('CHAIRPERSON')).toBe(true);
    expect(canAccessFinancials('SUPER_ADMIN')).toBe(true);
  });

  it('memberikan wewenang resep COGS dan permintaan pool kuota kepada Head Chef dan Owner', () => {
    expect(canAccessKitchenCOGS('HEAD_CHEF')).toBe(true);
    expect(canAccessKitchenCOGS('OWNER')).toBe(true);
    expect(canAccessKitchenCOGS('OPERATOR_QC')).toBe(false);

    expect(canRequestPoolAllocation('HEAD_CHEF')).toBe(true);
    expect(canRequestPoolAllocation('PURCHASING')).toBe(true);
    expect(canRequestPoolAllocation('OWNER')).toBe(true);
    expect(canRequestPoolAllocation('FIELD_OPERATOR')).toBe(false);
  });

  it('membatasi inspeksi QC hub dan otorisasi selisih timbangan >5%', () => {
    expect(canOperateQcHub('OPERATOR_QC')).toBe(true);
    expect(canOperateQcHub('SUPERVISOR_HUB')).toBe(true);
    expect(canOperateQcHub('HEAD_CHEF')).toBe(false);

    expect(canAuthorizeVariance('SUPERVISOR_HUB')).toBe(true);
    expect(canAuthorizeVariance('SUPER_ADMIN')).toBe(true);
    expect(canAuthorizeVariance('OPERATOR_QC')).toBe(false);
  });

  it('menyelesaikan rute portal utama secara deterministik berdasarkan Macro-Role', () => {
    expect(resolveUserHomeRoute('HOREKA')).toBe('/buyer/dashboard');
    expect(resolveUserHomeRoute('GAPOKTAN')).toBe('/supplier/dashboard');
    expect(resolveUserHomeRoute('HUB_OPERATOR')).toBe('/hub/inbound');
    expect(resolveUserHomeRoute('SUPER_ADMIN')).toBe('/admin/tenants');
  });

  it('mencegah akses silang portal dan memvalidasi rute khusus peran', () => {
    expect(isRouteAllowedForRole('/admin/tenants', 'HOREKA', 'OWNER')).toBe(false);
    expect(isRouteAllowedForRole('/admin/logistics/operators', 'GAPOKTAN', 'CHAIRPERSON')).toBe(false);
    expect(isRouteAllowedForRole('/hub/inbound', 'HOREKA', 'HEAD_CHEF')).toBe(false);
    expect(isRouteAllowedForRole('/supplier/dashboard', 'HOREKA', 'OWNER')).toBe(false);

    expect(isRouteAllowedForRole('/buyer/dashboard', 'HOREKA', 'HEAD_CHEF')).toBe(true);
    expect(isRouteAllowedForRole('/supplier/dashboard', 'GAPOKTAN', 'CHAIRPERSON')).toBe(true);
    expect(isRouteAllowedForRole('/hub/inbound', 'HUB_OPERATOR', 'OPERATOR_QC')).toBe(true);
    expect(isRouteAllowedForRole('/admin/tenants', 'SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
  });

  it('menerbitkan dan memverifikasi token JWT dengan enkripsi claims lengkap', () => {
    const claims = {
      userId: mockUserId,
      tenantId: mockTenantId,
      macroRole: 'HOREKA' as const,
      microRole: 'HEAD_CHEF' as const,
      isSuperAdmin: false,
      email: 'chef@baleraos.com',
    };

    const token = createSessionToken(claims);
    expect(typeof token).toBe('string');

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockUserId);
    expect(decoded?.macroRole).toBe('HOREKA');
    expect(decoded?.microRole).toBe('HEAD_CHEF');
  });

  it('melakukan hashing dan verifikasi kata sandi via Argon2id', async () => {
    const rawPass = 'P@sokMataram2026!';
    const hashed = await hashPassword(rawPass);

    expect(hashed).toContain('$argon2id$');
    const isValid = await verifyPassword(hashed, rawPass);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword(hashed, 'SalahKataSandi');
    expect(isWrong).toBe(false);
  });
});
