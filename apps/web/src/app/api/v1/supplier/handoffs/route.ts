import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { withTenantContext } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface HandoffRow extends RowDataPacket {
  readonly id: string;
  readonly commodity: string;
  readonly sentKg: number;
  readonly hubScaleKg: number | null;
  readonly hubId: string | null;
  readonly operatorName: string | null;
  readonly status: string;
  readonly createdAt: string;
}

function readSession(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('pasok_session=') || part.startsWith('session_token='));
  const token = cookie ? cookie.slice(cookie.indexOf('=') + 1) : null;
  return token ? verifySessionToken(token) : null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  try {
    const data = await withTenantContext(session, async (client) => {
      const [rows] = await client.query<HandoffRow[]>(
        `SELECT r.id,
                p.commodity_name AS commodity,
                CAST(r.quantity_kg AS SIGNED) AS sentKg,
                CAST(w.actual_weight_kg AS SIGNED) AS hubScaleKg,
                w.hub_id AS hubId,
                op.full_name AS operatorName,
                COALESCE(w.tolerance_status, r.status) AS status,
                CAST(COALESCE(w.created_at, r.created_at) AS CHAR) AS createdAt
         FROM pool_reservations r
         JOIN pooling_campaigns p ON p.id = r.campaign_id
         LEFT JOIN weighing_verifications w ON w.reservation_id = r.id
         LEFT JOIN users op ON op.id = w.operator_id
         WHERE p.supplier_tenant_id = ?
         ORDER BY r.created_at DESC
         LIMIT 100`,
        [session.tenantId]
      );
      return rows.map((row) => ({
        ...row,
        sentKg: Number(row.sentKg),
        hubScaleKg: row.hubScaleKg === null ? null : Number(row.hubScaleKg),
      }));
    });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: 'Data serah terima supplier tidak tersedia.' }, { status: 503 });
  }
}
