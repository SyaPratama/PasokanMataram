/**
 * @file src/config/storage.ts
 * @description Konfigurasi Cloudinary Object Storage dan kebijakan unggahan berkas.
 * Mematuhi Prinsip VIII.2 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const storageConfigSchema = z.object({
  cloudName: z.string().min(1),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  presignedUrlExpirySeconds: z.number().int().positive().default(300),
  maxFileSizeBytes: z.number().int().positive().default(5 * 1024 * 1024),
  allowedMimeTypes: z.array(z.string()).nonempty(),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export const storageConfig: StorageConfig = storageConfigSchema.parse({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'demo-cloud',
  apiKey: process.env.CLOUDINARY_API_KEY || 'demo-key',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'demo-secret',
  presignedUrlExpirySeconds: 300,
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'image/webp',
    'image/jpeg',
    'image/png',
  ],
});
