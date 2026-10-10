/**
 * @file src/lib/storage.ts
 * @description Klien integrasi MinIO Object Storage (S3-compatible) untuk pembuatan Presigned Upload & Download URLs.
 * Memvalidasi batas ukuran 5 MB dan tipe berkas aman (PDF & WebP) berbasis konfigurasi.
 * Mematuhi Prinsip VIII.2 dan IX Konstitusi PasokMataram v1.5.0.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageConfig, kybRulesConfig } from '../config';
import crypto from 'crypto';
import path from 'path';

export const s3Client = new S3Client({
  endpoint: storageConfig.endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: storageConfig.accessKey,
    secretAccessKey: storageConfig.secretKey,
  },
  forcePathStyle: true,
});

const ALLOWED_MIME_TYPES = new Set<string>(kybRulesConfig.allowedMimeTypes);
const MAX_FILE_SIZE_BYTES = kybRulesConfig.maxFileSizeBytes;

export interface PresignedUploadResult {
  readonly uploadUrl: string;
  readonly fileStorageKey: string;
  readonly expiresInSeconds: number;
}

/**
 * Menghasilkan presigned URL untuk pengunggahan berkas KYB langsung ke MinIO oleh browser klien.
 */
export async function generatePresignedUploadUrl(
  tenantId: string,
  documentType: string,
  fileName: string,
  mimeType: string,
  fileSizeBytes: number
): Promise<PresignedUploadResult> {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Format berkas "${mimeType}" tidak didukung. Harap unggah PDF atau WebP/JPEG.`);
  }

  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Ukuran berkas (${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB) melebihi batas maksimal 5 MB.`);
  }

  const fileExt = path.extname(fileName) || (mimeType === 'application/pdf' ? '.pdf' : '.webp');
  const safeRandomId = crypto.randomBytes(8).toString('hex');
  const fileStorageKey = `kyb/${tenantId}/${documentType}_${safeRandomId}${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: storageConfig.bucketPrivate,
    Key: fileStorageKey,
    ContentType: mimeType,
    ContentLength: fileSizeBytes,
  });

  const expiresInSeconds = storageConfig.presignedUrlExpirySeconds;
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    fileStorageKey,
    expiresInSeconds,
  };
}

/**
 * Menghasilkan presigned URL berbatas waktu untuk melihat pratinjau dokumen privat oleh admin.
 */
export async function generatePresignedDownloadUrl(
  fileStorageKey: string,
  expiresInSeconds = 1800
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: storageConfig.bucketPrivate,
    Key: fileStorageKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
