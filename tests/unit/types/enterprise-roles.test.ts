import { describe, it, expect } from 'vitest';
import {
  asHubId,
  asOperatorId,
  asUserId,
  isMacroRole,
  isMicroRole,
  HubOperatorEntity,
  ActivationToken,
} from '@pasok/domain';

/**
 * Suite pengujian unit untuk Branded Types dan Domain Entities Enterprise.
 * Memvalidasi kepatuhan terhadap Konstitusi Prinsip II, III, dan XIII.
 */
describe('Enterprise Roles & Invariants (Prinsip XIII Konstitusi)', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const validAdminUuid = '987e6543-e89b-12d3-a456-426614174111';
  const invalidUuid = 'bukan-uuid-resmi';

  it('berhasil memvalidasi HubId dan melempar error pada string invalid', () => {
    const hubId = asHubId('hub-bantul-01');
    expect(hubId).toBe('hub-bantul-01');

    expect(() => asHubId('')).toThrow(TypeError);
    expect(() => asHubId('x')).toThrow(TypeError);
  });

  it('berhasil memvalidasi OperatorId dan melempar error pada string invalid', () => {
    const operatorId = asOperatorId(validUuid);
    expect(operatorId).toBe(validUuid);

    expect(() => asOperatorId(invalidUuid)).toThrow(TypeError);
  });

  it('memvalidasi macro roles dan menolak peran tidak dikenal', () => {
    expect(isMacroRole('HOREKA')).toBe(true);
    expect(isMacroRole('GAPOKTAN')).toBe(true);
    expect(isMacroRole('HUB_OPERATOR')).toBe(true);
    expect(isMacroRole('SUPER_ADMIN')).toBe(true);
    expect(isMacroRole('RESELLER')).toBe(false);
    expect(isMacroRole(null)).toBe(false);
  });

  it('memvalidasi micro roles RBAC sesuai matriks wewenang', () => {
    expect(isMicroRole('OWNER')).toBe(true);
    expect(isMicroRole('FINANCE')).toBe(true);
    expect(isMicroRole('HEAD_CHEF')).toBe(true);
    expect(isMicroRole('PURCHASING')).toBe(true);
    expect(isMicroRole('CHAIRPERSON')).toBe(true);
    expect(isMicroRole('FIELD_OPERATOR')).toBe(true);
    expect(isMicroRole('OPERATOR_QC')).toBe(true);
    expect(isMicroRole('SUPERVISOR_HUB')).toBe(true);
    expect(isMicroRole('SUPER_ADMIN')).toBe(true);
    expect(isMicroRole('STAFF_BIASA')).toBe(false);
  });

  it('memvalidasi Value Object ActivationToken dengan proteksi kedaluwarsa', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = new ActivationToken('hash-sha256-kripto-12345', futureDate);

    expect(token.tokenHash).toBe('hash-sha256-kripto-12345');
    expect(token.isExpired()).toBe(false);

    const pastDate = new Date(Date.now() - 1000);
    expect(() => new ActivationToken('token-lama', pastDate)).toThrow();
    expect(() => new ActivationToken('', futureDate)).toThrow();
  });

  it('mengelola siklus hidup entitas HubOperatorEntity dan penegakan batas fasilitas fisik', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const activationToken = new ActivationToken('hash-sha256', futureDate);

    const operator = new HubOperatorEntity({
      id: asOperatorId(validUuid),
      userId: asUserId(validUuid),
      assignedHubId: asHubId('hub-bantul-01'),
      microRole: 'OPERATOR_QC',
      status: 'PENDING_ACTIVATION',
      activationToken,
      issuedByAdminId: asUserId(validAdminUuid),
    });

    expect(operator.status).toBe('PENDING_ACTIVATION');
    expect(operator.canOperateAtHub(asHubId('hub-bantul-01'))).toBe(false);

    operator.activate();
    expect(operator.status).toBe('ACTIVE');
    expect(operator.canOperateAtHub(asHubId('hub-bantul-01'))).toBe(true);
    expect(operator.canOperateAtHub(asHubId('hub-sleman-01'))).toBe(false);

    operator.revoke();
    expect(operator.status).toBe('REVOKED');
    expect(operator.canOperateAtHub(asHubId('hub-bantul-01'))).toBe(false);
  });
});
