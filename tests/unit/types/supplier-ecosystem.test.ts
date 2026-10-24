/**
 * @file tests/unit/types/supplier-ecosystem.test.ts
 * @description Unit tests validating domain types and Zod schemas for the One-Stop Food Supplier Ecosystem.
 * Complies with Constitution Principles II and XIII.
 */

import { describe, it, expect } from 'vitest';
import {
  SupplierProfileSchema,
  SupplierProductSchema,
  B2BReviewSchema,
} from '@pasok/domain';

describe('One-Stop Food Supplier Ecosystem - Zod Schemas', () => {
  it('berhasil memvalidasi entitas SupplierProfileSchema lengkap', () => {
    const validProfile = {
      tenantId: '11111111-1111-4111-a111-111111111111',
      businessName: 'Peternakan Unggas Berkah Turi',
      category: 'LIVESTOCK_FARM' as const,
      fulfillmentModel: 'DIRECT_DISPATCH' as const,
      hasColdChain: true,
      certifications: [
        { name: 'NKV Level 1', number: 'NKV-3404-U-012' },
        { name: 'Halal BPJPH', number: 'ID3411000089201' },
      ],
      ratingAvg: 4.95,
      reviewCount: 38,
      bio: 'Pusat budidaya ayam broiler higienis Sleman.',
      regency: 'Sleman',
      minimumOrderRp: 500000,
    };

    const parsed = SupplierProfileSchema.safeParse(validProfile);
    expect(parsed.success).toBe(true);
  });

  it('berhasil memvalidasi entitas etalase SupplierProductSchema', () => {
    const validProduct = {
      id: '22222222-2222-4222-a222-222222222222',
      supplierTenantId: '11111111-1111-4111-a111-111111111111',
      supplierName: 'Peternakan Unggas Berkah Turi',
      name: 'Daging Ayam Broiler Karkas Utuh',
      category: 'Unggas & Telur',
      skuCode: 'AYAM-KARKAS-01',
      unit: 'ekor',
      price: 36000,
      minOrderQty: 10,
      stockAvailable: 250,
      leadTimeHours: 12,
      isReadyStock: true,
      fulfillmentType: 'DIRECT_DISPATCH' as const,
      description: 'Ayam broiler potong subuh suhu chiller 4C.',
      hasColdChainRequirement: true,
      certificationsSummary: ['NKV-1', 'Halal'],
    };

    const parsed = SupplierProductSchema.safeParse(validProduct);
    expect(parsed.success).toBe(true);
  });

  it('menolak SupplierProductSchema jika harga bernilai negatif atau nol', () => {
    const invalidProduct = {
      id: '22222222-2222-4222-a222-222222222222',
      supplierTenantId: '11111111-1111-4111-a111-111111111111',
      supplierName: 'Peternakan Unggas Berkah Turi',
      name: 'Daging Ayam Broiler Karkas Utuh',
      category: 'Unggas & Telur',
      skuCode: 'AYAM-KARKAS-01',
      unit: 'ekor',
      price: -100,
      minOrderQty: 10,
      stockAvailable: 250,
      leadTimeHours: 12,
      isReadyStock: true,
      fulfillmentType: 'DIRECT_DISPATCH' as const,
      description: 'Ayam broiler potong subuh.',
    };

    const parsed = SupplierProductSchema.safeParse(invalidProduct);
    expect(parsed.success).toBe(false);
  });

  it('berhasil memvalidasi entitas review dua arah B2BReviewSchema', () => {
    const validReview = {
      id: '33333333-3333-4333-a333-333333333333',
      fromTenantId: '44444444-4444-4444-a444-444444444444',
      fromBusinessName: 'Kopi Klotok Heritage',
      fromBusinessType: 'HOREKA' as const,
      toTenantId: '11111111-1111-4111-a111-111111111111',
      toBusinessName: 'Peternakan Unggas Berkah Turi',
      direction: 'BUYER_TO_SUPPLIER' as const,
      rating: 5,
      qualityScore: 5,
      punctualityScore: 5,
      comment: 'Karkas segar, pengiriman tepat waktu pukul 05:00 subuh.',
      tags: ['Suhu Chiller Terjaga', 'Tepat Waktu'],
      orderReference: 'PO-20261011-001',
      createdAt: '2026-10-11T07:30:00Z',
    };

    const parsed = B2BReviewSchema.safeParse(validReview);
    expect(parsed.success).toBe(true);
  });
});
