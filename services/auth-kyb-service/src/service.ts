/**
 * Identity & KYB Service adopting Eager Bootstrap and Lazy Storage Presigner patterns.
 */

import { v2 as cloudinary } from 'cloudinary';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { storageConfig, authConfig, appConfig } from '@pasok/config';
import { lazyAsync, type TenantId, type SecurityContext } from '@pasok/domain';
import { pool } from '@pasok/database';

/**
 * Lazy Cloudinary client initializer: defers connection until first upload.
 */
export const getStorageClient = lazyAsync(async () => {
  cloudinary.config({
    cloud_name: storageConfig.cloudName,
    api_key: storageConfig.apiKey,
    api_secret: storageConfig.apiSecret,
    secure: true,
  });
  return cloudinary;
});

/**
 * Eager bootstrap verification to ensure database and configuration readiness on startup.
 */
export async function bootstrapAuthService(): Promise<{ ready: boolean; latencyMs: number }> {
  const start = Date.now();
  if (!authConfig.jwtSecret || !appConfig.appName) {
    throw new Error('Konfigurasi autentikasi tidak lengkap saat inisialisasi eager.');
  }

  try {
    const connection = await pool.getConnection();
    connection.release();
    return { ready: true, latencyMs: Date.now() - start };
  } catch {
    return { ready: false, latencyMs: Date.now() - start };
  }
}

/**
 * Generates Cloudinary signed upload URL with automatic watermark overlay.
 */
export async function generateKybUploadUrl(
  tenantId: TenantId,
  documentType: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; storageKey: string }> {
  const client = await getStorageClient();
  const fileExtension = fileName.split('.').pop() || 'webp';
  const storageKey = `tenants/${tenantId}/kyb/${documentType.toLowerCase()}_${Date.now()}`;

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `tenants/${tenantId}/kyb`,
      public_id: storageKey,
      resource_type: 'image',
    },
    storageConfig.apiSecret
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${storageConfig.cloudName}/image/upload?timestamp=${timestamp}&signature=${signature}&folder=tenants/${tenantId}/kyb&public_id=${storageKey}`;

  return { uploadUrl, storageKey };
}

/**
 * Issues JWT session token for verified or onboarding user.
 */
export function createSessionToken(context: SecurityContext): string {
  const sessionTtlSeconds = authConfig.sessionExpiryDays * 24 * 60 * 60;
  return jwt.sign(
    {
      tenantId: context.tenantId,
      userId: context.userId,
      role: context.role,
      isSuperAdmin: context.isSuperAdmin,
    },
    authConfig.jwtSecret,
    {
      expiresIn: `${sessionTtlSeconds}s`,
    }
  );
}

/**
 * Hashes password using Argon2id algorithm.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: authConfig.argon2MemoryCost,
    timeCost: authConfig.argon2TimeCost,
    parallelism: authConfig.argon2Parallelism,
  });
}
