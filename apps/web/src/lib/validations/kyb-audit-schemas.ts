import { z } from 'zod';
import { paginationConfig } from '@pasok/config';

export const AuditKybPendingQuerySchema = z.object({
  status: z.enum(['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']).default('PENDING_VERIFICATION'),
  page: z.coerce.number().int().positive().default(paginationConfig.defaultPage),
  limit: z.coerce.number().int().positive().max(paginationConfig.maxLimit).default(paginationConfig.defaultLimit),
});

export type AuditKybPendingQuery = z.infer<typeof AuditKybPendingQuerySchema>;

export const AuditKybItemSchema = z.object({
  tenantId: z.string().uuid(),
  businessName: z.string().min(1),
  tenantType: z.enum(['HOREKA_BUYER', 'GAPOKTAN_SUPPLIER']),
  regency: z.enum(['SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA']),
  kybStatus: z.enum(['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']),
  submittedAt: z.string(),
  owner: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
  }),
  documentsCount: z.number().int().nonnegative(),
});

export const PaginatedAuditKybResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(AuditKybItemSchema),
    pagination: z.object({
      currentPage: z.number().int().positive(),
      totalPages: z.number().int().nonnegative(),
      totalItems: z.number().int().nonnegative(),
      limit: z.number().int().positive(),
    }),
  }),
});

export const AuditKybReviewSchema = z.discriminatedUnion('decision', [
  z.object({
    tenantId: z.string().uuid(),
    decision: z.literal('APPROVED'),
  }),
  z.object({
    tenantId: z.string().uuid(),
    decision: z.literal('REJECTED'),
    rejectionReason: z.string().min(5, 'Alasan penolakan minimal 5 karakter.'),
  }),
]);

export type AuditKybReviewInput = z.infer<typeof AuditKybReviewSchema>;

export const AuditKybReviewResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tenantId: z.string().uuid(),
    kybStatus: z.enum(['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']),
    verifiedAt: z.string(),
  }),
  message: z.string(),
});
