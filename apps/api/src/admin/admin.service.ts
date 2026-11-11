/**
 * @file apps/api/src/admin/admin.service.ts
 * @description NestJS service for platform governance, tenant management, and escrow reconciliation.
 * Enforces Super Admin privileges and Constitution Principles II, III, and XIII.
 */

import { Injectable } from '@nestjs/common';
import { query } from '@pasok/database';

export interface ReviewKybDto {
  documentId: string;
  tenantId: string;
  decision: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

@Injectable()
export class AdminService {
  /**
   * Mengambil seluruh organisasi bisnis penyewa beserta status verifikasi legalitas KYB.
   * @returns Array profil organisasi penyewa.
   */
  public async getTenants() {
    const res = await query(
      `SELECT id, business_name AS name, tenant_type AS type, kyb_status, created_at, updated_at
       FROM tenants
       ORDER BY created_at DESC`
    );
    return res.rows || [];
  }

  /**
   * Mengambil rekapitulasi saldo penampung rekening escrow terpadu secara menyeluruh.
   * @returns Ringkasan saldo escrow dan volume transaksi.
   */
  public async getEscrowReconciliation() {
    const res = await query(
      `SELECT
         COALESCE(SUM(locked_amount_rp), 0) AS totalEscrowLockedRp,
         COALESCE(SUM(disbursed_amount_rp), 0) AS totalDisbursedH1Rp,
         COALESCE(SUM(CASE WHEN status = 'HELD_DISPUTE' THEN locked_amount_rp ELSE 0 END), 0) AS totalDisputedHeldRp,
         COUNT(DISTINCT escrow_account_number) AS activeVirtualAccountsCount,
         MAX(escrow_account_number) AS bpdDiySettlementAccount,
         CASE WHEN COUNT(CASE WHEN status = 'HELD_DISPUTE' THEN 1 END) = 0 THEN 'BALANCED' ELSE 'REVIEW_REQUIRED' END AS reconciliationStatus
       FROM escrow_settlements`
    );
    return {
      ...(res.rows?.[0] || {}),
      lastReconciledAt: new Date().toISOString(),
    };
  }

  /**
   * Mengambil pantauan pemanfaatan kuota panen massal seluruh sentra komoditas DIY.
   * @returns Daftar kuota panen dan sisa kapasitas.
   */
  public async getPlatformQuotas() {
    const res = await query(
      `SELECT t.regency,
              pc.commodity_name AS commodity,
              SUM(pc.target_quota_kg) AS targetQuotaKg,
              SUM(pc.allocated_quota_kg) AS allocatedQuotaKg,
              ROUND(100 * SUM(pc.allocated_quota_kg) / NULLIF(SUM(pc.target_quota_kg), 0), 1) AS fulfillmentPercentage,
              COUNT(DISTINCT pr.buyer_tenant_id) AS participatingKitchens
       FROM pooling_campaigns pc
       JOIN tenants t ON t.id = pc.supplier_tenant_id
       LEFT JOIN pool_reservations pr ON pr.campaign_id = pc.id
       GROUP BY t.regency, pc.commodity_name
       ORDER BY t.regency, pc.commodity_name`
    );
    return res.rows || [];
  }

  /**
   * Memproses putusan verifikasi dokumen KYB oleh reviewer admin.
   * @param dto Rincian putusan persetujuan atau penolakan.
   * @returns Konfirmasi status berkas legalitas.
   */
  public async processKybReview(dto: ReviewKybDto) {
    const newStatus = dto.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';

    await query(
      `UPDATE kyb_documents
       SET status = ?, rejection_reason = ?, updated_at = NOW()
       WHERE id = ?`,
      [newStatus, dto.rejectionReason || null, dto.documentId]
    );
    await query(
      `UPDATE tenants
       SET kyb_status = ?, updated_at = NOW()
       WHERE id = ?`,
      [newStatus, dto.tenantId]
    );
    return {
      documentId: dto.documentId,
      tenantId: dto.tenantId,
      status: newStatus,
      reviewedAt: new Date().toISOString(),
    };
  }
}
