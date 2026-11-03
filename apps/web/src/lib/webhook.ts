/**
 * Webhook utilities for Solosmartpay
 * Minimal functions for signature verification
 */

import { paymentConfig } from '@pasok/config';

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  const secret = paymentConfig.webhookSecret;
  const payload = `${timestamp}.${rawBody}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedSignature = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

export async function parseWebhook(
  rawBody: string,
  signature: string | undefined,
  timestamp: string | undefined
) {
  if (!signature || !timestamp) {
    throw new Error('Missing webhook signature or timestamp');
  }

  const isValid = await verifyWebhookSignature(rawBody, signature, timestamp);
  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  const event = JSON.parse(rawBody);
  return {
    id: event.id,
    type: event.type,
    reference: event.data.reference,
    amount: event.data.amount,
    status: event.data.status,
    paidAt: event.data.paid_at,
    timestamp: event.timestamp,
  };
}
