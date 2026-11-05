/**
 * @file apps/web/src/app/api/v1/orders/route.ts
 * @description Dynamic orders API reading and writing directly to MySQL pool_reservations table
 */

import { NextResponse } from 'next/server';
import { query } from '@pasok/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerTenantId = searchParams.get('buyerTenantId');
    const status = searchParams.get('status');

    let sql = `
      SELECT
        r.id,
        r.campaign_id as campaignId,
        p.commodity_name as commodity,
        t_supplier.business_name as supplierName,
        t_buyer.business_name as buyerName,
        CAST(r.quantity_kg AS SIGNED) as quantityKg,
        CAST(r.price_per_kg AS SIGNED) as pricePerKg,
        CAST(r.total_amount_rp AS SIGNED) as totalAmountRp,
        r.status,
        r.delivery_address as deliveryAddress,
        r.va_number as vaNumber,
        r.payment_reference as paymentReference,
        r.created_at as createdAt
      FROM pool_reservations r
      JOIN pooling_campaigns p ON p.id = r.campaign_id
      JOIN tenants t_supplier ON t_supplier.id = p.supplier_tenant_id
      JOIN tenants t_buyer ON t_buyer.id = r.buyer_tenant_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (buyerTenantId) {
      sql += ' AND r.buyer_tenant_id = ?';
      params.push(buyerTenantId);
    }

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const res = await query<any>(sql, params);
    const rows = res.rows || [];

    const data = rows.map((r: any) => ({
      id: `ORD-${r.id.slice(0, 8).toUpperCase()}`,
      uuid: r.id,
      commodity: r.commodity,
      supplierName: r.supplierName,
      buyerName: r.buyerName,
      quantityKg: Number(r.quantityKg) || 0,
      pricePerKg: Number(r.pricePerKg) || 0,
      totalAmountRp: Number(r.totalAmountRp) || 0,
      status: r.status,
      deliveryAddress: r.deliveryAddress,
      vaNumber: r.vaNumber,
      paymentReference: r.paymentReference,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat daftar pesanan.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
