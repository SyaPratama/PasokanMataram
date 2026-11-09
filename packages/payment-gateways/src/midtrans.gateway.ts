/**
 * @file packages/payment-gateways/src/midtrans.gateway.ts
 * @description Midtrans payment gateway adapter implementing PaymentGateway interface.
 */

import crypto from 'crypto';
import { paymentProviderConfigs, PAYMENT_METHODS, PAYMENT_STATUS } from '@pasok/config';
import type { PaymentGateway, CreateInvoiceParams, GatewayInvoice, GatewayWebhookEvent } from '@pasok/domain';

/**
 * Maps PaymentMethod values to Midtrans Snap payment types.
 * Reference: https://docs.midtrans.com/reference/snap-api
 */
const MIDTRANS_METHOD_MAP: Record<string, string> = {
  [PAYMENT_METHODS.QRIS]:          'qris',
  [PAYMENT_METHODS.VA_BCA]:        'bca_va',
  [PAYMENT_METHODS.VA_MANDIRI]:    'mandiri_bill',
  [PAYMENT_METHODS.VA_BNI]:        'bni_va',
  [PAYMENT_METHODS.VA_BRI]:        'bri_va',
  [PAYMENT_METHODS.VA_BSI]:        'bni_va',
  [PAYMENT_METHODS.VA_BPD_DIY]:    'other_va',
  [PAYMENT_METHODS.EWALLET_GOPAY]: 'gopay',
  [PAYMENT_METHODS.EWALLET_DANA]:  'gopay',
  [PAYMENT_METHODS.EWALLET_OVO]:   'gopay',
  [PAYMENT_METHODS.EWALLET_SHOPEE]:'shopeepay',
};

/** Maps Midtrans transaction_status to canonical event type. */
function mapMidtransStatus(txStatus: string, fraudStatus?: string): GatewayWebhookEvent['type'] {
  if (txStatus === 'settlement' || (txStatus === 'capture' && fraudStatus === 'accept')) return 'payment.paid';
  if (txStatus === 'expire') return 'payment.expired';
  return 'payment.failed';
}

export class MidtransGateway implements PaymentGateway {
  readonly provider = 'midtrans' as const;
  private readonly cfg = paymentProviderConfigs.midtrans;
  private readonly callbackUrl = process.env.MIDTRANS_CALLBACK_URL
    ?? 'https://api-pasok.syapratama.tech/api/v1/webhooks/midtrans';
  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.cfg.serverKey}:`).toString('base64')}`;
  }
  private get snapBaseUrl(): string {
    return this.cfg.sandbox
      ? 'https://app.sandbox.midtrans.com/snap/v1'
      : 'https://app.midtrans.com/snap/v1';
  }

  async createInvoice(params: CreateInvoiceParams): Promise<GatewayInvoice> {
    const enabledMethod = MIDTRANS_METHOD_MAP[params.paymentMethod];
    if (!enabledMethod) {
      throw new Error(`Unsupported payment method for Midtrans: ${params.paymentMethod}`);
    }

    const response = await fetch(`${this.snapBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authHeader,
      },
      body: JSON.stringify({
        transaction_details: { order_id: params.reference, gross_amount: params.amount },
        item_details: [{ id: params.reference, price: params.amount, quantity: 1, name: params.description }],
        customer_details: { first_name: params.customerName, email: params.customerEmail, phone: params.customerPhone },
        enabled_payments: [enabledMethod],
        callbacks: { finish: this.callbackUrl },
      }),
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Midtrans API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      invoiceId:     data.token,
      reference:     params.reference,
      provider:      'midtrans',
      amount:        params.amount,
      status:        PAYMENT_STATUS.PENDING,
      paymentMethod: params.paymentMethod,
      paymentUrl:    data.redirect_url,
      expiresAt:     new Date(Date.now() + 24 * 3600_000).toISOString(),
      createdAt:     new Date().toISOString(),
    };
  }

  async getInvoiceByReference(reference: string): Promise<GatewayInvoice | null> {
    const baseUrl = this.cfg.sandbox
      ? 'https://api.sandbox.midtrans.com/v2'
      : 'https://api.midtrans.com/v2';

    const response = await fetch(`${baseUrl}/${reference}/status`, {
      headers: { 'Authorization': this.authHeader },
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Midtrans API error: ${response.status}`);

    const data = await response.json();
    const type = mapMidtransStatus(data.transaction_status, data.fraud_status);
    const status = type === 'payment.paid' ? PAYMENT_STATUS.PAID
                 : type === 'payment.expired' ? PAYMENT_STATUS.EXPIRED
                 : PAYMENT_STATUS.PENDING;

    return {
      invoiceId:     data.transaction_id,
      reference:     data.order_id,
      provider:      'midtrans',
      amount:        Number(data.gross_amount),
      status,
      paymentMethod: data.payment_type ?? 'qris',
      expiresAt:     data.expiry_time ?? new Date().toISOString(),
      createdAt:     data.transaction_time ?? new Date().toISOString(),
    };
  }

  async verifyWebhookSignature(rawBody: string, _headers: Record<string, string>): Promise<boolean> {
    const notification = JSON.parse(rawBody);
    const { order_id, status_code, gross_amount, signature_key } = notification;
    if (!order_id || !status_code || !gross_amount || !signature_key) return false;

    const expected = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${this.cfg.serverKey}`)
      .digest('hex');

    const sigBuf = Buffer.from(signature_key);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  async parseWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<GatewayWebhookEvent> {
    const valid = await this.verifyWebhookSignature(rawBody, headers);
    if (!valid) throw new Error('Invalid webhook signature');

    const notification = JSON.parse(rawBody);
    const type = mapMidtransStatus(notification.transaction_status, notification.fraud_status);
    return {
      id:        notification.transaction_id,
      provider:  'midtrans',
      type,
      reference: notification.order_id,
      amount:    Number(notification.gross_amount),
      status:    type === 'payment.paid' ? PAYMENT_STATUS.PAID
               : type === 'payment.expired' ? PAYMENT_STATUS.EXPIRED
               : PAYMENT_STATUS.FAILED,
      paidAt:    notification.settlement_time,
      timestamp: notification.transaction_time ?? new Date().toISOString(),
    };
  }
}
