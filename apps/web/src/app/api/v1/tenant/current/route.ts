/**
 * @file apps/web/src/app/api/v1/tenant/current/route.ts
 * @description API endpoint to retrieve current tenant identity and profile.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface TenantIdentityRow {
  tenant_id: string;
  business_name: string;
  tenant_type: string;
  regency: string;
  kyb_status: string;
}

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('pasok_session')?.value || cookieStore.get('session_token')?.value;
  const claims = sessionToken ? verifySessionToken(sessionToken) : null;
  if (!claims) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid.' } },
      { status: 401 }
    );
  }

  try {
    const result = await query<TenantIdentityRow>(
      `SELECT t.id AS tenant_id, t.business_name, t.tenant_type, t.regency, t.kyb_status
       FROM tenants t
       JOIN users u ON u.tenant_id = t.id
       WHERE t.id = ? AND u.id = ? AND u.is_active = TRUE
       LIMIT 1`,
      [claims.tenantId, claims.userId]
    );
    const row = result.rows[0];
    if (!row) {
      return NextResponse.json(
        { success: false, error: { code: 'IDENTITY_NOT_FOUND', message: 'Identitas tenant tidak ditemukan.' } },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        tenantId: row.tenant_id,
        businessName: row.business_name,
        tenantType: row.tenant_type,
        regency: row.regency,
        kybStatus: row.kyb_status,
        macroRole: claims.macroRole,
        microRole: claims.microRole,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'IDENTITY_UNAVAILABLE', message: 'Identitas tenant tidak dapat dimuat.' } },
      { status: 503 }
    );
  }
}
