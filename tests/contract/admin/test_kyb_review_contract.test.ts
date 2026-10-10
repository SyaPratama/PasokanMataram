import { describe, it, expect } from 'vitest';
import { AuditKybReviewSchema, AuditKybReviewResponseSchema } from '../../../apps/web/src/lib/validations/kyb-audit-schemas';

describe('Contract: Admin KYB Review & Decision API (T031 - kyb-api-contract.md)', () => {
  const validTenantId = '123e4567-e89b-12d3-a456-426614174000';

  it('berhasil memvalidasi payload keputusan persetujuan (APPROVED)', () => {
    const validApproval = {
      tenantId: validTenantId,
      decision: 'APPROVED',
    };
    const result = AuditKybReviewSchema.safeParse(validApproval);
    expect(result.success).toBe(true);
  });

  it('berhasil memvalidasi payload penolakan (REJECTED) dengan alasan penolakan wajib', () => {
    const validRejection = {
      tenantId: validTenantId,
      decision: 'REJECTED',
      rejectionReason: 'Halaman kedua NIB buram dan nomor induk berusaha tidak terbaca.',
    };
    const result = AuditKybReviewSchema.safeParse(validRejection);
    expect(result.success).toBe(true);
  });

  it('menolak payload REJECTED jika alasan penolakan kosong atau terlalu pendek', () => {
    const invalidRejection = {
      tenantId: validTenantId,
      decision: 'REJECTED',
      rejectionReason: '',
    };
    const result = AuditKybReviewSchema.safeParse(invalidRejection);
    expect(result.success).toBe(false);
  });

  it('menolak format tenantId yang bukan UUID valid', () => {
    const invalidTenant = {
      tenantId: 'bukan-uuid',
      decision: 'APPROVED',
    };
    const result = AuditKybReviewSchema.safeParse(invalidTenant);
    expect(result.success).toBe(false);
  });

  it('berhasil memvalidasi respon kontrak hasil keputusan review admin', () => {
    const mockSuccessResponse = {
      success: true,
      data: {
        tenantId: validTenantId,
        kybStatus: 'VERIFIED',
        verifiedAt: '2026-10-08T04:15:00.000Z',
      },
      message: 'Keputusan verifikasi berhasil diperbarui dan notifikasi telah dikirim ke mitra.',
    };
    const parsed = AuditKybReviewResponseSchema.safeParse(mockSuccessResponse);
    expect(parsed.success).toBe(true);
  });
});
