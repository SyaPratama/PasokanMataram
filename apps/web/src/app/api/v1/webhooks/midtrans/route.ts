/**
 * Midtrans Webhook Handler
 * Endpoint: https://api-pasok.syapratama.tech/api/v1/webhooks/midtrans
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseWebhookEvent } from '@/lib/webhook';
import { query } from '@pasok/database';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();

    const event = await parseWebhookEvent('midtrans', rawBody, {});

    const isDuplicate = await checkDuplicateEvent(event.id);
    if (isDuplicate) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await recordWebhookEvent(event.id, event.type, 'midtrans', rawBody);

    if (event.type === 'payment.paid') {
      await query(
        `UPDATE pool_reservations SET status = 'PAID' WHERE payment_reference = ?`,
        [event.reference]
      );
    } else if (event.type === 'payment.failed' || event.type === 'payment.expired') {
      await query(
        `UPDATE pool_reservations SET status = 'CANCELLED' WHERE payment_reference = ?`,
        [event.reference]
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Midtrans Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 401 });
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
  provider: string,
  payload: string,
): Promise<void> {
  await query(
    `INSERT INTO webhook_events (event_id, event_type, provider, payload, processed_at)
     VALUES (?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE processed_at = NOW()`,
    [eventId, eventType, provider, payload]
  );
}
