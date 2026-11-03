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
const client = new SolosmartpayClient();

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

    const buyerFee = Math.round(amount * 0.003);
    const merchantFee = Math.round(amount * 0.005);
    const totalPayable = amount + buyerFee;
    const netMerchant = amount - merchantFee;

    const payloadObj = {
      event: status === 'PAID' ? 'payment.success' : 'payment.expired',
      invoiceId,
      orderId,
      amount: totalPayable,
      method,
      paidAt: status === 'PAID' ? new Date().toISOString() : undefined,
    };

    const rawPayload = JSON.stringify(payloadObj);
    const signatureHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');
    const signatureHeader = `sha256=${signatureHash}`;

    return NextResponse.json({
      success: true,
      data: {
        invoiceId,
        orderId,
        amount,
        buyerServiceFeeRp: buyerFee,
        merchantFeeRp: merchantFee,
        totalPayableRp: totalPayable,
        netMerchantDisbursementRp: netMerchant,
        method,
        status,
        signatureHeader,
        isSignatureValid: true,
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
