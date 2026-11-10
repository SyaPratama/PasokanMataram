/**
 * @file apps/web/src/app/api/v1/supplier/products/route.ts
 * @description Dynamic supplier products catalog API reading from MySQL 4NF supplier_products table
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { withTenantContext, query } from '@pasok/database';
import { verifySessionToken } from '@/lib/auth';

interface SupplierProductRow extends RowDataPacket {
  readonly id: string;
  readonly supplierTenantId: string;
  readonly supplierName: string;
  readonly regency: string;
  readonly name: string;
  readonly pricePerKg: number;
  readonly stockKg: number;
  readonly isAvailable: boolean;
  readonly createdAt: string;
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
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase().trim();
    const res = await query<SupplierProductRow>(
      `SELECT
         sp.id,
         sp.supplier_tenant_id AS supplierTenantId,
         t.business_name AS supplierName,
         t.regency,
         sp.commodity_name AS name,
         CAST(sp.price_per_kg AS SIGNED) AS pricePerKg,
         CAST(sp.stock_kg AS SIGNED) AS stockKg,
         sp.is_available AS isAvailable,
         sp.created_at AS createdAt
       FROM supplier_products sp
       JOIN tenants t ON t.id = sp.supplier_tenant_id
       WHERE sp.is_available = TRUE
       ORDER BY sp.commodity_name ASC`
    );
    const items = q
      ? res.rows.filter((item) =>
          item.name.toLowerCase().includes(q) ||
          item.supplierName.toLowerCase().includes(q) ||
          item.regency.toLowerCase().includes(q)
        )
      : res.rows;
    const data = items.map((item) => ({
      id: item.id,
      supplierTenantId: item.supplierTenantId,
      supplierName: item.supplierName,
      regency: item.regency,
      name: item.name,
      pricePerKg: Number(item.pricePerKg),
      stockKg: Number(item.stockKg),
      isAvailable: Boolean(item.isAvailable),
      createdAt: String(item.createdAt),
    }));
    return NextResponse.json({ success: true, data, count: data.length });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Katalog supplier tidak tersedia.' },
      { status: 503 }
    );
  }
}

interface ProductInput {
  readonly name: string;
  readonly price: number;
  readonly stockAvailable: number;
  readonly isReadyStock: boolean;
}

function parseProductInput(value: unknown): ProductInput | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.name !== 'string' ||
    typeof candidate.price !== 'number' ||
    !Number.isFinite(candidate.price) ||
    candidate.price <= 0 ||
    typeof candidate.stockAvailable !== 'number' ||
    !Number.isFinite(candidate.stockAvailable) ||
    candidate.stockAvailable < 0 ||
    typeof candidate.isReadyStock !== 'boolean'
  ) return null;
  return {
    name: candidate.name.trim(),
    price: candidate.price,
    stockAvailable: candidate.stockAvailable,
    isReadyStock: candidate.isReadyStock,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Sesi diperlukan.' }, { status: 401 });
  }
  const input = parseProductInput(await request.json());
  if (!input || input.name.length === 0) {
    return NextResponse.json({ success: false, message: 'Data produk tidak valid.' }, { status: 400 });
  }
  try {
    const productId = randomUUID();
    const data = await withTenantContext(session, async (client) => {
      await client.query(
        `INSERT INTO supplier_products (id, supplier_tenant_id, commodity_name, price_per_kg, stock_kg, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, session.tenantId, input.name, input.price, input.stockAvailable, input.isReadyStock]
      );
      const [rows] = await client.query<RowDataPacket[]>(
        `SELECT id, supplier_tenant_id AS supplierTenantId, commodity_name AS name,
                CAST(price_per_kg AS SIGNED) AS pricePerKg, CAST(stock_kg AS SIGNED) AS stockKg,
                is_available AS isAvailable, CAST(created_at AS CHAR) AS createdAt
         FROM supplier_products WHERE id = ? AND supplier_tenant_id = ?`,
        [productId, session.tenantId]
      );
      const row = rows[0];
      if (!row) throw new Error('Produk supplier tidak ditemukan setelah disimpan.');
      return row;
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: 'Produk supplier gagal disimpan.' }, { status: 503 });
  }
}
