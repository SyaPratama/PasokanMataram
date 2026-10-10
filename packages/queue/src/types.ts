/**
 * Queue contracts and job payload schemas with eager schema definitions.
 */

import { z } from 'zod';

export const KybUploadedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  documentId: z.string().uuid(),
  documentType: z.enum(['NIB', 'KTP', 'SURAT_KETERANGAN_TANI', 'NPWP']),
  storageKey: z.string().min(1),
  uploadedAt: z.string().datetime(),
});

export const KybStatusChangedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  previousStatus: z.enum(['UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']),
  newStatus: z.enum(['UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']),
  rejectionReason: z.string().nullable().optional(),
  auditedBy: z.string().uuid().nullable().optional(),
  timestamp: z.string().datetime(),
});

export const WelcomeEmailPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
});

export const QueueJobRegistry = {
  'kyb.document.uploaded': KybUploadedPayloadSchema,
  'kyb.status.changed': KybStatusChangedPayloadSchema,
  'notification.welcome.email': WelcomeEmailPayloadSchema,
} as const;

export type QueueName = keyof typeof QueueJobRegistry;

export type JobPayload<Q extends QueueName> = z.infer<(typeof QueueJobRegistry)[Q]>;

export interface QueueJob<Q extends QueueName = QueueName> {
  id: string;
  queue: Q;
  payload: JobPayload<Q>;
  attempts: number;
  createdAt: number;
}
