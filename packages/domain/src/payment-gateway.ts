/**
 * @file packages/domain/src/payment-gateway.ts
 * @description PaymentGateway interface contract and canonical types for all gateway adapters.
 */

import type { PaymentMethod, PaymentStatus, PaymentProvider } from '@pasok/config';

/** Canonical invoice representation returned by any gateway adapter. */
export interface GatewayInvoice {
  readonly invoiceId:     string;
  readonly reference:     string;
  readonly provider:      PaymentProvider;
  readonly amount:        number;
  readonly status:        PaymentStatus;
  readonly paymentMethod: PaymentMethod;
  readonly paymentUrl?:   string;
  readonly qrCode?:       string;
  readonly vaNumber?:     string;
  readonly expiresAt:     string;
  readonly createdAt:     string;
}

/** Canonical webhook event from any gateway. */
export interface GatewayWebhookEvent {
  readonly id:        string;
  readonly provider:  PaymentProvider;
  readonly type:      'payment.paid' | 'payment.failed' | 'payment.expired';
  readonly reference: string;
  readonly amount:    number;
  readonly status:    PaymentStatus;
  readonly paidAt?:   string;
  readonly timestamp: string;
}

/** Parameters for creating an invoice — provider-agnostic. */
export interface CreateInvoiceParams {
  readonly amount:         number;
  readonly reference:      string;
  readonly description:    string;
  readonly customerName:   string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly paymentMethod:  PaymentMethod;
}

/** Contract every gateway adapter must satisfy. */
export interface PaymentGateway {
  readonly provider: PaymentProvider;
  createInvoice(params: CreateInvoiceParams): Promise<GatewayInvoice>;
  getInvoiceByReference(reference: string): Promise<GatewayInvoice | null>;
  verifyWebhookSignature(rawBody: string, headers: Record<string, string>): Promise<boolean>;
  parseWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<GatewayWebhookEvent>;
}
