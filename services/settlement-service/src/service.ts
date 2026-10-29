/**
 * @file services/settlement-service/src/service.ts
 * @description Standalone microservice for Escrow Vault, Solosmartpay payment gateway, and BPD DIY settlements.
 * Enforces dual-rail fee models (0.3% buyer, 0.5% merchant), HMAC-SHA256 webhooks, and H+1 disbursements.
 */

import type { SecurityContext } from '@pasok/domain';
import {
  PostgresEcosystemAdapter,
  type EscrowSettlementRow,
  query,
} from '@pasok/database';
import { createClient } from 'redis';
import {
  SolosmartpayClient,
  type SolosmartpayConfig,
  type CreatePaymentParams,
  type PaymentInvoiceResult,
  type WebhookEventPayload,
} from './solosmartpay';

export class SettlementService {
  private readonly adapter: InstanceType<typeof PostgresEcosystemAdapter>;
  private readonly gatewayClient: SolosmartpayClient;

  public constructor(customConfig?: Partial<SolosmartpayConfig>) {
    this.adapter = new PostgresEcosystemAdapter();
    this.gatewayClient = new SolosmartpayClient({
      apiToken: customConfig?.apiToken || process.env.SOLOSMARTPAY_API_TOKEN || 'ssp_test_pasokmataram_demo',
      webhookSecret: customConfig?.webhookSecret || process.env.SOLOSMARTPAY_WEBHOOK_SECRET || 'ssp_secret_default_key',
      baseUrl: customConfig?.baseUrl,
    });
  }

  /**
   * Mengambil status rekening escrow untuk pesanan pooling tertentu.
   * @param context Konteks keamanan pihak terkait.
   * @param reservationId Identifier unik reservasi kuota.
   * @returns Entitas saldo rekening escrow penampung.
   */
  public async getSettlementStatus(
    context: SecurityContext,
    reservationId: string
  ): Promise<EscrowSettlementRow | null> {
    return this.adapter.getSettlementStatus(context, reservationId);
  }

  /**
   * Menerbitkan tagihan pembayaran melalui gateway Solosmartpay (QRIS, VA BPD DIY, Mandiri, BRI, BCA, BSI).
   * @param params Parameter tagihan pesanan.
   * @returns Faktur pembayaran dengan rincian biaya layanan sistem dan instruksi bayar.
   */
  public async issuePaymentInvoice(
    params: CreatePaymentParams
  ): Promise<PaymentInvoiceResult> {
    return this.gatewayClient.createPayment(params);
  }

  /**
   * Menangani notifikasi webhook callback pembayaran berhasil dari Solosmartpay.
   * Memvalidasi tanda tangan HMAC-SHA256 untuk mencegah serangan pemalsuan payload.
   * @param rawBody Teks payload JSON mentah.
   * @param signatureHeader Header X-SoloSmartPay-Signature dari gateway.
   * @returns Konfirmasi keberhasilan pembaruan status rekening escrow.
   */
  public async processWebhookNotification(
    rawBody: string,
    signatureHeader: string
  ): Promise<{ success: boolean; orderId?: string; event?: string }> {
    const isValid = this.gatewayClient.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      throw new Error('Tanda tangan digital webhook Solosmartpay tidak valid.');
    }

    const payload = JSON.parse(rawBody) as WebhookEventPayload;

    const webhookId = payload.webhookId || payload.orderId;
    if (!webhookId) {
      throw new Error('Webhook tidak memiliki identifier unik.');
    }

    const redisKey = `webhook:processed:${webhookId}`;
    const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    await redisClient.connect();
    const alreadyProcessed = await redisClient.get(redisKey);
    
    if (alreadyProcessed) {
      await redisClient.quit();
      return {
        success: true,
        orderId: payload.orderId,
        event: payload.event,
      };
    }

    const timestamp = payload.timestamp || Date.now();
    const now = Date.now();
    const maxAge = 5 * 60 * 1000;
    
    if (Math.abs(now - timestamp) > maxAge) {
      await redisClient.quit();
    }

    if (payload.event === 'payment.success') {
      await query(
        `UPDATE pool_reservations
         SET status = 'PAID',
             updated_at = NOW()
         WHERE id = $1 OR payment_reference = $1`,
        [payload.orderId]
      );

      await query(
        `UPDATE escrow_settlements
         SET status = 'ESCROW_LOCKED',
             updated_at = NOW()
         WHERE reservation_id = $1`,
        [payload.orderId]
      );
    }

    await redisClient.setEx(redisKey, 600, 'processed');
    await redisClient.quit();

    return {
      success: true,
      orderId: payload.orderId,
      event: payload.event,
    };
  }

  /**
   * Mengeksekusi batch pencairan dana escrow H+1 ke rekening kelompok tani untuk pesanan yang lolos QC.
   * @param limit Jumlah entri maksimal yang diproses.
   * @returns Ringkasan hasil pencairan otomatis.
   */
  public async executeDisbursements(limit: number = 50): Promise<{
    processedCount: number;
    totalDisbursedRp: number;
    disbursedIds: string[];
  }> {
    const res = await query<{
      id: string;
      reservation_id: string;
      net_disbursement_rp: string;
    }>(
      `SELECT id, reservation_id, net_disbursement_rp
       FROM escrow_settlements
       WHERE status = 'READY_FOR_DISBURSEMENT'
         AND scheduled_disbursement_at <= NOW()
       FOR UPDATE SKIP LOCKED
       LIMIT $1`,
    );

    let total = 0;
    const disbursedIds: string[] = [];

    for (const row of res.rows) {
      await query(
        `UPDATE escrow_settlements
         SET status = 'DISBURSED',
             disbursed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [row.id]
      );
      total += Number(row.net_disbursement_rp);
      disbursedIds.push(row.id);
    }

    return {
      processedCount: disbursedIds.length,
      totalDisbursedRp: total,
      disbursedIds,
    };
  }
}
