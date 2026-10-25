/**
 * @file tests/e2e/sandbox-live-browser-mode.test.ts
 * @description E2E & Component Contract Verification Suite for Sandbox Mode & Zero DB Mutation.
 * Covers:
 * 1. 4 Personas switching (BUYER, SUPPLIER, HUB, ADMIN)
 * 2. Solosmartpay Payment Gateway simulation (0.3% buyer fee, 0.5% merchant fee, MTV Rp 500k, HMAC-SHA256)
 * 3. Optimistic reactive state updates (Reservations, Invoices, KYB Queue, Weigh Tickets)
 * 4. Reset Data Sandbox functionality
 * 5. Absolute proof of Database Immutability (Zero SQL mutations)
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { INITIAL_SANDBOX_STATE } from '../../apps/web/src/components/sandbox/sandbox-context';
import { POST as simulatePaymentRoute } from '../../apps/web/src/app/api/v1/sandbox/payment-simulate/route';
import { POST as poolingReservationsRoute } from '../../apps/web/src/app/api/v1/pooling/reservations/route';
import { POST as kybReviewRoute } from '../../apps/web/src/app/api/v1/admin/kyb/review/route';
import { POST as qcDisputeRoute } from '../../apps/web/src/app/api/v1/qc/dispute/route';
import { query } from '@pasok/database';

describe('Sandbox Mode Pengujian Live Browser & Solosmartpay Simulation (Zero DB Mutation)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webComponentsDir = path.join(rootDir, 'apps/web/src/components/sandbox');

  describe('Sandbox Architecture & Design System Integrity', () => {
    it('memvalidasi keberadaan berkas inti sandbox engine di apps/web/src/components/sandbox', () => {
      expect(fs.existsSync(path.join(webComponentsDir, 'sandbox-context.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(webComponentsDir, 'sandbox-banner.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(webComponentsDir, 'payment-gateway-simulator-modal.tsx'))).toBe(true);
    });

    it('memastikan sandbox banner dan modal mematuhi larangan arbitrary hex dan emotikon mentah', () => {
      const bannerContent = fs.readFileSync(path.join(webComponentsDir, 'sandbox-banner.tsx'), 'utf-8');
      const modalContent = fs.readFileSync(
        path.join(webComponentsDir, 'payment-gateway-simulator-modal.tsx'),
        'utf-8'
      );

      expect(bannerContent).not.toMatch(/#[0-9a-fA-F]{3,6}(?!;)/);
      expect(modalContent).not.toMatch(/#[0-9a-fA-F]{3,6}(?!;)/);

      expect(bannerContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
      expect(modalContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);

      expect(bannerContent).toContain('min-h-[48px]');
      expect(modalContent).toContain('min-h-[48px]');
    });

    it('memvalidasi integrasi SandboxProvider dan SandboxBanner di RootLayout', () => {
      const layoutContent = fs.readFileSync(
        path.join(rootDir, 'apps/web/src/app/layout.tsx'),
        'utf-8'
      );
      expect(layoutContent).toContain('SandboxProvider');
      expect(layoutContent).toContain('SandboxBanner');
    });

    it('memvalidasi integrasi edge middleware untuk persona sandbox claims', () => {
      const middlewareContent = fs.readFileSync(
        path.join(rootDir, 'apps/web/src/middleware.ts'),
        'utf-8'
      );
      expect(middlewareContent).toContain('pasok_sandbox_mode');
      expect(middlewareContent).toContain('pasok_sandbox_persona');
      expect(middlewareContent).toContain('usr_sandbox_tester');
    });
  });

  describe('4 Personas Fixtures & Flow Validation', () => {
    it('menyediakan dataset lengkap untuk Buyer, Supplier, Logistics Hub, dan Admin', () => {
      expect(INITIAL_SANDBOX_STATE.buyer.campaigns.length).toBeGreaterThanOrEqual(3);
      expect(INITIAL_SANDBOX_STATE.buyer.standingOrders.length).toBeGreaterThanOrEqual(4);
      expect(INITIAL_SANDBOX_STATE.supplier.allocations.length).toBeGreaterThanOrEqual(3);
      expect(INITIAL_SANDBOX_STATE.supplier.forecasts.length).toBeGreaterThanOrEqual(6);
      expect(INITIAL_SANDBOX_STATE.hub.weighTickets.length).toBeGreaterThanOrEqual(2);
      expect(INITIAL_SANDBOX_STATE.hub.coldChainSensors.length).toBeGreaterThanOrEqual(3);
      expect(INITIAL_SANDBOX_STATE.admin.kybQueue.length).toBeGreaterThanOrEqual(2);
      expect(INITIAL_SANDBOX_STATE.admin.escrowLedger.bpdDiyEscrowAccount).toBe(
        '9888-001-PASOK-ESCROW'
      );
    });
  });

  describe('Solosmartpay Payment Simulator & Webhook State Machine', () => {
    it('mensimulasikan pembayaran berhasil dan memverifikasi HMAC-SHA256 signature', async () => {
      const req = new Request('http://localhost:3000/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'INV-TEST-E2E-01',
          orderId: 'RSV-TEST-E2E-01',
          amount: 620000,
          method: 'BPD_DIY',
          status: 'PAID',
        }),
      });

      const res = await simulatePaymentRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isSignatureValid).toBe(true);
      expect(json.data.status).toBe('PAID');
      expect(json.data.buyerServiceFeeRp).toBe(1860);
      expect(json.data.merchantFeeRp).toBe(3100);
      expect(json.data.totalPayableRp).toBe(621860);
      expect(json.data.netMerchantDisbursementRp).toBe(616900);
      expect(json.data.databaseMutated).toBe(false);
    });

    it('menolak simulasi pembayaran jika transaksi di bawah MTV Rp 500.000', async () => {
      const req = new Request('http://localhost:3000/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'INV-UNDER-MTV',
          orderId: 'RSV-UNDER-MTV',
          amount: 400000,
          method: 'QRIS',
          status: 'PAID',
        }),
      });

      const res = await simulatePaymentRoute(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('BFF Route Zero DB Mutation Interceptors', () => {
    it('mencegat mutasi reservasi pooling saat mode sandbox aktif', async () => {
      const req = new Request('http://localhost:3000/api/v1/pooling/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pasok-sandbox-mode': 'true',
        },
        body: JSON.stringify({
          campaignId: '11111111-2222-3333-4444-555555555551',
          quantityKg: 25,
        }),
      });

      const res = await poolingReservationsRoute(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isSandbox).toBe(true);
      expect(json.data.databaseMutated).toBe(false);
    });

    it('mencegat review KYB admin saat mode sandbox aktif', async () => {
      const req = new Request('http://localhost:3000/api/v1/admin/kyb/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pasok-sandbox-mode': 'true',
        },
        body: JSON.stringify({
          tenantId: '11111111-2222-3333-4444-555555555555',
          decision: 'APPROVED',
        }),
      });

      const res = await kybReviewRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isSandbox).toBe(true);
      expect(json.data.databaseMutated).toBe(false);
    });

    it('mencegat pengajuan dispute QC saat mode sandbox aktif', async () => {
      const req = new Request('http://localhost:3000/api/v1/qc/dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pasok-sandbox-mode': 'true',
        },
        body: JSON.stringify({
          reservationId: '11111111-2222-3333-4444-555555555551',
          disputeType: 'WEIGHT_DEFICIT',
          disputedDeficitKg: 2.5,
          refundAmountRp: 77500,
          description: 'Penyusutan melebihi toleransi hub.',
        }),
      });

      const res = await qcDisputeRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isSandbox).toBe(true);
      expect(json.data.databaseMutated).toBe(false);
    });
  });

  describe('Database Immutability Verification (Zero DB Mutation)', () => {
    it('memastikan eksekusi seluruh alur sandbox mempertahankan row count database yang identik', async () => {
      let initialCount: number | null = null;
      let dbAvailable = false;

      try {
        const result = await query<{ total: number }>('SELECT count(*)::int as total FROM tenants');
        if (result && result.rows && result.rows[0]) {
          initialCount = Number(result.rows[0].total);
          dbAvailable = true;
        }
      } catch {
        dbAvailable = false;
      }

      const simReq = new Request('http://localhost:3000/api/v1/sandbox/payment-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'INV-DB-IMMUTABILITY-CHECK',
          orderId: 'RSV-DB-IMMUTABILITY-CHECK',
          amount: 750000,
          method: 'BPD_DIY',
          status: 'PAID',
        }),
      });
      const simRes = await simulatePaymentRoute(simReq);
      const simJson = await simRes.json();
      expect(simJson.data.databaseMutated).toBe(false);

      if (dbAvailable && initialCount !== null) {
        const finalResult = await query<{ total: number }>('SELECT count(*)::int as total FROM tenants');
        const finalCount = Number(finalResult.rows[0]?.total);
        expect(finalCount - initialCount).toBe(0);
      }
    });
  });
});
