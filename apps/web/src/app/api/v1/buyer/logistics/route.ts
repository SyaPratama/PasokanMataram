import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { withTenantContext } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface LogisticsRow extends RowDataPacket {
  readonly id: string;
  readonly commodity: string;
  readonly quantityKg: number;
  readonly status: string;
  readonly deliveryAddress: string;
  readonly createdAt: string;
  readonly weighingId: string | null;
  readonly hubId: string | null;
  readonly manifestWeightKg: number | null;
  readonly actualWeightKg: number | null;
  readonly toleranceStatus: string | null;
  readonly operatorName: string | null;
  readonly weighedAt: string | null;
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
  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  }
  try {
    const rows = await withTenantContext(session, async (client) => {
      const [result] = await client.query<LogisticsRow[]>(
        `SELECT r.id,
                p.commodity_name AS commodity,
                CAST(r.quantity_kg AS SIGNED) AS quantityKg,
                r.status,
                r.delivery_address AS deliveryAddress,
                CAST(r.created_at AS CHAR) AS createdAt,
                w.id AS weighingId,
                w.hub_id AS hubId,
                CAST(w.manifest_weight_kg AS SIGNED) AS manifestWeightKg,
                CAST(w.actual_weight_kg AS SIGNED) AS actualWeightKg,
                w.tolerance_status AS toleranceStatus,
                op.full_name AS operatorName,
                CAST(w.created_at AS CHAR) AS weighedAt
         FROM pool_reservations r
         JOIN pooling_campaigns p ON p.id = r.campaign_id
         LEFT JOIN weighing_verifications w ON w.reservation_id = r.id
         LEFT JOIN users op ON op.id = w.operator_id
         WHERE r.buyer_tenant_id = ?
         ORDER BY r.created_at DESC
         LIMIT 100`,
        [session.tenantId]
      );
      return result;
    });
    const deliveries = rows.map((row) => ({
      id: row.id,
      commodity: row.commodity,
      quantityKg: Number(row.quantityKg),
      actualWeightKg: row.actualWeightKg === null ? null : Number(row.actualWeightKg),
      hubId: row.hubId,
      status: row.status,
      deliveryAddress: row.deliveryAddress,
      createdAt: row.createdAt,
    }));
    const qc = rows
      .filter((row) => row.weighingId !== null)
      .map((row) => ({
        id: row.weighingId as string,
        commodity: row.commodity,
        manifestWeightKg: Number(row.manifestWeightKg),
        actualWeightKg: Number(row.actualWeightKg),
        toleranceStatus: row.toleranceStatus as string,
        operatorName: row.operatorName || 'Operator belum tercatat',
        hubId: row.hubId as string,
        createdAt: row.weighedAt as string,
      }));
    return NextResponse.json({ success: true, data: { deliveries, qc } });
  } catch {
    return NextResponse.json({ success: false, message: 'Data logistik pembeli tidak tersedia.' }, { status: 503 });
  }
}
