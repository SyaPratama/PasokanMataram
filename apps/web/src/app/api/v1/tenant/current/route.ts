/**
 * @file apps/web/src/app/api/v1/tenant/current/route.ts
 * @description Endpoint mengambil data tenant aktif berdasarkan session token.
 * Digunakan dashboard pages untuk menampilkan identity real tanpa mock data.
 * Kepatuhan: Konstitusi Prinsip VI (Multi-tenant security).
 */

import { NextResponse } from 'next/server';
import { getTenantIdFromCookie } from '@/lib/auth';
import { TenantService } from '@/services/tenant-service';

export async function GET(): Promise<NextResponse> {
  try {
    const tenantId = getTenantIdFromCookie();
    if (!tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Sesi pengguna tidak valid.',
          },
        },
        { status: 401 }
      );
    }

    const tenant = await TenantService.getTenantById(tenantId);

    return NextResponse.json(
      {
        success: true,
        data: {
          tenantId: tenant.id,
          businessName: tenant.businessName,
          tenantType: tenant.tenantType,
          regency: tenant.regency,
          kybStatus: tenant.kybStatus,
          macroRole: tenant.tenantType === 'HOREKA_BUYER' ? 'HOREKA' : 'GAPOKTAN',
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat memuat data tenant.';

    if (message.includes('tidak ditemukan')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TENANT_NOT_FOUND',
            message,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
