/**
 * @file apps/web/src/app/api/v1/auth/login/route.ts
 * @description Endpoint masuk real menggunakan TenantService.authenticateUser().
 * Validasi password dengan Argon2id, penerbitan session token, dan routing adaptif berbasis role.
 * Kepatuhan: Konstitusi Prinsip VI (Multi-tenant security).
 */

import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations/auth-schemas';
import { TenantService } from '@/services/tenant-service';
import { getSessionCookieOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data kredensial tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { user, tenant, sessionToken } = await TenantService.authenticateUser(
      parseResult.data.email,
      parseResult.data.password
    );

    const response = NextResponse.json(
      {
        success: true,
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: user.role,
          macroRole: tenant.tenantType === 'HOREKA_BUYER' ? 'HOREKA' : 'GAPOKTAN',
        },
        message: 'Masuk berhasil.',
      },
      { status: 200 }
    );

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, sessionToken, cookieOptions);

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat memproses masuk.';

    if (message.includes('tidak valid') || message.includes('tidak aktif')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Alamat surel atau kata sandi tidak sesuai.',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Terjadi kesalahan sistem saat memproses masuk.',
        },
      },
      { status: 500 }
    );
  }
}
