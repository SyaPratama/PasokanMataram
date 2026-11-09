/**
 * @file packages/payment-gateways/src/solosmartpay.gateway.ts
 * @description SoloSmartPay payment gateway adapter implementing PaymentGateway interface.
 */

import crypto from 'crypto';
import { paymentProviderConfigs, PAYMENT_METHODS, PAYMENT_STATUS } from '@pasok/config';
import type { PaymentGateway, CreateInvoiceParams, GatewayInvoice, GatewayWebhookEvent } from '@pasok/domain';

/** Maps PaymentMethod values to SoloSmartPay payment_method codes. */
const SSP_METHOD_MAP: Record<string, string> = {
  [PAYMENT_METHODS.QRIS]:          'QRIS',
  [PAYMENT_METHODS.VA_BCA]:        'VA_BCA',
  [PAYMENT_METHODS.VA_MANDIRI]:    'VA_MANDIRI',
  [PAYMENT_METHODS.VA_BNI]:        'VA_BNI',
  [PAYMENT_METHODS.VA_BRI]:        'VA_BRI',
  [PAYMENT_METHODS.VA_BSI]:        'VA_BSI',
  [PAYMENT_METHODS.VA_BPD_DIY]:    'VA_BPD_DIY',
  [PAYMENT_METHODS.EWALLET_GOPAY]: 'EWALLET_GOPAY',
  [PAYMENT_METHODS.EWALLET_DANA]:  'EWALLET_DANA',
  [PAYMENT_METHODS.EWALLET_OVO]:   'EWALLET_OVO',
  [PAYMENT_METHODS.EWALLET_SHOPEE]:'EWALLET_SHOPEEPAY',
};

export class SolosmartpayGateway implements PaymentGateway {
  readonly provider = 'solosmartpay' as const;
  private readonly cfg = paymentProviderConfigs.solosmartpay;
  private readonly callbackUrl = process.env.SOLOSMARTPAY_CALLBACK_URL
    ?? 'https://api-pasok.syapratama.tech/api/v1/webhooks/solosmartpay';

  async createInvoice(params: CreateInvoiceParams): Promise<GatewayInvoice> {
    const sspMethod = SSP_METHOD_MAP[params.paymentMethod];
    if (!sspMethod) {
      throw new Error(`Unsupported payment method for SoloSmartPay: ${params.paymentMethod}`);
    }

    const response = await fetch(`${this.cfg.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cfg.token}`,
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
        payment_method: sspMethod,
        callback_url: this.callbackUrl,
      }),
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SoloSmartPay API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      invoiceId:     data.id,
      reference:     data.reference,
      provider:      'solosmartpay',
      amount:        data.amount,
      status:        data.status,
      paymentMethod: params.paymentMethod,
      paymentUrl:    data.payment_url,
      qrCode:        data.qr_code,
      vaNumber:      data.va_number,
      expiresAt:     data.expires_at,
      createdAt:     data.created_at,
    };
  }

  async getInvoiceByReference(reference: string): Promise<GatewayInvoice | null> {
    const response = await fetch(`${this.cfg.baseUrl}/invoices?reference=${reference}`, {
      headers: { 'Authorization': `Bearer ${this.cfg.token}` },
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`SoloSmartPay API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      invoiceId:     data.id,
      reference:     data.reference,
      provider:      'solosmartpay',
      amount:        data.amount,
      status:        data.status,
      paymentMethod: data.payment_method,
      paymentUrl:    data.payment_url,
      expiresAt:     data.expires_at,
      createdAt:     data.created_at,
    };
  }

  async verifyWebhookSignature(rawBody: string, headers: Record<string, string>): Promise<boolean> {
    const signature = headers['x-solosmartpay-signature'];
    const timestamp = headers['x-solosmartpay-timestamp'];
    if (!signature || !timestamp) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expected = crypto
      .createHmac('sha256', this.cfg.webhookSecret)
      .update(payload)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  async parseWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<GatewayWebhookEvent> {
    const valid = await this.verifyWebhookSignature(rawBody, headers);
    if (!valid) throw new Error('Invalid webhook signature');

    const event = JSON.parse(rawBody);
    return {
      id:        event.id,
      provider:  'solosmartpay',
      type:      event.type,
      reference: event.data.reference,
      amount:    event.data.amount,
      status:    event.data.status ?? PAYMENT_STATUS.PAID,
      paidAt:    event.data.paid_at,
      timestamp: event.timestamp,
    };
  }
}
