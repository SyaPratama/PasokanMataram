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
    const cookieHeader = request.headers.get('cookie') || '';
    const isSandbox =
      request.headers.get('x-pasok-sandbox-mode') === 'true' ||
      cookieHeader.includes('pasok_sandbox_mode=true');

    const body = await request.json();

    if (isSandbox) {
      const quantityKg = Number(body.quantityKg) || 0;
      const estimatedUnitPrice = 31000;
      const totalValue = quantityKg * estimatedUnitPrice;
      if (totalValue < 500000) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Batas pembelian terendah (MTV) adalah minimal Rp 500.000.',
            },
          },
          { status: 400 }
        );
      }
      const mockVa = `988810${Math.floor(10000000 + Math.random() * 90000000)}`;
      return NextResponse.json(
        {
          success: true,
          data: {
            reservationId: `RSV-SBX-${Date.now().toString().slice(-4)}`,
            campaignId: body.campaignId || 'POOL-BWR-SRI-09',
            quantityKg,
            totalAmountRp: totalValue,
            paymentInstructions: {
              vaNumber: mockVa,
              bankName: 'Bank BPD DIY',
              escrowAccount: 'PASOK MATARAM ESCROW',
            },
            isSandbox: true,
            databaseMutated: false,
          },
          message: 'Reservasi kuota pooling berhasil dibuat (Mode Sandbox: Zero DB Mutation).',
        },
        { status: 201 }
      );
    }
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
    const cookieHeader = request.headers.get('cookie') || '';
    const isSandbox =
      request.headers.get('x-pasok-sandbox-mode') === 'true' ||
      cookieHeader.includes('pasok_sandbox_mode=true');

    if (isSandbox) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'POOL-BWR-SRI-09',
            commodity: 'Bawang Merah Srikayangan Super A',
            targetQuotaKg: 1000,
            currentCollectedKg: 850,
            participantsCount: 38,
            closingHoursLeft: 4,
            normalPricePerKg: 36000,
            pooledPricePerKg: 31000,
            savingPercent: 13.8,
            status: 'OPEN',
          },
          {
            id: 'POOL-CBI-PAN-05',
            commodity: 'Cabai Rawit Merah Panjatan Segar',
            targetQuotaKg: 500,
            currentCollectedKg: 490,
            participantsCount: 22,
            closingHoursLeft: 2,
            normalPricePerKg: 54000,
            pooledPricePerKg: 46500,
            savingPercent: 13.9,
            status: 'NEARING_TARGET',
          },
          {
            id: 'POOL-BRS-SEY-12',
            commodity: 'Beras Premium Pandan Wangi Seyegan',
            targetQuotaKg: 2000,
            currentCollectedKg: 2000,
            participantsCount: 45,
            closingHoursLeft: 0,
            normalPricePerKg: 17000,
            pooledPricePerKg: 14800,
            savingPercent: 12.9,
            status: 'LOCKED',
          },
        ],
      });
    }
    const sessionCookie = cookieHeader
      .split('; ')
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
