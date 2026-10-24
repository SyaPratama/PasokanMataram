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
export const MlDataIngestPayloadSchema = z.object({
  forceRefresh: z.boolean().optional(),
  source: z.enum(['ALL', 'BAPANAS', 'PIHPS', 'PASAR_LELANG', 'BMKG']).optional().default('ALL'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const MlModelTrainPayloadSchema = z.object({
  commodityIds: z.array(z.string().uuid()).optional(),
  horizonDays: z.number().int().positive().optional().default(90),
  algorithm: z.string().optional().default('PasokML-Ensemble-v1'),
});

export const MlForecastPublishPayloadSchema = z.object({
  generatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  invalidateCache: z.boolean().optional().default(true),
});


export const QueueJobRegistry = {
  'kyb.document.uploaded': KybUploadedPayloadSchema,
  'kyb.status.changed': KybStatusChangedPayloadSchema,
  'notification.welcome.email': WelcomeEmailPayloadSchema,
  'ml.data.ingest.daily': MlDataIngestPayloadSchema,
  'ml.model.train.periodic': MlModelTrainPayloadSchema,
  'ml.forecast.publish.daily': MlForecastPublishPayloadSchema,
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
