/**
 * @file src/config/storage.ts
 * @description Konfigurasi Appwrite Storage dan kebijakan unggahan berkas.
 * Mematuhi Prinsip VIII.2 dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const storageConfigSchema = z.object({
  endpoint: z.string().url(),
  projectId: z.string().min(1),
  apiKey: z.string().min(1),
  bucketId: z.string().min(1),
  maxFileSizeBytes: z.number().int().positive().default(5 * 1024 * 1024),
  allowedMimeTypes: z.array(z.string()).nonempty(),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

export const storageConfig: StorageConfig = storageConfigSchema.parse({
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || 'demo-project-id',
  apiKey: process.env.APPWRITE_API_KEY || 'demo-api-key',
  bucketId: process.env.APPWRITE_BUCKET_ID || 'demo-bucket',
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'image/webp',
    'image/jpeg',
    'image/png',
  ],
});
