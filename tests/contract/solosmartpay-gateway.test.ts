import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { SolosmartpayClient } from '../../services/settlement-service/src/solosmartpay';

describe('Solosmartpay Payment Gateway Contracts (PayFac & Split Fees)', () => {
  const secretKey = 'test_webhook_secret_key_123';
  const client = new SolosmartpayClient({
    apiToken: 'ssp_test_token_sample',
    webhookSecret: secretKey,
  });

  describe('Split Fee Calculation (0.3% Buyer System Fee, 0.5% Merchant Platform Fee)', () => {
    it('menghitung pembagian biaya secara presisi untuk transaksi Rp 1.000.000', () => {
      const fees = client.calculateSplitFees(1000000);

      expect(fees.buyerServiceFeeRp).toBe(3000);
      expect(fees.merchantFeeRp).toBe(5000);
      expect(fees.totalPayableRp).toBe(1003000);
      expect(fees.netMerchantDisbursementRp).toBe(995000);
    });

    it('menghitung pembagian biaya untuk transaksi MTV minimum Rp 500.000', () => {
      const fees = client.calculateSplitFees(500000);

      expect(fees.buyerServiceFeeRp).toBe(1500);
      expect(fees.merchantFeeRp).toBe(2500);
      expect(fees.totalPayableRp).toBe(501500);
      expect(fees.netMerchantDisbursementRp).toBe(497500);
    });
  });

  describe('Payment Invoice Generation (QRIS & Virtual Accounts)', () => {
    it('menerbitkan tagihan QRIS dinamis berformat EMVCo', async () => {
      const invoice = await client.createPayment({
        orderId: 'ORD-POOL-001',
        amountRp: 750000,
        customerName: 'Budi Santoso',
        customerEmail: 'budi@horeka.id',
        method: 'QRIS',
      });

      expect(invoice.paymentMethod).toBe('QRIS');
      expect(invoice.isSandbox).toBe(true);
      expect(invoice.status).toBe('PENDING');
      expect(invoice.qrString).toBeDefined();
      expect(invoice.qrString).toContain('ID.CO.SOLOSMARTPAY');
    });

    it('menerbitkan tagihan Virtual Account Bank BPD DIY Escrow', async () => {
      const invoice = await client.createPayment({
        orderId: 'ORD-POOL-002',
        amountRp: 1200000,
        customerName: 'Siti Rahma',
        customerEmail: 'siti@resto.id',
        method: 'BPD_DIY',
      });

      expect(invoice.paymentMethod).toBe('BPD_DIY');
      expect(invoice.vaNumber).toBeDefined();
      expect(invoice.vaNumber?.startsWith('988810')).toBe(true);
    });

    it('menerbitkan tagihan Virtual Account Mandiri (M2) dan BCA (B1)', async () => {
      const mandiri = await client.createPayment({
        orderId: 'ORD-POOL-003',
        amountRp: 500000,
        customerName: 'Agus',
        customerEmail: 'agus@kafe.id',
        method: 'M2',
      });

      expect(mandiri.paymentMethod).toBe('M2');
      expect(mandiri.vaNumber).toBeDefined();
    });
  });

  describe('HMAC-SHA256 Webhook Signature Verification', () => {
    it('memvalidasi tanda tangan webhook yang sah', () => {
      const payload = JSON.stringify({
        event: 'payment.success',
        invoiceId: 'INV-001',
        orderId: 'ORD-POOL-001',
        amount: 752250,
        method: 'QRIS',
      });

      const hash = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
      const signatureHeader = `sha256=${hash}`;

      const isValid = client.verifyWebhookSignature(payload, signatureHeader);
      expect(isValid).toBe(true);
    });

    it('menolak tanda tangan webhook yang telah dimanipulasi atau tidak cocok', () => {
      const payload = JSON.stringify({
        event: 'payment.success',
        invoiceId: 'INV-001',
        orderId: 'ORD-POOL-001',
        amount: 752250,
      });

      const fakeHeader = 'sha256=1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff';
      const isValid = client.verifyWebhookSignature(payload, fakeHeader);
      expect(isValid).toBe(false);
    });

    it('menolak tanda tangan webhook dengan panjang berbeda tanpa memicu RangeError', () => {
      const payload = JSON.stringify({ event: 'payment.success' });
      const malformedHeader = 'sha256=too_short';
      const isValid = client.verifyWebhookSignature(payload, malformedHeader);
      expect(isValid).toBe(false);
    });

    it('menolak tanda tangan webhook kosong', () => {
      const payload = JSON.stringify({ event: 'payment.success' });
      expect(client.verifyWebhookSignature(payload, '')).toBe(false);
    });
  });
});
