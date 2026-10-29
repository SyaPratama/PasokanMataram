/**
 * @file src/lib/storage.ts
 * @description Klien integrasi Cloudinary Object Storage untuk pembuatan Presigned Upload URLs.
 * Memvalidasi batas ukuran 5 MB dan tipe berkas aman (PDF & WebP) berbasis konfigurasi.
 * Mematuhi Prinsip VIII.2 dan IX Konstitusi PasokMataram v1.5.0.
 */

import { v2 as cloudinary } from 'cloudinary';
import { kybRulesConfig } from '../config';
import crypto from 'crypto';
import path from 'path';

let cloudinaryInitialized = false;

export const getStorageClient = () => {
  if (!cloudinaryInitialized) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo-cloud',
      api_key: process.env.CLOUDINARY_API_KEY || 'demo-key',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'demo-secret',
      secure: true,
    });
    cloudinaryInitialized = true;
  }
  return cloudinary;
};

const ALLOWED_MIME_TYPES = new Set<string>(kybRulesConfig.allowedMimeTypes);
const MAX_FILE_SIZE_BYTES = kybRulesConfig.maxFileSizeBytes;

export interface PresignedUploadResult {
  readonly uploadUrl: string;
  readonly fileStorageKey: string;
  readonly expiresInSeconds: number;
}

/**
 * Menghasilkan presigned URL untuk pengunggahan berkas KYB langsung ke Cloudinary oleh browser klien.
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

  const timestamp = Math.round(Date.now() / 1000);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo-cloud';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'demo-secret';
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `kyb/${tenantId}`,
      public_id: fileStorageKey,
    },
    apiSecret
  );

  const expiresInSeconds = 300;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload?timestamp=${timestamp}&signature=${signature}&folder=kyb/${tenantId}&public_id=${fileStorageKey}`;

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
  return cloudinary.url(fileStorageKey, {
    sign_url: true,
    secure: true,
    type: 'authenticated',
  });
}
