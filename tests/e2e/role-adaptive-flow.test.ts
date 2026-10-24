import { describe, it, expect } from 'vitest';
import {
  canAccessFinancials,
  canAccessKitchenCOGS,
  canRequestPoolAllocation,
  canOperateQcHub,
  canAuthorizeVariance,
  resolveUserHomeRoute,
  isRouteAllowedForRole,
} from '@pasok/security';
import { createHubOperatorAction } from '../../apps/web/src/app/actions/operator-actions';
import { POST as registerHandler } from '../../apps/web/src/app/api/v1/auth/register/route';

/**
 * Suite pengujian End-to-End untuk Alur Multi-Role Adaptive & Autentikasi Enterprise.
 * Memvalidasi kepatuhan terhadap Konstitusi Prinsip XIII, FR-017 s/d FR-023, SC-006, dan SC-007.
 */
describe('E2E: Role-Adaptive Flow, Closed Logistics & Quick Demo Switching', () => {
  it('memvalidasi 4 profil Quick Demo Switcher dan target pengalihan rute (SC-006)', () => {
    const chefRoute = resolveUserHomeRoute('HOREKA');
    const farmerRoute = resolveUserHomeRoute('GAPOKTAN');
    const hubRoute = resolveUserHomeRoute('HUB_OPERATOR');
    const adminRoute = resolveUserHomeRoute('SUPER_ADMIN');

    expect(chefRoute).toBe('/buyer/dashboard');
    expect(farmerRoute).toBe('/supplier/dashboard');
    expect(hubRoute).toBe('/hub/inbound');
    expect(adminRoute).toBe('/admin/tenants');
  });

  it('menegakkan penyembunyian total metrik finansial untuk peran Head Chef (SC-007)', () => {
    expect(canAccessFinancials('HEAD_CHEF')).toBe(false);
    expect(canAccessFinancials('PURCHASING')).toBe(false);

    expect(canAccessKitchenCOGS('HEAD_CHEF')).toBe(true);
    expect(canRequestPoolAllocation('HEAD_CHEF')).toBe(true);

    expect(canAccessFinancials('OWNER')).toBe(true);
    expect(canAccessFinancials('FINANCE')).toBe(true);
  });

  it('menerbitkan akun operator hub logistik tertutup dengan token 24 jam (FR-020)', async () => {
    const operatorPayload = {
      fullName: 'Slamet Raharjo QC',
      email: 'slamet.qc@hub-bantul.pasok.id',
      phoneNumber: '081298765432',
      assignedHubId: 'hub-bantul-01',
      microRole: 'OPERATOR_QC' as const,
    };

    const actionResult = await createHubOperatorAction(operatorPayload);

    expect(actionResult.success).toBe(true);
    expect(actionResult.data).toBeDefined();
    expect(actionResult.data?.assignedHubId).toBe('hub-bantul-01');
    expect(actionResult.data?.microRole).toBe('OPERATOR_QC');
    expect(actionResult.data?.activationUrl).toContain('/auth/activate?token=');

    const expiresTimestamp = new Date(actionResult.data?.expiresAt || '').getTime();
    const currentTimestamp = Date.now();
    const diffHours = (expiresTimestamp - currentTimestamp) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(23);
    expect(diffHours).toBeLessThanOrEqual(24.5);
  });

  it('menolak registrasi publik untuk peran HUB_OPERATOR dan SUPER_ADMIN (FR-019)', async () => {
    const operatorRequest = new Request('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Fasilitas Hub Liar',
        tenantType: 'HUB_OPERATOR',
        email: 'operator.ilegal@pasok.id',
      }),
    });

    const opResponse = await registerHandler(operatorRequest);
    expect(opResponse.status).toBe(403);

    const adminRequest = new Request('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Admin Liar',
        macroRole: 'SUPER_ADMIN',
        email: 'admin.ilegal@pasok.id',
      }),
    });

    const adminResponse = await registerHandler(adminRequest);
    expect(adminResponse.status).toBe(403);
  });

  it('mencegah akses silang portal dan mengizinkan rute sesuai hak peran (FR-017, FR-018)', () => {
    expect(isRouteAllowedForRole('/admin/tenants', 'HOREKA', 'HEAD_CHEF')).toBe(false);
    expect(isRouteAllowedForRole('/admin/logistics/operators', 'GAPOKTAN', 'CHAIRPERSON')).toBe(false);
    expect(isRouteAllowedForRole('/hub/inbound', 'HOREKA', 'OWNER')).toBe(false);
    expect(isRouteAllowedForRole('/supplier/dashboard', 'HOREKA', 'HEAD_CHEF')).toBe(false);

    expect(isRouteAllowedForRole('/buyer/dashboard', 'HOREKA', 'HEAD_CHEF')).toBe(true);
    expect(isRouteAllowedForRole('/supplier/dashboard', 'GAPOKTAN', 'CHAIRPERSON')).toBe(true);
    expect(isRouteAllowedForRole('/hub/inbound', 'HUB_OPERATOR', 'OPERATOR_QC')).toBe(true);
    expect(isRouteAllowedForRole('/admin/tenants', 'SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
  });

  it('memvalidasi batasan wewenang inspeksi QC dan otorisasi selisih timbangan >5%', () => {
    expect(canOperateQcHub('OPERATOR_QC')).toBe(true);
    expect(canOperateQcHub('SUPERVISOR_HUB')).toBe(true);
    expect(canOperateQcHub('HEAD_CHEF')).toBe(false);

    expect(canAuthorizeVariance('SUPERVISOR_HUB')).toBe(true);
    expect(canAuthorizeVariance('SUPER_ADMIN')).toBe(true);
    expect(canAuthorizeVariance('OPERATOR_QC')).toBe(false);
  });
});
