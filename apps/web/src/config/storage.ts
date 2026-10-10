/**
 * @file src/config/storage.ts
 * @description Konfigurasi MinIO Object Storage dan kebijakan unggahan berkas.
 * Mematuhi Prinsip VIII.2 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const storageConfigSchema = z.object({
  endpoint: z.string().url(),
  port: z.coerce.number().int().default(9000),
  useSSL: z.boolean().default(false),
  accessKey: z.string().min(1),
  secretKey: z.string().min(1),
  bucketPrivate: z.string().min(1),
  presignedUrlExpirySeconds: z.number().int().positive().default(300),
  maxFileSizeBytes: z.number().int().positive().default(5 * 1024 * 1024),
  allowedMimeTypes: z.array(z.string()).nonempty(),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export const storageConfig: StorageConfig = storageConfigSchema.parse({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucketPrivate: process.env.MINIO_BUCKET_PRIVATE || 'kyb-documents-private',
  presignedUrlExpirySeconds: 300,
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'image/webp',
    'image/jpeg',
    'image/png',
  ],
});
