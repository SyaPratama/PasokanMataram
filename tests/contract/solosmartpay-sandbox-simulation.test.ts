/**
 * @file tests/contract/solosmartpay-sandbox-simulation.test.ts
 * @description Contract tests for Solosmartpay Sandbox Simulation and Zero DB Mutation Guards.
 */

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { POST as simulatePaymentRoute } from '../../apps/web/src/app/api/v1/sandbox/payment-simulate/route';
import { POST as poolingReservationsRoute } from '../../apps/web/src/app/api/v1/pooling/reservations/route';
import { SolosmartpayClient } from '../../services/settlement-service/src/solosmartpay';

describe('Solosmartpay Sandbox Simulation & Zero DB Mutation Contracts', () => {
  const secretKey = process.env.SOLOSMARTPAY_WEBHOOK_SECRET || 'ssp_secret_default_key';
  const client = new SolosmartpayClient({
    apiToken: 'ssp_test_sandbox_mode',
    webhookSecret: secretKey,
  });

  describe('MTV Minimum Transaction Value Guard', () => {
    it('menolak simulasi transaksi dengan nominal di bawah Rp 500.000', async () => {
      const request = new Request('http://localhost:3000/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'INV-TEST-001',
          orderId: 'ORD-TEST-001',
          amount: 450000,
          method: 'BPD_DIY',
        }),
      });

      const response = await simulatePaymentRoute(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('menerima simulasi transaksi dengan nominal tepat atau di atas Rp 500.000', async () => {
      const request = new Request('http://localhost:3000/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'INV-TEST-500K',
          orderId: 'ORD-TEST-500K',
          amount: 500000,
          method: 'BPD_DIY',
          status: 'PAID',
        }),
      });

      const response = await simulatePaymentRoute(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.amount).toBe(500000);
      expect(json.data.buyerServiceFeeRp).toBe(1500);
      expect(json.data.merchantFeeRp).toBe(2500);
      expect(json.data.totalPayableRp).toBe(501500);
      expect(json.data.netMerchantDisbursementRp).toBe(497500);
      expect(json.data.isSandbox).toBe(true);
      expect(json.data.databaseMutated).toBe(false);
    });
  });

  describe('Cryptographic HMAC-SHA256 Signature Generation & Verification', () => {
    it('menghasilkan signature sha256 valid yang lolos uji verifikasi timing-safe Solosmartpay', async () => {
      const request = new Request('http://localhost:3000/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'INV-HMAC-VERIFY',
          orderId: 'ORD-HMAC-VERIFY',
          amount: 1000000,
          method: 'QRIS',
          status: 'PAID',
        }),
      });

      const response = await simulatePaymentRoute(request);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.isSignatureValid).toBe(true);
      expect(json.data.signatureHeader).toMatch(/^sha256=[a-f0-9]{64}$/);

      const rawPayload = JSON.stringify(json.data.payload);
      const manualComputed = crypto
        .createHmac('sha256', secretKey)
        .update(rawPayload)
        .digest('hex');

      expect(json.data.signatureHeader).toBe(`sha256=${manualComputed}`);

      const verified = client.verifyWebhookSignature(rawPayload, json.data.signatureHeader);
      expect(verified).toBe(true);
    });

    it('menolak signature yang dipalsukan dengan payload berbeda', () => {
      const genuinePayload = JSON.stringify({
        event: 'payment.success',
        invoiceId: 'INV-ORIGINAL',
        amount: 501500,
      });

      const genuineHash = crypto
        .createHmac('sha256', secretKey)
        .update(genuinePayload)
        .digest('hex');

      const tamperedPayload = JSON.stringify({
        event: 'payment.success',
        invoiceId: 'INV-ORIGINAL',
        amount: 50000,
      });

      const isVerified = client.verifyWebhookSignature(
        tamperedPayload,
        `sha256=${genuineHash}`
      );
      expect(isVerified).toBe(false);
    });
  });

  describe('BFF Route Zero DB Mutation Guard (Header & Cookie)', () => {
    it('mengembalikan respon reservasi sintetis tanpa memicu kueri SQL jika sandbox header aktif', async () => {
      const request = new Request('http://localhost:3000/api/v1/pooling/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pasok-sandbox-mode': 'true',
        },
        body: JSON.stringify({
          campaignId: '11111111-2222-3333-4444-555555555551',
          quantityKg: 20,
        }),
      });

      const response = await poolingReservationsRoute(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.isSandbox).toBe(true);
      expect(json.data.databaseMutated).toBe(false);
      expect(json.data.paymentInstructions.bankName).toBe('Bank BPD DIY');
      expect(json.data.paymentInstructions.vaNumber).toMatch(/^988810\d{8}$/);
    });

    it('menolak alokasi kuota di bawah MTV Rp 500.000 pada mode sandbox', async () => {
      const request = new Request('http://localhost:3000/api/v1/pooling/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pasok-sandbox-mode': 'true',
        },
        body: JSON.stringify({
          campaignId: '11111111-2222-3333-4444-555555555551',
          quantityKg: 5,
        }),
      });

      const response = await poolingReservationsRoute(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
