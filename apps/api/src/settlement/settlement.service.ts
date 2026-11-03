/**
 * @file apps/api/src/settlement/settlement.service.ts
 * @description NestJS service delegating to @pasok/settlement-service.
 * Enforces dual-rail fee models (0.3% buyer, 0.5% merchant), HMAC-SHA256 webhooks, and H+1 disbursements.
 */

import { Injectable } from '@nestjs/common';
import type { SecurityContext } from '@pasok/domain';
import {
  SettlementService as CoreSettlementService,
  type CreateInvoiceParams,
} from '@pasok/settlement-service';

@Injectable()
export class SettlementService {
  private readonly core = new CoreSettlementService();


  /**
   * Membuat invoice pembayaran Solosmartpay.
   */
  public async createPaymentInvoice(params: CreateInvoiceParams) {
    return this.core.createPaymentInvoice(params);
  }

  /**
   * Mengambil status invoice berdasarkan reference.
   */
  public async getInvoiceStatus(reference: string) {
    return this.core.getInvoiceStatus(reference);
  }

  /**
   * Mengupdate status reservasi setelah pembayaran berhasil.
   */
  public async markReservationPaid(reservationId: string, invoiceId: string) {
    return this.core.markReservationPaid(reservationId, invoiceId);
  }
}
