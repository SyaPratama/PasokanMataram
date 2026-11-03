/**
 * Solosmartpay Webhook Handler
 * Endpoint: https://api-pasok.syapratama.tech/webhook/solosmartpay
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseWebhook } from '@/../../services/settlement-service/src/solosmartpay';
import { query } from '@pasok/database';

export const runtime = 'nodejs';

/**
 * Handle Solosmartpay payment webhook notifications.
 * Verifies HMAC-SHA256 signature and updates order status.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-SoloSmartPay-Signature');
    const timestamp = request.headers.get('X-SoloSmartPay-Timestamp');

    const event = await parseWebhook(rawBody, signature || '', timestamp || '');

    const isDuplicate = await checkDuplicateEvent(event.id);
    if (isDuplicate) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await recordWebhookEvent(event.id, event.type, rawBody);

    if (event.type === 'payment.paid') {
      await query(
        `UPDATE pooling_reservations 
         SET status = 'PAID', paid_at = NOW() 
         WHERE reference = ?`,
        [event.reference]
      );
    } else if (event.type === 'payment.failed' || event.type === 'payment.expired') {
      await query(
        `UPDATE pooling_reservations 
         SET status = 'FAILED' 
         WHERE reference = ?`,
        [event.reference]
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 401 }
    );
  }
}

async function checkDuplicateEvent(eventId: string): Promise<boolean> {
  const result = await query(
    `SELECT id FROM webhook_events WHERE event_id = ? LIMIT 1`,
    [eventId]
  );
  return result.rows.length > 0;
}

async function recordWebhookEvent(
  eventId: string,
  eventType: string,
  payload: string
): Promise<void> {
  await query(
    `INSERT INTO webhook_events (event_id, event_type, payload, processed_at) 
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE processed_at = NOW()`,
    [eventId, eventType, payload]
  );
}
