/**
 * @file apps/web/src/lib/webhook.ts
 * @description Provider-agnostic webhook utilities delegating to gateway adapters.
 */

import { type PaymentProvider } from '@pasok/config';
import { GatewayFactory } from '@pasok/payment-gateways';
import type { GatewayWebhookEvent } from '@pasok/domain';

const factory = new GatewayFactory();

export async function parseWebhookEvent(
  provider: PaymentProvider,
  rawBody: string,
  headers: Record<string, string>,
): Promise<GatewayWebhookEvent> {
  return factory.get(provider).parseWebhookEvent(rawBody, headers);
}
