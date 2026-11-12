/**
 * @file apps/api/src/buyer/buyer.service.ts
 * @description NestJS service for HoReKa kitchen buyers: outlets, orders, catalog, and reviews.
 * Enforces PostgreSQL 16 RLS multi-tenant isolation and domain invariants.
 */

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { SecurityContext } from '@pasok/domain';
import { withTenantContext } from '@pasok/database';
export interface CreateOutletDto {
  name: string;
  address: string;
  regency: string;
  phone: string;
  isPrimary?: boolean;
}

export interface SubmitReviewDto {
  targetTenantId: string;
  reservationId: string;
  rating: number;
  comment: string;
}

@Injectable()
export class BuyerService {
  /**
   * Mengambil daftar outlet dapur/cabang milik pembeli horeka saat ini.
   * @param context Konteks keamanan penyewa pembeli.
   * @returns Array outlet dapur.
   */
  public async getOutlets(context: SecurityContext) {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query(
        `SELECT id, tenant_id, outlet_name, address, regency, phone_number, is_active, created_at
         FROM business_outlets
         WHERE tenant_id = ?
         ORDER BY created_at DESC`,
        [context.tenantId]
      );
      return rows;
    });
  }

  /**
   * Mendaftarkan outlet dapur baru untuk pengiriman subuh terjadwal.
   * @param context Konteks penyewa pembeli.
   * @param dto Data masukan outlet.
   * @returns Data outlet yang berhasil dibuat.
   */
  public async createOutlet(context: SecurityContext, dto: CreateOutletDto) {
    const outletId = randomUUID();
    return await withTenantContext(context, async (client) => {
      await client.query(
        `INSERT INTO business_outlets (id, tenant_id, outlet_name, address, regency, phone_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [outletId, context.tenantId, dto.name, dto.address, dto.regency, dto.phone]
      );
      const [rows] = await client.query(
        `SELECT id, tenant_id, outlet_name, address, regency, phone_number, is_active, created_at
         FROM business_outlets WHERE id = ?`,
        [outletId]
      );
      return (rows as unknown[])[0];
    });
  }

  /**
   * Mengambil riwayat standing orders dan reservasi pengadaan dapur pembeli.
   * @param context Konteks keamanan penyewa pembeli.
   * @returns Array riwayat pesanan.
   */
  public async getOrders(context: SecurityContext) {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query(
        `SELECT pr.id, pr.campaign_id, pr.quantity_kg, pr.price_per_kg,
                pr.total_amount_rp, pr.status, pr.delivery_address, pr.va_number,
                pr.created_at, pc.commodity_name, pc.temperature_zone
         FROM pool_reservations pr
         JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
         WHERE pr.buyer_tenant_id = ?
         ORDER BY pr.created_at DESC`,
        [context.tenantId]
      );
      return rows;
    });
  }

  /**
   * Mengambil katalog etalase multi-SKU bahan pangan lokal DIY dari kelompok tani terverifikasi.
   * @returns Array produk multi-SKU.
   */
  public async getCatalog(context: SecurityContext) {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query(
        `SELECT sp.id,
                sp.supplier_tenant_id,
                t.business_name AS supplier_name,
                sp.commodity_name,
                sp.price_per_kg,
                sp.stock_kg,
                sp.is_available,
                sp.created_at
         FROM supplier_products sp
         JOIN tenants t ON t.id = sp.supplier_tenant_id
         WHERE sp.is_available = TRUE
         ORDER BY sp.commodity_name ASC`
      );
      return rows;
    });
  }

  /**
   * Mengirimkan ulasan B2B dua arah terhadap supplier pangan lokal.
   * @param context Konteks pembeli.
   * @param dto Data ulasan dan rating.
   * @returns Status penerimaan ulasan.
   */
  public async submitReview(context: SecurityContext, dto: SubmitReviewDto) {
    const reviewId = randomUUID();
    return await withTenantContext(context, async (client) => {
      const [reservations] = await client.query(
        `SELECT pr.id
         FROM pool_reservations pr
         JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
         WHERE pr.id = ? AND pr.buyer_tenant_id = ? AND pc.supplier_tenant_id = ?`,
        [dto.reservationId, context.tenantId, dto.targetTenantId]
      );
      if (!Array.isArray(reservations) || reservations.length === 0) {
        throw new Error('Reservasi tidak ditemukan untuk tenant yang terautentikasi.');
      }
      await client.query(
        `INSERT INTO b2b_reviews (id, reviewer_tenant_id, reviewee_tenant_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [reviewId, context.tenantId, dto.targetTenantId, dto.rating, dto.comment]
      );
      return {
        reviewId,
        authorTenantId: context.tenantId,
        targetTenantId: dto.targetTenantId,
        rating: dto.rating,
        comment: dto.comment,
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
      };
    });
  }

}
