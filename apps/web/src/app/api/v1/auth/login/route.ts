/**
 * @file apps/web/src/app/api/v1/auth/login/route.ts
 * @description Endpoint masuk real menggunakan TenantService.authenticateUser().
 * Validasi password dengan Argon2id, penerbitan session token, dan routing adaptif berbasis role.
 * Kepatuhan: Konstitusi Prinsip VI (Multi-tenant security).
 */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { LoginSchema } from '@/lib/validations/auth-schemas';
import { TenantService } from '@/services/tenant-service';
import { getSessionCookieOptions } from '@/lib/auth';
import { loginRateLimiter, checkRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const isLocal = ip === '127.0.0.1' || ip === 'localhost' || ip === '::1';
    const maxAttempts = isLocal ? 100 : 5;
    try {
      const rateResult = await checkRateLimit(`login:${ip}`, loginRateLimiter, maxAttempts);
      if (!rateResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Terlalu banyak percobaan masuk. Silakan tunggu 15 menit.',
            },
          },
          { status: 429 }
        );
      }
    } catch {
      // Graceful fallback if Redis rate limiter fails
    }

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

    const tenantType: string = tenant.tenantType;

    const response = NextResponse.json(
      {
        success: true,
        data: {
          tenantId: tenant.id,
          userId: user.id,
          businessName: tenant.businessName,
          userName: user.fullName,
          role: user.role,
          macroRole: user.role === 'SUPER_ADMIN'
            ? 'SUPER_ADMIN'
            : tenantType === 'HOREKA_BUYER' || tenantType === 'HOREKA'
              ? 'HOREKA'
              : tenantType === 'HUB_OPERATOR' || tenantType === 'LOGISTICS_HUB'
                ? 'HUB_OPERATOR'
                : 'GAPOKTAN',
          sessionToken,
        },
        sessionToken,
        message: 'Masuk berhasil.',
      },
      { status: 200 }
    );
    const isSecureRequest =
      request.headers.get('x-forwarded-proto') === 'https' ||
      new URL(request.url).protocol === 'https:';
    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, sessionToken, {
      ...cookieOptions,
      secure: cookieOptions.secure && isSecureRequest,
    });

    const xsrfToken = crypto.randomBytes(32).toString('hex');
    response.cookies.set('XSRF-TOKEN', xsrfToken, {
      httpOnly: false,
      sameSite: 'strict',
      secure: isSecureRequest,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[LOGIN ERROR]:', error);
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
