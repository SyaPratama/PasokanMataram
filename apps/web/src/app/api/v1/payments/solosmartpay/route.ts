/**
 * @file apps/web/src/app/api/v1/payments/solosmartpay/route.ts
 * @description BFF API endpoint for generating Solosmartpay multi-channel payment invoices (QRIS & VA).
 * Implements dual-rail fee models (0.3% buyer system fee, 0.5% merchant platform fee).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SettlementService, type SolosmartpayMethod } from '@pasok/settlement-service';
import { verifySessionToken } from '@/lib/auth';

const settlementService = new SettlementService();

const CreatePaymentSchema = z.object({
  orderId: z.string().min(1),
  amountRp: z.number().positive(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  method: z.enum([
    'QRIS',
    'M2',
    'I1',
    'BR',
    'BT',
    'B1',
    'A1',
    'BV',
    'BPD_DIY',
    'OV',
    'DA',
    'SA',
    'LA',
  ]),
  returnUrl: z.string().url().optional(),
});

/**
 * Menerbitkan tagihan pembayaran baru via gateway Solosmartpay.
 * @param request HTTP POST Request.
 * @returns Respon JSON invoice pembayaran dengan VA number atau QRIS payload.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
      ?.split('=')[1];

    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const body = await request.json();

    const parseResult = CreatePaymentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parameter tagihan Solosmartpay tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const invoice = await settlementService.issuePaymentInvoice({
      ...parseResult.data,
      method: parseResult.data.method as SolosmartpayMethod,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          invoice,
          requesterTenantId: session?.tenantId,
        },
        message: 'Faktur pembayaran Solosmartpay berhasil diterbitkan.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal menerbitkan tagihan Solosmartpay.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_CREATION_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }
}
