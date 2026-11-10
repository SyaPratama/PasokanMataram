import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { withTenantContext } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface OutletRow extends RowDataPacket {
  readonly id: string;
  readonly name: string;
  readonly regency: string;
  readonly address: string;
  readonly isPrimary: boolean;
  readonly createdAt: string;
}

const OutletInputSchema = z.object({
  name: z.string().trim().min(1).max(150),
  regency: z.string().trim().min(1).max(32),
  address: z.string().trim().min(1).max(500),
  isPrimary: z.boolean().default(false),
});

function readSession(request: Request) {
  const cookie = (request.headers.get('cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('pasok_session=') || part.startsWith('session_token='));
  const token = cookie ? cookie.slice(cookie.indexOf('=') + 1) : null;
  return token ? verifySessionToken(token) : null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  try {
    const data = await withTenantContext(session, async (client) => {
      const [rows] = await client.query<OutletRow[]>(
        `SELECT id, outlet_name AS name, regency, address, is_primary AS isPrimary, CAST(created_at AS CHAR) AS createdAt
         FROM business_outlets
         WHERE tenant_id = ?
         ORDER BY is_primary DESC, outlet_name ASC`,
        [session.tenantId]
      );
      return rows;
    });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: 'Data gerai tidak tersedia.' }, { status: 503 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  try {
    const body: unknown = await request.json();
    const parsed = OutletInputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: 'Data gerai tidak valid.' }, { status: 400 });
    await withTenantContext(session, async (client) => {
      await client.query(
        `INSERT INTO business_outlets (id, tenant_id, outlet_name, regency, address, is_primary, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
        [session.tenantId, parsed.data.name, parsed.data.regency, parsed.data.address, parsed.data.isPrimary ? 1 : 0]
      );
    });
    return NextResponse.json({ success: true, message: 'Gerai berhasil didaftarkan.' });
  } catch {
    return NextResponse.json({ success: false, message: 'Gerai tidak dapat disimpan.' }, { status: 503 });
  }
}
