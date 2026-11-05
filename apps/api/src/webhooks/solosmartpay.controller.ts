/**
 * @file apps/api/src/webhooks/solosmartpay.controller.ts
 * @description Solosmartpay payment webhook handler with HMAC-SHA256 signature validation
 */

import { Controller, Post, Body, Headers, HttpException, HttpStatus, RawBodyRequest, Req } from '@nestjs/common';
import { createHmac } from 'crypto';
import { query } from '@pasok/database';
import { Public } from '../common/public.decorator';
import type { Request } from 'express';

interface SolosmartpayWebhook {
  external_transaction_id: string;
  order_id: string;
  status: string;
  amount: number;
  paid_at?: string;
}

@Controller('webhooks/solosmartpay')
export class SolosmartpayWebhookController {
  @Public()
  @Post()
  async handleWebhook(
    @Req() req: any,
    @Headers('x-solosmartpay-signature') signature: string,
    @Body() payload: SolosmartpayWebhook
  ) {
    const secret = process.env.SOLOSMARTPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new HttpException('Webhook secret not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Validate HMAC signature
    const rawBody = req.rawBody?.toString('utf-8') || JSON.stringify(payload);
    const computedSignature = createHmac('sha256', secret).update(rawBody).digest('hex');

    if (!signature || signature !== computedSignature) {
      console.warn('[Webhook] Invalid signature:', { received: signature, computed: computedSignature });
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    // Idempotency check
    const existing = await query(
      'SELECT id FROM webhook_events WHERE external_event_id = ? AND provider = ?',
      [payload.external_transaction_id, 'SOLOSMARTPAY']
    );

    if (existing.rows && existing.rows.length > 0) {
      return { success: true, message: 'Event already processed' };
    }

    // Log webhook event
    await query(
      'INSERT INTO webhook_events (id, provider, external_event_id, payload, received_at) VALUES (UUID(), ?, ?, ?, NOW())',
      ['SOLOSMARTPAY', payload.external_transaction_id, JSON.stringify(payload)]
    );

    // Update invoice status
    if (payload.status === 'settlement' || payload.status === 'paid') {
      await query(
        'UPDATE payment_invoices SET status = ?, paid_at = ?, updated_at = NOW() WHERE external_invoice_id = ?',
        ['PAID', payload.paid_at || new Date().toISOString(), payload.order_id]
      );

      // Update escrow settlement
      await query(
        'UPDATE escrow_settlements SET status = ?, updated_at = NOW() WHERE id = (SELECT reservation_id FROM payment_invoices WHERE external_invoice_id = ?)',
        ['READY_FOR_DISBURSEMENT', payload.order_id]
      );

      console.log('[Webhook] Payment confirmed:', payload.order_id);
    }

    return { success: true };
  }
}
