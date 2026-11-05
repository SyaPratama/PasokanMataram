/**
 * @file packages/payment-gateways/src/duitku.gateway.ts
 * @description Duitku payment gateway adapter implementing PaymentGateway interface.
 */

import crypto from 'crypto';
import { paymentProviderConfigs, PAYMENT_METHODS, PAYMENT_STATUS } from '@pasok/config';
import type { PaymentGateway, CreateInvoiceParams, GatewayInvoice, GatewayWebhookEvent } from '@pasok/domain';

/**
 * Maps PaymentMethod values to Duitku payment method codes.
 * Reference: https://docs.duitku.com/api/en/#payment-method
 */
const DUITKU_METHOD_MAP: Record<string, string> = {
  [PAYMENT_METHODS.QRIS]:          'QR',
  [PAYMENT_METHODS.VA_BCA]:        'BC',
  [PAYMENT_METHODS.VA_MANDIRI]:    'M2',
  [PAYMENT_METHODS.VA_BNI]:        'I1',
  [PAYMENT_METHODS.VA_BRI]:        'BR',
  [PAYMENT_METHODS.VA_BSI]:        'BV',
  [PAYMENT_METHODS.VA_BPD_DIY]:    'B1',
  [PAYMENT_METHODS.EWALLET_GOPAY]: 'GP',
  [PAYMENT_METHODS.EWALLET_DANA]:  'DA',
  [PAYMENT_METHODS.EWALLET_OVO]:   'OV',
  [PAYMENT_METHODS.EWALLET_SHOPEE]:'SP',
};

function md5(value: string): string {
  return crypto.createHash('md5').update(value).digest('hex');
}

export class DuitkuGateway implements PaymentGateway {
  readonly provider = 'duitku' as const;
  private readonly cfg = paymentProviderConfigs.duitku;
  private readonly callbackUrl = process.env.DUITKU_CALLBACK_URL
    ?? 'https://api-pasok.syapratama.tech/api/v1/webhooks/duitku';

  async createInvoice(params: CreateInvoiceParams): Promise<GatewayInvoice> {
    const paymentCode = DUITKU_METHOD_MAP[params.paymentMethod];
    if (!paymentCode) {
      throw new Error(`Unsupported payment method for Duitku: ${params.paymentMethod}`);
    }

    const signature = md5(`${this.cfg.merchantCode}${params.amount}${params.reference}${this.cfg.apiKey}`);

    const response = await fetch(`${this.cfg.baseUrl}/api/merchant/createInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantCode:    this.cfg.merchantCode,
        paymentAmount:   params.amount,
        paymentMethod:   paymentCode,
        merchantOrderId: params.reference,
        productDetails:  params.description,
        customerVaName:  params.customerName,
        email:           params.customerEmail ?? '',
        phoneNumber:     params.customerPhone ?? '',
        callbackUrl:     this.callbackUrl,
        returnUrl:       this.callbackUrl,
        signature,
        expiryPeriod:    60,
      }),
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Duitku API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    if (data.statusCode !== '00') {
      throw new Error(`Duitku invoice error: ${data.statusMessage}`);
    }

    return {
      invoiceId:     data.reference,
      reference:     params.reference,
      provider:      'duitku',
      amount:        params.amount,
      status:        PAYMENT_STATUS.PENDING,
      paymentMethod: params.paymentMethod,
      paymentUrl:    data.paymentUrl,
      vaNumber:      data.vaNumber,
      expiresAt:     data.expiredDate ?? new Date(Date.now() + 3600_000).toISOString(),
      createdAt:     new Date().toISOString(),
    };
  }

  async getInvoiceByReference(reference: string): Promise<GatewayInvoice | null> {
    const signature = md5(`${this.cfg.merchantCode}${this.cfg.apiKey}${reference}`);

    const response = await fetch(`${this.cfg.baseUrl}/api/merchant/transactionList`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantCode:    this.cfg.merchantCode,
        merchantOrderId: reference,
        signature,
      }),
      signal: AbortSignal.timeout(this.cfg.timeoutMs),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Duitku API error: ${response.status}`);

    const data = await response.json();
    if (!data.data || data.data.length === 0) return null;

    const tx = data.data[0];
    const status = tx.resultCode === '00' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING;
    return {
      invoiceId:     tx.reference,
      reference,
      provider:      'duitku',
      amount:        tx.amount,
      status,
      paymentMethod: tx.paymentCode ?? 'qris',
      expiresAt:     new Date().toISOString(),
      createdAt:     tx.settlementDate ?? new Date().toISOString(),
    };
  }

  async verifyWebhookSignature(rawBody: string, _headers: Record<string, string>): Promise<boolean> {
    const body = JSON.parse(rawBody);
    const { merchantCode, amount, merchantOrderId, signature } = body;
    if (!merchantCode || !amount || !merchantOrderId || !signature) return false;

    const expected = md5(`${merchantCode}${amount}${merchantOrderId}${this.cfg.apiKey}`);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  async parseWebhookEvent(rawBody: string, headers: Record<string, string>): Promise<GatewayWebhookEvent> {
    const valid = await this.verifyWebhookSignature(rawBody, headers);
    if (!valid) throw new Error('Invalid webhook signature');

    const event = JSON.parse(rawBody);
    const type: GatewayWebhookEvent['type'] = event.resultCode === '00' ? 'payment.paid' : 'payment.failed';
    return {
      id:        event.reference ?? `duitku-${event.merchantOrderId}`,
      provider:  'duitku',
      type,
      reference: event.merchantOrderId,
      amount:    Number(event.amount),
      status:    type === 'payment.paid' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED,
      timestamp: new Date().toISOString(),
    };
  }
}
