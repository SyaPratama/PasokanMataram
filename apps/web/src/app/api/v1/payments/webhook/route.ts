/**
 * @file apps/web/src/app/api/v1/payments/webhook/route.ts
 * @description Webhook callback listener for Solosmartpay payment events.
 * Enforces cryptographic HMAC-SHA256 signature verification and atomic status transitions.
 */

import { NextResponse } from 'next/server';
import { SettlementService } from '@pasok/settlement-service';

const settlementService = new SettlementService();

/**
 * Menerima webhook notifikasi event pembayaran dari Solosmartpay.
 * @param request HTTP POST Request berisi payload event dan header tanda tangan.
 * @returns Respon JSON konfirmasi penerimaan webhook.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-solosmartpay-signature') || '';

    const result = await settlementService.processWebhookNotification(rawBody, signature);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Webhook Solosmartpay berhasil diproses.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Kegagalan pemrosesan webhook Solosmartpay.';
    const isUnauthorized = message.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isUnauthorized ? 'INVALID_SIGNATURE' : 'WEBHOOK_FAILED',
          message,
        },
      },
      { status: isUnauthorized ? 401 : 500 }
    );
  }
}
