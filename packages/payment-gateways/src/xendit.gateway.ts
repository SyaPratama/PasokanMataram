/**
 * @file packages/payment-gateways/src/xendit.gateway.ts
 * @description Xendit payment gateway adapter implementing PaymentGateway interface.
 */

import crypto from 'crypto';
import { paymentProviderConfigs, PAYMENT_METHODS, PAYMENT_STATUS } from '@pasok/config';
import type { PaymentGateway, CreateInvoiceParams, GatewayInvoice, GatewayWebhookEvent } from '@pasok/domain';

/** Maps PaymentMethod values to Xendit payment_methods array entries. */
const XENDIT_METHOD_MAP: Record<string, string[]> = {
  [PAYMENT_METHODS.QRIS]:          ['QR_CODE'],
  [PAYMENT_METHODS.VA_BCA]:        ['BCA'],
  [PAYMENT_METHODS.VA_MANDIRI]:    ['MANDIRI'],
  [PAYMENT_METHODS.VA_BNI]:        ['BNI'],
  [PAYMENT_METHODS.VA_BRI]:        ['BRI'],
  [PAYMENT_METHODS.VA_BSI]:        ['BSI'],
  [PAYMENT_METHODS.VA_BPD_DIY]:    ['BPD'],
  [PAYMENT_METHODS.EWALLET_GOPAY]: ['GOPAY'],
  [PAYMENT_METHODS.EWALLET_DANA]:  ['DANA'],
  [PAYMENT_METHODS.EWALLET_OVO]:   ['OVO'],
  [PAYMENT_METHODS.EWALLET_SHOPEE]:['SHOPEEPAY'],
};

/** Maps Xendit invoice status to canonical PaymentStatus. */
function mapXenditStatus(xenditStatus: string): GatewayWebhookEvent['type'] {
  if (xenditStatus === 'PAID' || xenditStatus === 'SETTLED') return 'payment.paid';
  if (xenditStatus === 'EXPIRED') return 'payment.expired';
  return 'payment.failed';
}

export class XenditGateway implements PaymentGateway {
  readonly provider = 'xendit' as const;
  private readonly cfg = paymentProviderConfigs.xendit;
  private readonly callbackUrl = process.env.XENDIT_CALLBACK_URL
    ?? 'https://api-pasok.syapratama.tech/api/v1/webhooks/xendit';
  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.cfg.secretKey}:`).toString('base64')}`;
  }

  async createInvoice(params: CreateInvoiceParams): Promise<GatewayInvoice> {
    const methods = XENDIT_METHOD_MAP[params.paymentMethod];
    if (!methods) {
      throw new Error(`Unsupported payment method for Xendit: ${params.paymentMethod}`);
    }

    const response = await fetch(`${this.cfg.baseUrl}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authHeader,
      },
      body: JSON.stringify({
        external_id:      params.reference,
        amount:           params.amount,
        description:      params.description,
        customer:         { given_names: params.customerName, email: params.customerEmail, mobile_number: params.customerPhone },
        payment_methods:  methods,
        success_redirect_url: this.callbackUrl,
        failure_redirect_url: this.callbackUrl,
        callback_virtual_account_id: this.callbackUrl,
      }),
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Xendit API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      invoiceId:     data.id,
      reference:     data.external_id,
      provider:      'xendit',
      amount:        data.amount,
      status:        PAYMENT_STATUS.PENDING,
      paymentMethod: params.paymentMethod,
      paymentUrl:    data.invoice_url,
      expiresAt:     data.expiry_date,
      createdAt:     data.created,
    };
  }

  async getInvoiceByReference(reference: string): Promise<GatewayInvoice | null> {
    const response = await fetch(`${this.cfg.baseUrl}/v2/invoices?external_id=${reference}`, {
      headers: { 'Authorization': this.authHeader },
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Xendit API error: ${response.status}`);

    const list = await response.json();
    if (!Array.isArray(list) || list.length === 0) return null;
    const data = list[0];
    return {
      invoiceId:     data.id,
      reference:     data.external_id,
      provider:      'xendit',
      amount:        data.amount,
      status:        data.status?.toLowerCase() ?? PAYMENT_STATUS.PENDING,
      paymentMethod: data.payment_method ?? 'qris',
      paymentUrl:    data.invoice_url,
      expiresAt:     data.expiry_date,
      createdAt:     data.created,
    };
  }

  async verifyWebhookSignature(_rawBody: string, headers: Record<string, string>): Promise<boolean> {
    const token = headers['x-callback-token'];
    if (!token) return false;
    const tokBuf = Buffer.from(token);
    const expBuf = Buffer.from(this.cfg.webhookToken);
    if (tokBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(tokBuf, expBuf);
  }

  async parseWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<GatewayWebhookEvent> {
    const valid = await this.verifyWebhookSignature(rawBody, headers);
    if (!valid) throw new Error('Invalid webhook signature');

    const event = JSON.parse(rawBody);
    const type = mapXenditStatus(event.status);
    return {
      id:        event.id,
      provider:  'xendit',
      type,
      reference: event.external_id,
      amount:    event.amount,
      status:    type === 'payment.paid' ? PAYMENT_STATUS.PAID
               : type === 'payment.expired' ? PAYMENT_STATUS.EXPIRED
               : PAYMENT_STATUS.FAILED,
      paidAt:    event.paid_at,
      timestamp: event.updated ?? new Date().toISOString(),
    };
  }
}
