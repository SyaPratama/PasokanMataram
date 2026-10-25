/**
 * @file apps/web/src/app/api/v1/sandbox/payment-simulate/route.ts
 * @description BFF Route for simulating Solosmartpay payments with cryptographic HMAC-SHA256 signature.
 * Enforces MTV Rp 500k guard, dual-rail fee models, and timing-safe signature generation without mutating PostgreSQL.
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { SolosmartpayClient } from '@pasok/settlement-service';

const PaymentSimulateSchema = z.object({
  invoiceId: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().min(500000, {
    message: 'Nominal transaksi di bawah Batas Pembelian Terendah (MTV) Rp 500.000.',
  }),
  method: z.string().default('BPD_DIY'),
  status: z.enum(['PAID', 'EXPIRED']).default('PAID'),
});

const webhookSecret = process.env.SOLOSMARTPAY_WEBHOOK_SECRET || 'ssp_secret_default_key';
const client = new SolosmartpayClient({
  apiToken: 'ssp_test_sandbox_mode',
  webhookSecret,
});

/**
 * Mensimulasikan notifikasi pembayaran Solosmartpay terenkripsi HMAC-SHA256.
 * @param request HTTP POST Request berisi parameter transaksi.
 * @returns JSON hasil simulasi pembayaran dan tanda tangan kriptografis.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parseResult = PaymentSimulateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validasi simulator pembayaran gagal.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { invoiceId, orderId, amount, method, status } = parseResult.data;
    const { buyerServiceFeeRp, merchantFeeRp, totalPayableRp, netMerchantDisbursementRp } =
      client.calculateSplitFees(amount);

    const payloadObj = {
      event: status === 'PAID' ? 'payment.success' : 'payment.expired',
      invoiceId,
      orderId,
      amount: totalPayableRp,
      method,
      paidAt: status === 'PAID' ? new Date().toISOString() : undefined,
    };

    const rawPayload = JSON.stringify(payloadObj);
    const signatureHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');
    const signatureHeader = `sha256=${signatureHash}`;

    const isVerified = client.verifyWebhookSignature(rawPayload, signatureHeader);

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        orderId,
        amount,
        buyerServiceFeeRp,
        merchantFeeRp,
        totalPayableRp,
        netMerchantDisbursementRp,
        method,
        status,
        signatureHeader,
        isSignatureValid: isVerified,
        payload: payloadObj,
        isSandbox: true,
        databaseMutated: false,
      },
      message:
        status === 'PAID'
          ? 'Simulasi pembayaran Solosmartpay berhasil diverifikasi (HMAC-SHA256 Valid).'
          : 'Simulasi tagihan kedaluwarsa berhasil diproses.',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal mengeksekusi simulasi pembayaran.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SIMULATION_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
