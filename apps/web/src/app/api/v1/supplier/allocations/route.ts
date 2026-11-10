import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { withTenantContext } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface AllocationRow extends RowDataPacket {
  readonly id: string;
  readonly commodity: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allocatedKg: number;
  readonly targetQuotaKg: number;
  readonly pricePerKg: number;
  readonly status: string;
}

function readSession(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split('; ')
    .find((row) => row.startsWith('pasok_session=') || row.startsWith('session_token='))
    ?.split('=')[1];
  return token ? verifySessionToken(token) : null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  }
  try {
    const data = await withTenantContext(session, async (client) => {
      const [rows] = await client.query<AllocationRow[]>(
        `SELECT id,
                commodity_name AS commodity,
                CAST(starts_at AS CHAR) AS startsAt,
                CAST(ends_at AS CHAR) AS endsAt,
                CAST(allocated_quota_kg AS SIGNED) AS allocatedKg,
                CAST(target_quota_kg AS SIGNED) AS targetQuotaKg,
                CAST(price_per_kg AS SIGNED) AS pricePerKg,
                status
         FROM pooling_campaigns
         WHERE supplier_tenant_id = ?
         ORDER BY starts_at DESC`,
        [session.tenantId]
      );
      return rows;
    });
    return NextResponse.json({ success: true, data, count: data.length });
  } catch {
    return NextResponse.json({ success: false, message: 'Alokasi supplier tidak tersedia.' }, { status: 503 });
  }
}
