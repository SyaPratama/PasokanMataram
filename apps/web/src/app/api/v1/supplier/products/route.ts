/**
 * @file apps/web/src/app/api/v1/supplier/products/route.ts
 * @description Dynamic supplier products catalog API reading from MySQL 4NF supplier_products table
 */

import { NextResponse } from 'next/server';
import { query } from '@pasok/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierTenantId = searchParams.get('supplierTenantId');
    const q = searchParams.get('q')?.toLowerCase().trim();

    let sql = `
      SELECT
        sp.id,
        sp.supplier_tenant_id as supplierTenantId,
        t.business_name as supplierName,
        t.regency,
        sp.commodity_name as name,
        CAST(sp.price_per_kg AS SIGNED) as pricePerKg,
        CAST(sp.stock_kg AS SIGNED) as stockKg,
        sp.is_available as isAvailable,
        sp.created_at as createdAt
      FROM supplier_products sp
      JOIN tenants t ON t.id = sp.supplier_tenant_id
      WHERE sp.is_available = TRUE
    `;
    const params: unknown[] = [];

    if (supplierTenantId) {
      sql += ' AND sp.supplier_tenant_id = ?';
      params.push(supplierTenantId);
    }

    sql += ' ORDER BY sp.commodity_name ASC';

    const res = await query<any>(sql, params);
    let items = res.rows || [];

    if (q) {
      items = items.filter(
        (i: any) =>
          i.name.toLowerCase().includes(q) ||
          i.supplierName.toLowerCase().includes(q) ||
          (i.regency || '').toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat katalog produk supplier.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
