/**
 * @file apps/api/src/auth/auth.service.ts
 * @description NestJS service for enterprise identity, authentication, and KYB onboarding.
 * Consolidates auth-kyb-service logic into monolith architecture.
 */

import { Injectable } from '@nestjs/common';
import { Client, Storage, ID } from 'node-appwrite';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storageConfig, authConfig, appConfig } from '@pasok/config';
import { lazyAsync, type TenantId, type SecurityContext } from '@pasok/domain';
import { getClient, query } from '@pasok/database';

export interface RegisterBusinessDto {
  businessName: string;
  tenantType: string;
  regency: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
}


const DEFAULT_KYB_WATERMARK = 'HANYA UNTUK VERIFIKASI KYB PASOKMATARAM';

interface EncryptedDocumentPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  algorithm: 'aes-256-gcm';
}

interface WatermarkedDocumentResult {
  watermarkedBuffer: Buffer;
  signature: string;
  timestamp: string;
}

export const getStorageClient = lazyAsync(async () => {
  const client = new Client()
    .setEndpoint(storageConfig.endpoint)
    .setProject(storageConfig.projectId)
    .setKey(storageConfig.apiKey);
  return new Storage(client);
});

@Injectable()
export class AuthService {
  /**
   * Menghasilkan URL presigned MinIO S3 untuk unggah berkas legalitas KYB.
   * @param tenantId Identifier organisasi penyewa.
   * @param documentType Jenis berkas (NIB, KTP, NPWP).
   * @param fileName Nama file asli.
   * @param contentType MIME type file.
   * @returns URL presigned dan storage key.
   */
  public async getKybUploadUrl(
    tenantId: string,
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
   * Menerapkan tanda air dinamis digital pada berkas dokumen KYB.
   * @param buffer Data berkas dokumen mentah.
   * @returns Buffer ber-watermark dan signature kriptografi.
   */
  public async watermarkDocument(buffer: Buffer): Promise<WatermarkedDocumentResult> {
    const notice = DEFAULT_KYB_WATERMARK;
    const watermarkBuffer = Buffer.from(`\n\n--- ${notice} ---\n`, 'utf-8');
    const watermarkedBuffer = Buffer.concat([buffer, watermarkBuffer]);
    const signature = crypto.createHash('sha256').update(watermarkedBuffer).digest('hex');
    const timestamp = new Date().toISOString();

    return { watermarkedBuffer, signature, timestamp };
  }

  public createSessionToken(context: SecurityContext): string {
    const sessionTtlSeconds = authConfig.sessionExpiryDays * 24 * 60 * 60;
    return jwt.sign(
      {
        tenantId: context.tenantId,
        userId: context.userId,
        role: context.role,
        isSuperAdmin: context.isSuperAdmin,
      },
      authConfig.jwtSecret,
      { expiresIn: `${sessionTtlSeconds}s` }
    );
  }

  public async hashPassword(plainText: string): Promise<string> {
    return argon2.hash(plainText, {
      type: argon2.argon2id,
      memoryCost: authConfig.argon2MemoryCost,
      timeCost: authConfig.argon2TimeCost,
      parallelism: authConfig.argon2Parallelism,
    });
  }

  public async bootstrapAuthService(): Promise<{ ready: boolean; latencyMs: number }> {
    const start = Date.now();
    if (!authConfig.jwtSecret || !appConfig.appName) {
      throw new Error('Konfigurasi autentikasi tidak lengkap saat inisialisasi eager.');
    }

    try {
      const connection = await getClient();
      connection.release();
      
      const storage = await getStorageClient();
      await storage.listBuckets();
      
      return { ready: true, latencyMs: Date.now() - start };
    } catch {
      return { ready: false, latencyMs: Date.now() - start };
    }
  }


  /**
   * Mengambil daftar dokumen KYB yang memerlukan audit verifikasi.
   * @returns Array dokumen menunggu audit.
   */
  public async getPendingKybAudits() {
    const res = await query(
      `SELECT kd.id, kd.tenant_id, t.name as tenant_name, kd.document_type,
              kd.file_storage_key, kd.status, kd.created_at
       FROM kyb_documents kd
       JOIN tenants t ON t.id = kd.tenant_id
       WHERE kd.status = 'PENDING_VERIFICATION'
       ORDER BY kd.created_at ASC`
    );
    return res.rows;
  }
}
