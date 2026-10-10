import { describe, it, expect } from 'vitest';
import { AuditKybPendingQuerySchema, PaginatedAuditKybResponseSchema } from '../../../apps/web/src/lib/validations/kyb-audit-schemas';

describe('Contract: Admin KYB Pending Queue API (T030 - kyb-api-contract.md)', () => {
  it('berhasil memvalidasi query params default dan kustom untuk paginasi antrean audit', () => {
    const defaultQuery = AuditKybPendingQuerySchema.parse({});
    expect(defaultQuery.page).toBe(1);
    expect(defaultQuery.limit).toBe(25);
    expect(defaultQuery.status).toBe('PENDING_VERIFICATION');

    const customQuery = AuditKybPendingQuerySchema.parse({
      page: '2',
      limit: '50',
      status: 'PENDING_VERIFICATION',
    });
    expect(customQuery.page).toBe(2);
    expect(customQuery.limit).toBe(50);
  });

  it('menolak limit yang melebihi batas maksimum 100 (Prinsip IX Konstitusi)', () => {
    const invalidQuery = {
      page: '1',
      limit: '150',
    };
    const result = AuditKybPendingQuerySchema.safeParse(invalidQuery);
    expect(result.success).toBe(false);
  });

  it('berhasil memvalidasi kontrak payload respon antrean audit terpaginasi', () => {
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            tenantId: '123e4567-e89b-12d3-a456-426614174000',
            businessName: 'Warung Kopi Mataram Baru',
            tenantType: 'HOREKA_BUYER',
            regency: 'SLEMAN',
            kybStatus: 'PENDING_VERIFICATION',
            submittedAt: '2026-10-08T03:40:00.000Z',
            owner: {
              fullName: 'Budi Santoso',
              email: 'budi@kopimataram.id',
              phoneNumber: '081234567890',
            },
            documentsCount: 2,
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          limit: 25,
        },
      },
    };

    const parsed = PaginatedAuditKybResponseSchema.safeParse(mockResponse);
    expect(parsed.success).toBe(true);
  });
});
