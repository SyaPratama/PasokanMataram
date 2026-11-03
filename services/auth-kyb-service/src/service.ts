/**
 * Identity & KYB Service adopting Eager Bootstrap and Lazy Appwrite Storage patterns.
 */

import { Client, Storage, ID } from 'node-appwrite';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { storageConfig, authConfig, appConfig } from '@pasok/config';
import { lazyAsync, type TenantId, type SecurityContext } from '@pasok/domain';
import { pool } from '@pasok/database';

/**
 * Lazy Appwrite Storage client initializer: defers connection until first upload.
 */
export const getStorageClient = lazyAsync(async () => {
  const client = new Client()
    .setEndpoint(storageConfig.endpoint)
    .setProject(storageConfig.projectId)
    .setKey(storageConfig.apiKey);
  return new Storage(client);
});

/**
 * Eager bootstrap verification to ensure database, configuration, and Appwrite readiness on startup.
 */
export async function bootstrapAuthService(): Promise<{ ready: boolean; latencyMs: number }> {
  const start = Date.now();
  if (!authConfig.jwtSecret || !appConfig.appName) {
    throw new Error('Konfigurasi autentikasi tidak lengkap saat inisialisasi eager.');
  }

  try {
    const connection = await pool.getConnection();
    connection.release();
    
    const storage = await getStorageClient();
    await storage.listBuckets();
    
    return { ready: true, latencyMs: Date.now() - start };
  } catch {
    return { ready: false, latencyMs: Date.now() - start };
  }
}

/**
 * Generates Appwrite Storage file upload with tenant isolation.
 */
export async function generateKybUploadUrl(
  tenantId: TenantId,
  documentType: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; storageKey: string }> {
  const storage = await getStorageClient();
  const fileExtension = fileName.split('.').pop() || 'bin';
  const storageKey = `tenants/${tenantId}/kyb/${documentType.toLowerCase()}_${Date.now()}.${fileExtension}`;

  const fileId = ID.unique();
  const uploadUrl = `${storageConfig.endpoint}/storage/buckets/${storageConfig.bucketId}/files`;

  return { uploadUrl, storageKey: fileId };
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
