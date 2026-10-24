/**
 * @file apps/api/src/auth/auth.service.ts
 * @description NestJS service for enterprise identity, authentication, and KYB onboarding.
 * Delegates to @pasok/auth-kyb-service and enforces UU PDP compliance.
 */

import { Injectable } from '@nestjs/common';
import { generateKybUploadUrl, applyKybWatermark } from '@pasok/auth-kyb-service';
import type { TenantId } from '@pasok/domain';
import { query } from '@pasok/database';

export interface RegisterBusinessDto {
  businessName: string;
  tenantType: string;
  regency: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
}

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
    return generateKybUploadUrl(
      tenantId as TenantId,
      documentType,
      fileName,
      contentType
    );
  }

  /**
   * Menerapkan tanda air dinamis digital pada berkas dokumen KYB.
   * @param buffer Data berkas dokumen mentah.
   * @returns Buffer ber-watermark dan signature kriptografi.
   */
  public async watermarkDocument(buffer: Buffer) {
    return applyKybWatermark(buffer);
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
