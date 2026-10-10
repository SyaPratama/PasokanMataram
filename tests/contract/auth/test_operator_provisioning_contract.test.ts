import { describe, it, expect } from 'vitest';
import {
  createHubOperatorSchema,
  activateOperatorSchema,
} from '../../../apps/web/src/lib/validations/operator-schemas';
import { createHubOperatorAction } from '../../../apps/web/src/app/actions/operator-actions';
import { POST as registerRouteHandler } from '../../../apps/web/src/app/api/v1/auth/register/route';

/**
 * Suite pengujian kontrak untuk penerbitan operator hub logistik tertutup dan penolakan jalur publik.
 * Memvalidasi kepatuhan terhadap Konstitusi Prinsip XIII, FR-019, dan FR-020.
 */
describe('Contract: Closed Logistics Provisioning & Public Registration Guard (FR-019, FR-020)', () => {
  it('berhasil memvalidasi skema data penerbitan operator hub logistik', () => {
    const validPayload = {
      fullName: 'Ahmad Suroso',
      email: 'ahmad.qc@hub-bantul.pasok.id',
      phoneNumber: '081234567890',
      assignedHubId: 'hub-bantul-01',
      microRole: 'OPERATOR_QC' as const,
    };

    const result = createHubOperatorSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('menolak skema operator jika peran bukan wewenang logistik yang diizinkan', () => {
    const invalidPayload = {
      fullName: 'Operator Tidak Sah',
      email: 'operator@hub.id',
      phoneNumber: '081234567890',
      assignedHubId: 'hub-bantul-01',
      microRole: 'HEAD_CHEF' as unknown,
    };

    const result = createHubOperatorSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('memvalidasi skema aktivasi mandiri dengan kata sandi berstandar keamanan', () => {
    const validActivation = {
      token: 'a'.repeat(32),
      password: 'KataSandiKuat2026!',
    };

    const result = activateOperatorSchema.safeParse(validActivation);
    expect(result.success).toBe(true);

    const weakActivation = {
      token: 'a'.repeat(32),
      password: 'lemah',
    };
    expect(activateOperatorSchema.safeParse(weakActivation).success).toBe(false);
  });

  it('menjalankan createHubOperatorAction dan menghasilkan token kriptografis 24 jam', async () => {
    const actionInput = {
      fullName: 'Bambang QC Specialist',
      email: 'bambang.qc@pasok.id',
      phoneNumber: '081987654321',
      assignedHubId: 'hub-sentolo-01',
      microRole: 'OPERATOR_QC' as const,
    };

    const result = await createHubOperatorAction(actionInput);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.activationToken.length).toBeGreaterThanOrEqual(32);
    expect(result.data?.activationUrl).toContain('/auth/activate?token=');
    expect(result.data?.assignedHubId).toBe('hub-sentolo-01');
  });

  it('menolak registrasi publik untuk peran HUB_OPERATOR dengan status 403 Forbidden (FR-019)', async () => {
    const mockRequest = new Request('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Fasilitas Hub Terbuka Ilegal',
        tenantType: 'HUB_OPERATOR',
        email: 'operator.hacker@hub.id',
      }),
    });

    const response = await registerRouteHandler(mockRequest);
    expect(response.status).toBe(403);

    const responseBody = await response.json();
    expect(responseBody.error?.code).toBe('CLOSED_REGISTRATION_ROLE');
  });

  it('menolak registrasi publik untuk peran SUPER_ADMIN dengan status 403 Forbidden (FR-019)', async () => {
    const mockRequest = new Request('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Super Admin Liar',
        macroRole: 'SUPER_ADMIN',
        email: 'admin.liar@super.id',
      }),
    });

    const response = await registerRouteHandler(mockRequest);
    expect(response.status).toBe(403);

    const responseBody = await response.json();
    expect(responseBody.error?.code).toBe('CLOSED_REGISTRATION_ROLE');
  });
});
