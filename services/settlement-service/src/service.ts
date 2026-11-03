/**
 * @file services/settlement-service/src/service.ts
 * @description Settlement service dengan Solosmartpay payment gateway.
 * Menggantikan escrow vault logic dengan direct payment processing.
 */

import type { SecurityContext } from '@pasok/domain';
import { query } from '@pasok/database';
import { 
  SolosmartpayClient, 
  type CreateInvoiceParams, 
  type PaymentInvoice 
} from './solosmartpay';

export class SettlementService {
  private readonly client: SolosmartpayClient;

  public constructor() {
    this.client = new SolosmartpayClient();
  }

  /**
   * Membuat invoice pembayaran untuk reservasi pooling.
   */
  public async createPaymentInvoice(
    params: CreateInvoiceParams
  ): Promise<PaymentInvoice> {
    return this.client.createInvoice(params);
  }

  /**
   * Mengambil status invoice berdasarkan reference.
   */
  public async getInvoiceStatus(reference: string): Promise<PaymentInvoice | null> {
    return this.client.getInvoiceByReference(reference);
  }

  /**
   * Mengupdate status reservasi setelah pembayaran berhasil.
   */
  public async markReservationPaid(
    reservationId: string,
    invoiceId: string
  ): Promise<void> {
    await query(
      `UPDATE pooling_reservations 
       SET status = 'PAID', payment_invoice_id = ?, paid_at = NOW() 
       WHERE id = ?`,
      [invoiceId, reservationId]
    );
  }
}
