import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2';
import { withTenantContext } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface TeamRow extends RowDataPacket {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
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
      const [rows] = await client.query<TeamRow[]>(
        `SELECT id, full_name AS name, email, role,
                CASE WHEN is_active = TRUE THEN 'ACTIVE' ELSE 'INACTIVE' END AS status
         FROM users
         WHERE tenant_id = ?
         ORDER BY created_at ASC
         LIMIT 100`,
        [session.tenantId]
      );
      return rows;
    });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: 'Data tim tidak tersedia.' }, { status: 503 });
  }
}
