/**
 * @file apps/web/src/app/api/v1/payments/solosmartpay/route.ts
 * @description BFF proxy endpoint untuk settlement API.
 * Forwards requests ke apps/api settlement service.
 */

import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Proxy payment invoice creation ke apps/api settlement endpoint.
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

    const response = await fetch(`${API_BASE_URL}/api/settlement/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionCookie ? `Bearer ${sessionCookie}` : '',
      },
      body: JSON.stringify({
        amount: body.amountRp,
        reference: body.orderId,
        description: `Payment for ${body.customerName}`,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        paymentMethod: body.method,
      }),
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
      {
        success: false,
        error: { code: 'PAYMENT_CREATION_FAILED', message },
      },
      { status: 500 }
    );
  }
}
