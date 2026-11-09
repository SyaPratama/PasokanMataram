import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { paymentProviderConfigs } from '@pasok/config';
import { SolosmartpayGateway } from '../../../packages/payment-gateways/src/solosmartpay.gateway';
import { XenditGateway } from '../../../packages/payment-gateways/src/xendit.gateway';
import { MidtransGateway } from '../../../packages/payment-gateways/src/midtrans.gateway';
import { DuitkuGateway } from '../../../packages/payment-gateways/src/duitku.gateway';

describe('Payment Gateway Webhook HMAC Defensive Verification', () => {
  it('Solosmartpay: mengembalikan false dengan aman tanpa RangeError pada signature panjang salah', async () => {
    const gateway = new SolosmartpayGateway();
    const headers = {
      'x-solosmartpay-signature': 'too_short',
      'x-solosmartpay-timestamp': '1700000000',
    };

    const valid = await gateway.verifyWebhookSignature('{"foo":"bar"}', headers);
    expect(valid).toBe(false);
  });

  it('Solosmartpay: memvalidasi signature HMAC-SHA256 valid dengan sukses', async () => {
    const gateway = new SolosmartpayGateway();
    const rawBody = '{"id":"evt-123","type":"payment.paid"}';
    const timestamp = '1700000000';
    const secret = paymentProviderConfigs.solosmartpay.webhookSecret;

    const validSig = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const headers = {
      'x-solosmartpay-signature': validSig,
      'x-solosmartpay-timestamp': timestamp,
    };

    const valid = await gateway.verifyWebhookSignature(rawBody, headers);
    expect(valid).toBe(true);
  });

  it('Xendit: mengembalikan false dengan aman tanpa RangeError pada token callback berbeda panjang', async () => {
    const gateway = new XenditGateway();
    const headers = {
      'x-callback-token': 'wrong-short-token',
    };

    const valid = await gateway.verifyWebhookSignature('{}', headers);
    expect(valid).toBe(false);
  });

  it('Midtrans: mengembalikan false dengan aman pada signature_key panjang tidak cocok', async () => {
    const gateway = new MidtransGateway();
    const body = JSON.stringify({
      order_id: 'order-123',
      status_code: '200',
      gross_amount: '500000.00',
      signature_key: 'short',
    });

    const valid = await gateway.verifyWebhookSignature(body, {});
    expect(valid).toBe(false);
  });

  it('Duitku: mengembalikan false dengan aman pada signature md5 panjang tidak cocok', async () => {
    const gateway = new DuitkuGateway();
    const body = JSON.stringify({
      merchantCode: 'M123',
      amount: '500000',
      merchantOrderId: 'order-123',
      signature: 'short',
    });

    const valid = await gateway.verifyWebhookSignature(body, {});
    expect(valid).toBe(false);
  });
});
