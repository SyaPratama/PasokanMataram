/**
 * @file apps/web/src/app/api/v1/pooling/reservations/route.ts
 * @description BFF API route handler for pooling reservations delegating to @pasok/pooling-service.
 * Enforces MTV minimum Rp 500k, distributed quota locking, and multi-tenant isolation.
 */

import { NextResponse } from 'next/server';
import type { SecurityContext } from '@pasok/domain';
import { PoolingService } from '@pasok/pooling-service';
import { verifySessionToken } from '@/lib/auth';

const poolingService = new PoolingService();

/**
 * Endpoint BFF untuk reservasi kuota pooling horeka.
 * @param request HTTP POST Request.
 * @returns Respon JSON rincian reservasi dan instruksi pembayaran VA Bank BPD DIY.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
      ?.split('=')[1];

    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const context: SecurityContext = {
      tenantId: session?.tenantId || (body.buyerTenantId as string) || '00000000-0000-0000-0000-000000000000',
      userId: session?.userId || '00000000-0000-0000-0000-000000000000',
      role: session?.role || 'BUYER',
      isSuperAdmin: session?.role === 'SUPER_ADMIN',
    };

    const result = await poolingService.createReservation(context, body);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message:
          'Reservasi kuota pooling berhasil dibuat. Sila selesaikan transfer ke rekening escrow Bank BPD DIY.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kegagalan sistem saat memproses reservasi kuota.';
    const isValidation = message.includes('minimal Rp 500.000') || message.includes('Invalid');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isValidation ? 'VALIDATION_ERROR' : 'RESERVATION_FAILED',
          message,
        },
      },
      { status: isValidation ? 400 : 500 }
    );
  }
}

/**
 * Endpoint BFF untuk mengambil daftar kampanye pooling aktif.
 * @param request HTTP GET Request.
 * @returns Respon JSON array kampanye aktif.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const sessionCookie = request.headers
      .get('cookie')
      ?.split('; ')
      .find((row) => row.startsWith('session_token='))
      ?.split('=')[1];

    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const context: SecurityContext = {
      tenantId: session?.tenantId || '00000000-0000-0000-0000-000000000000',
      userId: session?.userId || '00000000-0000-0000-0000-000000000000',
      role: session?.role || 'BUYER',
      isSuperAdmin: session?.role === 'SUPER_ADMIN',
    };

    const campaigns = await poolingService.listActiveCampaigns(context);

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal memuat kampanye pooling.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_CAMPAIGNS_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }
}
