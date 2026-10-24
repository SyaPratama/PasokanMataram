/**
 * @file packages/domain/src/types/supplier-ecosystem.ts
 * @description Domain types and Zod schemas for the One-Stop B2B Local Food Supplier Ecosystem in D.I. Yogyakarta.
 * Covers Supplier Profiles, Multi-SKU Etalase, and Bidirectional B2B Trust Reviews.
 * Complies with Constitution Principles II, III, and XIII.
 */

import { z } from 'zod';

export type SupplierCategory =
  | 'FARMER_GROUP'
  | 'LIVESTOCK_FARM'
  | 'MEAT_PROCESSOR'
  | 'DAIRY_COOPERATIVE'
  | 'FOOD_DISTRIBUTOR'
  | 'ARTISANAL_PRODUCER';

export type FulfillmentModel = 'POOL_GROUP_BUYING' | 'DIRECT_DISPATCH' | 'CROSS_DOCK';

export type B2bReviewDirection = 'BUYER_TO_SUPPLIER' | 'SUPPLIER_TO_BUYER';

export const CertificationItemSchema = z.object({
  name: z.string().min(1),
  number: z.string().min(1),
  issuer: z.string().optional(),
  validUntil: z.string().optional(),
});

export type CertificationItem = z.infer<typeof CertificationItemSchema>;

export const SupplierProfileSchema = z.object({
  tenantId: z.string().uuid(),
  businessName: z.string().min(1),
  category: z.enum([
    'FARMER_GROUP',
    'LIVESTOCK_FARM',
    'MEAT_PROCESSOR',
    'DAIRY_COOPERATIVE',
    'FOOD_DISTRIBUTOR',
    'ARTISANAL_PRODUCER',
  ]),
  fulfillmentModel: z.enum(['POOL_GROUP_BUYING', 'DIRECT_DISPATCH', 'CROSS_DOCK']),
  hasColdChain: z.boolean(),
  certifications: z.array(CertificationItemSchema),
  ratingAvg: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  bio: z.string(),
  regency: z.string(),
  minimumOrderRp: z.number().nonnegative(),
});

export type SupplierProfile = z.infer<typeof SupplierProfileSchema>;

export const SupplierProductSchema = z.object({
  id: z.string().uuid(),
  supplierTenantId: z.string().uuid(),
  supplierName: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  skuCode: z.string().min(1),
  unit: z.string().min(1),
  price: z.number().positive(),
  minOrderQty: z.number().positive(),
  stockAvailable: z.number().nonnegative(),
  leadTimeHours: z.number().int().positive(),
  isReadyStock: z.boolean(),
  fulfillmentType: z.enum(['POOL_GROUP_BUYING', 'DIRECT_DISPATCH', 'CROSS_DOCK']),
  description: z.string(),
  hasColdChainRequirement: z.boolean().default(false),
  certificationsSummary: z.array(z.string()).default([]),
});

export type SupplierProduct = z.infer<typeof SupplierProductSchema>;

export const B2BReviewSchema = z.object({
  id: z.string().uuid(),
  fromTenantId: z.string().uuid(),
  fromBusinessName: z.string().min(1),
  fromBusinessType: z.enum(['HOREKA', 'SUPPLIER']),
  toTenantId: z.string().uuid(),
  toBusinessName: z.string().min(1),
  direction: z.enum(['BUYER_TO_SUPPLIER', 'SUPPLIER_TO_BUYER']),
  rating: z.number().int().min(1).max(5),
  qualityScore: z.number().int().min(1).max(5).optional(),
  punctualityScore: z.number().int().min(1).max(5).optional(),
  paymentSpeedScore: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(3),
  tags: z.array(z.string()),
  orderReference: z.string().optional(),
  createdAt: z.string(),
});

export type B2BReview = z.infer<typeof B2BReviewSchema>;
