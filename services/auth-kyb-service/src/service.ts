/**
 * Identity & KYB Service adopting Eager Bootstrap and Lazy Storage Presigner patterns.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { storageConfig, authConfig, appConfig } from '@pasok/config';
import { lazyAsync, type TenantId, type SecurityContext } from '@pasok/domain';
import { pool } from '@pasok/database';

/**
 * Lazy S3 client initializer: defers MinIO client connection until the first presign call.
 */
export const getStorageClient = lazyAsync(async () => {
  return new S3Client({
    endpoint: storageConfig.endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: storageConfig.accessKey,
      secretAccessKey: storageConfig.secretKey,
    },
    forcePathStyle: true,
  });
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
    const client = await pool.connect();
    client.release();
    return { ready: true, latencyMs: Date.now() - start };
  } catch {
    return { ready: false, latencyMs: Date.now() - start };
  }
}

/**
 * Generates presigned upload URL using the lazily initialized S3 client.
 */
export async function generateKybUploadUrl(
  tenantId: TenantId,
  documentType: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; storageKey: string }> {
  const client = await getStorageClient();
  const fileExtension = fileName.split('.').pop() || 'webp';
  const storageKey = `tenants/${tenantId}/kyb/${documentType.toLowerCase()}_${Date.now()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: storageConfig.bucketPrivate,
    Key: storageKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: storageConfig.presignedUrlExpirySeconds,
  });

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
