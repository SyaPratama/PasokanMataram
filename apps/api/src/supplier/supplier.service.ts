/**
 * @file apps/api/src/supplier/supplier.service.ts
 * @description NestJS service for Gapoktan and food suppliers: product catalog, harvest allocations, and dispatch.
 * Enforces PostgreSQL 16 RLS multi-tenant isolation and domain invariants.
 */

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import type { SecurityContext } from '@pasok/domain';
import { withTenantContext } from '@pasok/database';
interface SupplierMetricsRow extends RowDataPacket {
  readonly totalRevenueRp: number | string;
  readonly activeSkuCount: number | string;
  readonly fulfillmentRatePercent: number | string;
  readonly averageRating: number | string;
  readonly reviewCount: number | string;
  readonly nextSubuhDeliveryOrders: number | string;
}

interface SupplierProductRow extends RowDataPacket {
  readonly id: string;
  readonly supplier_tenant_id: string;
  readonly commodity_name: string;
  readonly price_per_kg: number;
  readonly stock_kg: number;
  readonly is_available: boolean;
  readonly created_at: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  stockAvailable: number;
  isReadyStock: boolean;
}

export interface DispatchOrderDto {
  orderId: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  temperatureCelsius: number;
  fulfillmentModel: 'POOL_GROUP_BUYING' | 'DIRECT_DISPATCH' | 'CROSS_DOCK';
}

@Injectable()
export class SupplierService {
  /**
   * Mengambil daftar produk etalase milik supplier yang sedang aktif.
   * @param context Konteks keamanan penyewa supplier.
   * @returns Array produk etalase.
   */
  public async getProducts(context: SecurityContext) {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query<SupplierProductRow[]>(
        `SELECT id, supplier_tenant_id, commodity_name, price_per_kg, stock_kg, is_available, created_at
         FROM supplier_products
         WHERE supplier_tenant_id = ?
         ORDER BY created_at DESC`,
        [context.tenantId]
      );
      return rows;
    });
  }

  /**
   * Mendaftarkan atau memperbarui SKU dagangan produk supplier.
   * @param context Konteks penyewa supplier.
   * @param dto Data masukan produk.
   * @returns Entitas produk tersimpan.
   */
  public async createProduct(context: SecurityContext, dto: CreateProductDto) {
    const productId = randomUUID();
    return await withTenantContext(context, async (client) => {
      await client.query(
        `INSERT INTO supplier_products (id, supplier_tenant_id, commodity_name, price_per_kg, stock_kg, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, context.tenantId, dto.name, dto.price, dto.stockAvailable, dto.isReadyStock]
      );
      const [rows] = await client.query<SupplierProductRow[]>(
        `SELECT id, supplier_tenant_id, commodity_name, price_per_kg, stock_kg, is_available, created_at
         FROM supplier_products WHERE id = ? AND supplier_tenant_id = ?`,
        [productId, context.tenantId]
      );
      const row = rows[0];
      if (!row) throw new Error('Produk supplier tidak ditemukan setelah disimpan.');
      return row;
    });
  }

  /**
   * Mengambil komitmen alokasi kuota panen massal yang sedang berjalan.
   * @param context Konteks penyewa supplier.
   * @returns Array alokasi kuota panen.
   */
  public async getAllocations(context: SecurityContext) {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query(
        `SELECT id, commodity_name, target_quota_kg, allocated_quota_kg,
                price_per_kg, status, starts_at, ends_at
         FROM pooling_campaigns
         WHERE supplier_tenant_id = ?
         ORDER BY created_at DESC`,
        [context.tenantId]
      );
      return rows;
    });
  }

  /**
   * Mengambil metrik kinerja dashboard supplier (omzet, rating, pemenuhan pengiriman).
   * @param context Konteks penyewa supplier.
   * @returns Ringkasan metrik analitik.
   */
  public async getDashboardMetrics(context: SecurityContext) {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query<SupplierMetricsRow[]>(
        `SELECT
           COALESCE((SELECT SUM(pr.total_amount_rp)
             FROM pool_reservations pr
             JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
             WHERE pc.supplier_tenant_id = ? AND pr.status IN ('PAID', 'ALLOCATED', 'RECEIVED')), 0) AS totalRevenueRp,
           (SELECT COUNT(*) FROM supplier_products WHERE supplier_tenant_id = ? AND is_available = TRUE) AS activeSkuCount,
           COALESCE((SELECT ROUND(100 * SUM(pr.status = 'RECEIVED') / NULLIF(COUNT(*), 0), 1)
             FROM pool_reservations pr
             JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
             WHERE pc.supplier_tenant_id = ?), 0) AS fulfillmentRatePercent,
           COALESCE((SELECT AVG(r.rating) FROM b2b_reviews r WHERE r.reviewee_tenant_id = ?), 0) AS averageRating,
           (SELECT COUNT(*) FROM b2b_reviews WHERE reviewee_tenant_id = ?) AS reviewCount,
           (SELECT COUNT(*)
             FROM pool_reservations pr
             JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
             WHERE pc.supplier_tenant_id = ? AND pr.status IN ('PAID', 'ALLOCATED')) AS nextSubuhDeliveryOrders`,
        [context.tenantId, context.tenantId, context.tenantId, context.tenantId, context.tenantId, context.tenantId]
      );
      const row = rows[0];
      if (!row) throw new Error('Metrik supplier tidak tersedia.');
      return {
        supplierTenantId: context.tenantId,
        totalRevenueRp: Number(row.totalRevenueRp),
        activeSkuCount: Number(row.activeSkuCount),
        fulfillmentRatePercent: Number(row.fulfillmentRatePercent),
        averageRating: Number(row.averageRating),
        reviewCount: Number(row.reviewCount),
        nextSubuhDeliveryOrders: Number(row.nextSubuhDeliveryOrders),
      };
    });
  }

  /**
   * Menerbitkan status keberangkatan armada pengiriman komoditas supplier.
   * @param context Konteks penyewa supplier.
   * @param dto Rincian keberangkatan armada.
   * @returns Manifest surat jalan pengiriman.
   */
  public async dispatchDelivery(_context: SecurityContext, _dto: DispatchOrderDto): Promise<never> {
    throw new Error('Penerbitan manifest belum didukung oleh skema basis data saat ini.');
  }
}
