/**
 * @file apps/api/src/settlement/settlement.service.ts
 * @description NestJS settlement service delegating to the active payment gateway via GatewayFactory.
 */

import { Injectable } from '@nestjs/common';
import { query } from '@pasok/database';
import { GatewayFactory } from '@pasok/payment-gateways';
import type { CreateInvoiceParams, GatewayInvoice } from '@pasok/domain';

export type { CreateInvoiceParams, GatewayInvoice };

@Injectable()
export class SettlementService {
  private readonly gatewayFactory = new GatewayFactory();

  public async createPaymentInvoice(params: CreateInvoiceParams): Promise<GatewayInvoice> {
    return this.gatewayFactory.active.createInvoice(params);
  }

  public async createPaymentInvoiceWithProvider(
    params: CreateInvoiceParams,
    provider: string,
  ): Promise<GatewayInvoice> {
    return this.gatewayFactory.get(provider).createInvoice(params);
  }

  public async getInvoiceStatus(reference: string): Promise<GatewayInvoice | null> {
    return this.gatewayFactory.active.getInvoiceByReference(reference);
  }

  public async markReservationPaid(reservationId: string, invoiceId: string): Promise<void> {
    await query(
      `UPDATE pooling_reservations 
       SET status = 'PAID', payment_invoice_id = ?, paid_at = NOW() 
       WHERE id = ?`,
      [invoiceId, reservationId]
    );
  }
}
