/**
 * @file apps/web/src/app/api/v1/outlets/route.ts
 * @description Dynamic outlets API reading from MySQL 4NF business_outlets table
 */

import { NextResponse } from 'next/server';
import { query } from '@pasok/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const regency = searchParams.get('regency');

    let sql = `
      SELECT
        id,
        tenant_id as tenantId,
        outlet_name as name,
        regency,
        address,
        is_primary as isPrimary,
        created_at as createdAt
      FROM business_outlets
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (tenantId) {
      sql += ' AND tenant_id = ?';
      params.push(tenantId);
    }

    if (regency && regency !== 'ALL' && regency !== 'SEMUA') {
      sql += ' AND regency = ?';
      params.push(regency);
    }

    sql += ' ORDER BY is_primary DESC, outlet_name ASC';

    const res = await query<any>(sql, params);
    return NextResponse.json({
      success: true,
      data: res.rows || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat data gerai.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, name, regency, address, isPrimary } = body;

    if (!name || !regency || !address) {
      return NextResponse.json(
        { success: false, error: 'Nama gerai, wilayah, dan alamat wajib diisi.' },
        { status: 400 }
      );
    }

    const targetTenantId = tenantId || '10000000-0000-0000-0000-000000000001';

    await query(
      `INSERT INTO business_outlets (id, tenant_id, outlet_name, regency, address, is_primary, created_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
      [targetTenantId, name, regency, address, isPrimary ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      message: 'Gerai berhasil didaftarkan.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menambahkan gerai.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
