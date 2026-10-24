/**
 * @file apps/web/src/app/api/v1/qc/dispute/route.ts
 * @description BFF API route handler for QC disputes delegating to @pasok/logistics-hub-service.
 * Enforces automated prorated escrow deductions and multi-tenant RLS isolation.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { SecurityContext } from '@pasok/domain';
import { LogisticsHubService } from '@pasok/logistics-hub-service';
import { verifySessionToken } from '@/lib/auth';

const logisticsHubService = new LogisticsHubService();

const QcDisputeSchema = z.object({
  reservationId: z.string().uuid(),
  disputeType: z.enum([
    'WEIGHT_DEFICIT',
    'TEMPERATURE_VIOLATION',
    'ROTTEN_SPOILED',
    'PACKAGING_DAMAGED',
  ]),
  disputedDeficitKg: z.number().nonnegative().optional(),
  refundAmountRp: z.number().nonnegative().optional(),
  evidencePhotoUrls: z.array(z.string()).optional().default([]),
  description: z.string().min(5),
});

/**
 * Menangani pengajuan dispute mutu bahan pangan dan selisih timbangan hub.
 * Melakukan pemotongan dana escrow prorata secara otomatis untuk mengembalikan hak pembeli.
 * @param request HTTP POST Request berisi data sanggahan QC.
 * @returns Respon JSON hasil investigasi dispute dan nominal penyesuaian dana escrow.
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

    const parseResult = QcDisputeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data pengajuan dispute QC tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const context: SecurityContext = {
      tenantId: session?.tenantId || '00000000-0000-0000-0000-000000000000',
      userId: session?.userId || 'OPERATOR_QC',
      role: session?.role || 'HUB_OPERATOR',
      isSuperAdmin: session?.role === 'SUPER_ADMIN',
    };

    const resolution = await logisticsHubService.processQcDispute(
      context,
      parseResult.data
    );

    return NextResponse.json(
      {
        success: true,
        data: resolution,
        message: 'Pengajuan dispute QC berhasil diproses dan dana escrow telah disesuaikan.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal memproses dispute QC.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DISPUTE_PROCESSING_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }
}
