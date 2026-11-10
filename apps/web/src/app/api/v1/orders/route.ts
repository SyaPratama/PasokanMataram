import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { withTenantContext } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface OrderRow extends RowDataPacket {
  readonly id: string;
  readonly campaignId: string;
  readonly commodity: string;
  readonly supplierName: string;
  readonly buyerName: string;
  readonly quantityKg: number;
  readonly pricePerKg: number;
  readonly totalAmountRp: number;
  readonly status: string;
  readonly deliveryAddress: string;
  readonly vaNumber: string | null;
  readonly paymentReference: string | null;
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
    const status = new URL(request.url).searchParams.get('status');
    const data = await withTenantContext(session, async (client) => {
      const params: unknown[] = [session.tenantId];
      const statusClause = status ? ' AND r.status = ?' : '';
      if (status) params.push(status);
      const [rows] = await client.query<OrderRow[]>(
        `SELECT r.id,
                r.campaign_id AS campaignId,
                p.commodity_name AS commodity,
                supplier.business_name AS supplierName,
                buyer.business_name AS buyerName,
                CAST(r.quantity_kg AS SIGNED) AS quantityKg,
                CAST(r.price_per_kg AS SIGNED) AS pricePerKg,
                CAST(r.total_amount_rp AS SIGNED) AS totalAmountRp,
                r.status,
                r.delivery_address AS deliveryAddress,
                r.va_number AS vaNumber,
                r.payment_reference AS paymentReference,
                CAST(r.created_at AS CHAR) AS createdAt
         FROM pool_reservations r
         JOIN pooling_campaigns p ON p.id = r.campaign_id
         JOIN tenants supplier ON supplier.id = p.supplier_tenant_id
         JOIN tenants buyer ON buyer.id = r.buyer_tenant_id
         WHERE r.buyer_tenant_id = ?${statusClause}
         ORDER BY r.created_at DESC
         LIMIT 100`,
        params
      );
      return rows;
    });
    return NextResponse.json({
      success: true,
      data: data.map((row) => ({
        id: `ORD-${row.id.slice(0, 8).toUpperCase()}`,
        uuid: row.id,
        campaignId: row.campaignId,
        commodity: row.commodity,
        supplierName: row.supplierName,
        buyerName: row.buyerName,
        quantityKg: Number(row.quantityKg),
        pricePerKg: Number(row.pricePerKg),
        totalAmountRp: Number(row.totalAmountRp),
        status: row.status,
        deliveryAddress: row.deliveryAddress,
        vaNumber: row.vaNumber,
        paymentReference: row.paymentReference,
        createdAt: row.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Data pesanan tidak tersedia.' }, { status: 503 });
  }
}
