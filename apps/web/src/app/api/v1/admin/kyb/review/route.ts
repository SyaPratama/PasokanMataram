import { NextResponse } from 'next/server';
import { AuditKybReviewSchema } from '@/lib/validations/kyb-audit-schemas';
import { TenantService } from '@/services/tenant-service';
import { verifySessionToken } from '@/lib/auth';

function getAdminSession(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifySessionToken(authHeader.substring(7));
  }
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/(?:pasok_session|session_token)=([^;]+)/);
  return match?.[1] ? verifySessionToken(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    const session = getAdminSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid atau telah berakhir.' } },
        { status: 401 }
      );
    }

    if (!session.isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Akses ditolak: Memerlukan wewenang Super Admin.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = AuditKybReviewSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payload review tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const reviewResult = await TenantService.reviewKybSubmission(session, parseResult.data);

    return NextResponse.json({
      success: true,
      data: reviewResult,
      message: 'Keputusan verifikasi berhasil diperbarui dan notifikasi telah dikirim ke mitra.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses keputusan verifikasi KYB.';
    const isNotFound = message.includes('tidak ditemukan');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isNotFound ? 'TENANT_NOT_FOUND' : 'REVIEW_FAILED',
          message,
        },
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
