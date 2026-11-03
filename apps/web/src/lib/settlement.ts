/**
 * Settlement service types for web BFF routes
 * Copied from apps/api/src/settlement/settlement.service.ts
 */


import { paymentConfig, type PaymentMethod, type PaymentStatus } from '@pasok/config';

export type { PaymentMethod, PaymentStatus } from '@pasok/config';
export interface CreateInvoiceParams {
  amount: number;
  reference: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentInvoice {
  invoiceId: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentUrl?: string;
  qrCode?: string;
  vaNumber?: string;
  expiresAt: string;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  type: 'payment.paid' | 'payment.failed' | 'payment.expired';
  reference: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  timestamp: string;
}

class SolosmartpayClient {
  private readonly baseUrl: string;
  private readonly token: string;

  public constructor() {
    this.baseUrl = paymentConfig.baseUrl;
    this.token = paymentConfig.token;
  }

  public async createInvoice(params: CreateInvoiceParams): Promise<PaymentInvoice> {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        'X-API-Version': '2024-01-01',
      },
      body: JSON.stringify({
        amount: params.amount,
        reference: params.reference,
        description: params.description,
        customer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
        },
        payment_method: params.paymentMethod,
        callback_url: 'https://api-pasok.syapratama.tech/webhook/solosmartpay',
      }),
      signal: AbortSignal.timeout(paymentConfig.timeoutMs),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Solosmartpay API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      invoiceId: data.id,
      reference: data.reference,
      amount: data.amount,
      status: data.status,
      paymentMethod: data.payment_method,
      paymentUrl: data.payment_url,
      qrCode: data.qr_code,
      vaNumber: data.va_number,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  }
}

export class SettlementService {
  private readonly client = new SolosmartpayClient();

  public async createPaymentInvoice(params: CreateInvoiceParams): Promise<PaymentInvoice> {
    return this.client.createInvoice(params);
  }
}

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
): Promise<WebhookEvent> {
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
