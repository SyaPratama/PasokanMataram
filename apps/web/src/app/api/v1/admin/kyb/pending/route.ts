import { NextResponse } from 'next/server';
import { AuditKybPendingQuerySchema } from '@/lib/validations/kyb-audit-schemas';
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

export async function GET(request: Request) {
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Hanya Super Admin yang diizinkan mengakses antrean audit.' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryResult = AuditKybPendingQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parameter antrean audit tidak valid.',
            details: queryResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const result = await TenantService.getPendingKybQueue(session, queryResult.data);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat antrean audit KYB.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QUEUE_FETCH_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }
}
