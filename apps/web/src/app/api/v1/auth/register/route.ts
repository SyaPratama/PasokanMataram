import { NextResponse } from 'next/server';
import { RegisterBusinessSchema } from '@/lib/validations/auth-schemas';
import { TenantService } from '@/services/tenant-service';
import { getSessionCookieOptions } from '@/lib/auth';

/**
 * Endpoint publik pendaftaran mandiri entitas usaha (HoReKa dan Gapoktan).
 * Menolak tegas percobaan pendaftaran publik untuk HUB_OPERATOR dan SUPER_ADMIN (403 Forbidden).
 * Kepatuhan: FR-001, FR-019, Konstitusi Prinsip XIII.
 * @param request HTTP POST Request.
 * @returns Respon JSON status pendaftaran dan cookie sesi HttpOnly.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const rawType = String(body.tenantType || body.macroRole || '');
    if (rawType === 'HUB_OPERATOR' || rawType === 'SUPER_ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLOSED_REGISTRATION_ROLE',
            message: 'Pendaftaran untuk peran operator logistik dan administrator hanya dapat diterbitkan melalui jalur tertutup oleh Super Admin.',
          },
        },
        { status: 403 }
      );
    }

    const parseResult = RegisterBusinessSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data formulir registrasi tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { tenant, user, sessionToken } = await TenantService.registerBusiness(parseResult.data);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          tenantId: tenant.id,
          userId: user.id,
          businessName: tenant.businessName,
          tenantType: tenant.tenantType,
          kybStatus: tenant.kybStatus,
          role: user.role,
        },
        message: 'Pendaftaran berhasil. Silakan lengkapi dokumen legalitas KYB.',
      },
      { status: 201 }
    );

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, sessionToken, cookieOptions);

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat memproses pendaftaran.';
    const isConflict = message.includes('sudah terdaftar');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isConflict ? 'EMAIL_ALREADY_EXISTS' : 'REGISTRATION_FAILED',
          message,
        },
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
