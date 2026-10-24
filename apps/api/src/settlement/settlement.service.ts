/**
 * @file apps/api/src/settlement/settlement.service.ts
 * @description NestJS service delegating to @pasok/settlement-service.
 * Enforces dual-rail fee models (0.3% buyer, 0.5% merchant), HMAC-SHA256 webhooks, and H+1 disbursements.
 */

import { Injectable } from '@nestjs/common';
import type { SecurityContext } from '@pasok/domain';
import {
  SettlementService as CoreSettlementService,
  type CreatePaymentParams,
} from '@pasok/settlement-service';

@Injectable()
export class SettlementService {
  private readonly core = new CoreSettlementService();

  /**
   * Mengambil saldo rekening escrow penampung BPD DIY untuk pesanan tertentu.
   * @param context Konteks keamanan pihak terkait.
   * @param reservationId Identifier unik reservasi kuota.
   * @returns Entitas saldo rekening bersama.
   */
  public async getEscrowDetails(context: SecurityContext, reservationId: string) {
    return this.core.getSettlementStatus(context, reservationId);
  }

  /**
   * Menerbitkan tagihan pembayaran multi-channel melalui gateway Solosmartpay.
   * @param params Parameter tagihan pesanan.
   * @returns Faktur pembayaran dengan rincian biaya layanan dan instruksi bayar.
   */
  public async createPaymentInvoice(params: CreatePaymentParams) {
    return this.core.issuePaymentInvoice(params);
  }

  /**
   * Memproses notifikasi callback webhook pembayaran dari Solosmartpay.
   * @param rawBody Payload teks mentah JSON.
   * @param signatureHeader Header X-SoloSmartPay-Signature.
   * @returns Konfirmasi keberhasilan pembaruan status rekening escrow.
   */
  public async handleWebhook(rawBody: string, signatureHeader: string) {
    return this.core.processWebhookNotification(rawBody, signatureHeader);
  }

  /**
   * Menjalankan eksekusi pencairan otomatis dana escrow H+1 ke rekening kelompok tani.
   * @param limit Batas jumlah transaksi.
   * @returns Ringkasan hasil pencairan massal.
   */
  public async triggerDisbursements(limit?: number) {
    return this.core.executeDisbursements(limit);
  }
}
