/**
 * @file apps/web/src/app/api/v1/payments/create/route.ts
 * @description BFF proxy endpoint para criar invoice de pagamento.
 * Encaminha para apps/api settlement service, suportando todos os provedores.
 */

import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import type { PaymentProvider } from '@pasok/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Proxy payment invoice creation ke apps/api settlement endpoint.
 * Body accepts optional `provider` to override active gateway.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
      ?.split('=')[1];

    verifySessionToken(sessionCookie ?? '');
    const body = await request.json();

    const payload: Record<string, unknown> = {
      amount:        body.amountRp,
      reference:     body.orderId,
      description:   `Payment for ${body.customerName}`,
      customerName:  body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      paymentMethod: body.method,
    };

    if (body.provider) {
      payload.provider = body.provider as PaymentProvider;
    }

    const response = await fetch(`${API_BASE_URL}/api/settlement/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionCookie ? `Bearer ${sessionCookie}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} ${error}`);
    }

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membuat invoice';
    return NextResponse.json(
      { success: false, error: { code: 'PAYMENT_CREATION_FAILED', message } },
      { status: 500 }
    );
  }
}
