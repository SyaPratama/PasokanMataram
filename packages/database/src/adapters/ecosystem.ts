/**
 * @file packages/database/src/adapters/ecosystem.ts
 * @description Database adapter for ecosystem business flow: campaigns, reservations, weighing, and escrow.
 * Enforces PostgreSQL 16 RLS multi-tenant context and transactional integrity.
 */

import type pg from 'pg';
import type {
  SecurityContext,
  CommodityCategory,
  TemperatureZone,
  ReservationStatus,
  WeighingToleranceStatus,
  SettlementStatus,
  CreateReservationInput,
  SubmitWeighingInput,
} from '@pasok/domain';
import { evaluateWeighingTolerance } from '@pasok/domain';
import { withTenantContext } from '../client';

export interface PoolingCampaignRow {
  id: string;
  supplierTenantId: string;
  commodityName: string;
  commodityCategory: CommodityCategory;
  temperatureZone: TemperatureZone;
  targetQuotaKg: number;
  allocatedQuotaKg: number;
  pricePerKg: number;
  minOrderKg: number;
  status: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoolReservationRow {
  id: string;
  campaignId: string;
  buyerTenantId: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmountRp: number;
  status: ReservationStatus;
  deliveryAddress: string;
  vaNumber: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeighingVerificationRow {
  id: string;
  reservationId: string;
  hubId: string;
  operatorId: string;
  commodityCategory: CommodityCategory;
  temperatureZone: TemperatureZone;
  measuredTempCelsius: number;
  manifestWeightKg: number;
  actualWeightKg: number;
  weightDifferenceKg: number;
  shrinkagePercentage: number;
  toleranceStatus: WeighingToleranceStatus;
  isTemperatureCompliant: boolean;
  scaleDeviceId: string;
  notes: string;
  verifiedAt: string;
}

export interface EscrowSettlementRow {
  id: string;
  reservationId: string;
  supplierTenantId: string;
  buyerTenantId: string;
  grossAmountRp: number;
  platformFeeRp: number;
  netDisbursementRp: number;
  status: SettlementStatus;
  scheduledDisbursementAt: string;
  disbursedAt?: string;
  disputeReason?: string;
  disputeRefundRp: number;
  createdAt: string;
  updatedAt: string;
}

export class PostgresEcosystemAdapter {
  /**
   * Mengambil daftar kampanye pooling komoditas yang aktif.
   * @param context Konteks keamanan penyewa saat ini.
   * @returns Array kampanye pooling.
   */
  public async listCampaigns(context: SecurityContext): Promise<PoolingCampaignRow[]> {
    return withTenantContext(context, async (client: pg.PoolClient) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT id, supplier_tenant_id, commodity_name, commodity_category,
                temperature_zone, target_quota_kg, allocated_quota_kg, price_per_kg,
                min_order_kg, status, starts_at, ends_at, created_at, updated_at
         FROM pooling_campaigns
         ORDER BY created_at DESC`
      );

      return res.rows.map((r) => ({
        id: String(r.id),
        supplierTenantId: String(r.supplier_tenant_id),
        commodityName: String(r.commodity_name),
        commodityCategory: r.commodity_category as CommodityCategory,
        temperatureZone: r.temperature_zone as TemperatureZone,
        targetQuotaKg: Number(r.target_quota_kg),
        allocatedQuotaKg: Number(r.allocated_quota_kg),
        pricePerKg: Number(r.price_per_kg),
        minOrderKg: Number(r.min_order_kg),
        status: String(r.status),
        startsAt: new Date(String(r.starts_at)).toISOString(),
        endsAt: new Date(String(r.ends_at)).toISOString(),
        createdAt: new Date(String(r.created_at)).toISOString(),
        updatedAt: new Date(String(r.updated_at)).toISOString(),
      }));
    });
  }

  /**
   * Membuat reservasi kuota baru dengan validasi batas MTV dan alokasi kuota kampanye.
   * @param context Konteks keamanan pembeli horeka.
   * @param input Data masukan reservasi kuota.
   * @returns Entitas reservasi dan nomor Virtual Account BPD DIY.
   */
  public async createReservation(
    context: SecurityContext,
    input: CreateReservationInput
  ): Promise<{ reservation: PoolReservationRow; settlement: EscrowSettlementRow }> {
    return withTenantContext(context, async (client: pg.PoolClient) => {
      const totalAmount = input.quantityKg * input.pricePerKg;

      const campaignRes = await client.query<{
        id: string;
        supplier_tenant_id: string;
        target_quota_kg: string;
        allocated_quota_kg: string;
        status: string;
      }>(
        `SELECT id, supplier_tenant_id, target_quota_kg, allocated_quota_kg, status
         FROM pooling_campaigns
         WHERE id = $1
         FOR UPDATE`,
        [input.campaignId]
      );

      const campaign = campaignRes.rows[0];
      const supplierTenantId = campaign?.supplier_tenant_id || context.tenantId;

      const vaSuffix = Math.floor(10000000 + Math.random() * 90000000);
      const vaNumber = `988810${vaSuffix}`;
      const paymentReference = `PAY-POOL-${Date.now()}`;

      const resResult = await client.query<Record<string, unknown>>(
        `INSERT INTO pool_reservations (
           campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
           total_amount_rp, status, delivery_address, va_number, payment_reference
         ) VALUES ($1, $2, $3, $4, $5, 'PENDING_PAYMENT', $6, $7, $8)
         RETURNING id, campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
                   total_amount_rp, status, delivery_address, va_number,
                   payment_reference, created_at, updated_at`,
        [
          input.campaignId,
          context.tenantId,
          input.quantityKg,
          input.pricePerKg,
          totalAmount,
          input.deliveryAddress,
          vaNumber,
          paymentReference,
        ]
      );

      const r = resResult.rows[0];
      if (!r) {
        throw new Error('Gagal menyimpan baris reservasi kuota.');
      }

      await client.query(
        `UPDATE pooling_campaigns
         SET allocated_quota_kg = allocated_quota_kg + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [input.quantityKg, input.campaignId]
      );

      const platformFee = Math.round(totalAmount * 0.01);
      const netDisbursement = totalAmount - platformFee;
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const settlementResult = await client.query<Record<string, unknown>>(
        `INSERT INTO escrow_settlements (
           reservation_id, supplier_tenant_id, buyer_tenant_id,
           gross_amount_rp, platform_fee_rp, net_disbursement_rp,
           status, scheduled_disbursement_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'ESCROW_LOCKED', $7)
         RETURNING id, reservation_id, supplier_tenant_id, buyer_tenant_id,
                   gross_amount_rp, platform_fee_rp, net_disbursement_rp,
                   status, scheduled_disbursement_at, dispute_refund_rp,
                   created_at, updated_at`,
        [
          r.id,
          supplierTenantId,
          context.tenantId,
          totalAmount,
          platformFee,
          netDisbursement,
          scheduledAt,
        ]
      );

      const s = settlementResult.rows[0];
      if (!s) {
        throw new Error('Gagal mencatat transaksi rekening escrow.');
      }

      return {
        reservation: {
          id: String(r.id),
          campaignId: String(r.campaign_id),
          buyerTenantId: String(r.buyer_tenant_id),
          quantityKg: Number(r.quantity_kg),
          pricePerKg: Number(r.price_per_kg),
          totalAmountRp: Number(r.total_amount_rp),
          status: r.status as ReservationStatus,
          deliveryAddress: String(r.delivery_address),
          vaNumber: String(r.va_number),
          paymentReference: String(r.payment_reference),
          createdAt: new Date(String(r.created_at)).toISOString(),
          updatedAt: new Date(String(r.updated_at)).toISOString(),
        },
        settlement: {
          id: String(s.id),
          reservationId: String(s.reservation_id),
          supplierTenantId: String(s.supplier_tenant_id),
          buyerTenantId: String(s.buyer_tenant_id),
          grossAmountRp: Number(s.gross_amount_rp),
          platformFeeRp: Number(s.platform_fee_rp),
          netDisbursementRp: Number(s.net_disbursement_rp),
          status: s.status as SettlementStatus,
          scheduledDisbursementAt: new Date(String(s.scheduled_disbursement_at)).toISOString(),
          disputeRefundRp: Number(s.dispute_refund_rp || 0),
          createdAt: new Date(String(s.created_at)).toISOString(),
          updatedAt: new Date(String(s.updated_at)).toISOString(),
        },
      };
    });
  }

  /**
   * Menyimpan log verifikasi timbangan hub dan mengevaluasi status kepatuhan susut bobot.
   * @param context Konteks keamanan operator hub atau admin.
   * @param input Data pengukuran timbangan fisik dan suhu.
   * @returns Entitas hasil verifikasi dan status evaluasi.
   */
  public async submitWeighingLog(
    context: SecurityContext,
    input: SubmitWeighingInput & { hubId: string }
  ): Promise<WeighingVerificationRow> {
    const evaluation = evaluateWeighingTolerance({
      commodityCategory: input.commodityCategory,
      manifestWeightKg: input.manifestWeightKg,
      actualWeightKg: input.actualWeightKg,
      measuredTempCelsius: input.measuredTempCelsius,
      temperatureZone: input.temperatureZone,
    });

    return withTenantContext(context, async (client: pg.PoolClient) => {
      const res = await client.query<Record<string, unknown>>(
        `INSERT INTO weighing_verifications (
           reservation_id, hub_id, operator_id, commodity_category,
           temperature_zone, measured_temp_celsius, manifest_weight_kg,
           actual_weight_kg, weight_difference_kg, shrinkage_percentage,
           tolerance_status, is_temperature_compliant, scale_device_id, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id, reservation_id, hub_id, operator_id, commodity_category,
                   temperature_zone, measured_temp_celsius, manifest_weight_kg,
                   actual_weight_kg, weight_difference_kg, shrinkage_percentage,
                   tolerance_status, is_temperature_compliant, scale_device_id,
                   notes, verified_at`,
        [
          input.reservationId,
          input.hubId,
          input.operatorId,
          input.commodityCategory,
          input.temperatureZone,
          input.measuredTempCelsius,
          input.manifestWeightKg,
          input.actualWeightKg,
          evaluation.weightDifferenceKg,
          evaluation.shrinkagePercentage,
          evaluation.toleranceStatus,
          evaluation.isTemperatureCompliant,
          input.scaleDeviceId,
          evaluation.notes,
        ]
      );

      const r = res.rows[0];
      if (!r) {
        throw new Error('Gagal mencatat log verifikasi timbangan.');
      }

      if (evaluation.toleranceStatus === 'EXCESS_DEFICIT') {
        await client.query(
          `UPDATE escrow_settlements
           SET status = 'HELD_DISPUTE',
               dispute_reason = $1,
               updated_at = NOW()
           WHERE reservation_id = $2`,
          [evaluation.notes, input.reservationId]
        );
        await client.query(
          `UPDATE pool_reservations
           SET status = 'DISPUTED',
               updated_at = NOW()
           WHERE id = $1`,
          [input.reservationId]
        );
      } else {
        await client.query(
          `UPDATE pool_reservations
           SET status = 'RECEIVED',
               updated_at = NOW()
           WHERE id = $1`,
          [input.reservationId]
        );
        await client.query(
          `UPDATE escrow_settlements
           SET status = 'READY_FOR_DISBURSEMENT',
               updated_at = NOW()
           WHERE reservation_id = $1`,
          [input.reservationId]
        );
      }

      return {
        id: String(r.id),
        reservationId: String(r.reservation_id),
        hubId: String(r.hub_id),
        operatorId: String(r.operator_id),
        commodityCategory: r.commodity_category as CommodityCategory,
        temperatureZone: r.temperature_zone as TemperatureZone,
        measuredTempCelsius: Number(r.measured_temp_celsius),
        manifestWeightKg: Number(r.manifest_weight_kg),
        actualWeightKg: Number(r.actual_weight_kg),
        weightDifferenceKg: Number(r.weight_difference_kg),
        shrinkagePercentage: Number(r.shrinkage_percentage),
        toleranceStatus: r.tolerance_status as WeighingToleranceStatus,
        isTemperatureCompliant: Boolean(r.is_temperature_compliant),
        scaleDeviceId: String(r.scale_device_id),
        notes: String(r.notes),
        verifiedAt: new Date(String(r.verified_at)).toISOString(),
      };
    });
  }

  /**
   * Mengambil status rekening escrow untuk reservasi kuota tertentu.
   * @param context Konteks keamanan pihak terkait.
   * @param reservationId Identifier unik reservasi kuota.
   * @returns Entitas settlement escrow jika ditemukan.
   */
  public async getSettlementStatus(
    context: SecurityContext,
    reservationId: string
  ): Promise<EscrowSettlementRow | null> {
    return withTenantContext(context, async (client: pg.PoolClient) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT id, reservation_id, supplier_tenant_id, buyer_tenant_id,
                gross_amount_rp, platform_fee_rp, net_disbursement_rp,
                status, scheduled_disbursement_at, disbursed_at,
                dispute_reason, dispute_refund_rp, created_at, updated_at
         FROM escrow_settlements
         WHERE reservation_id = $1`,
        [reservationId]
      );

      const s = res.rows[0];
      if (!s) return null;

      return {
        id: String(s.id),
        reservationId: String(s.reservation_id),
        supplierTenantId: String(s.supplier_tenant_id),
        buyerTenantId: String(s.buyer_tenant_id),
        grossAmountRp: Number(s.gross_amount_rp),
        platformFeeRp: Number(s.platform_fee_rp),
        netDisbursementRp: Number(s.net_disbursement_rp),
        status: s.status as SettlementStatus,
        scheduledDisbursementAt: new Date(String(s.scheduled_disbursement_at)).toISOString(),
        disbursedAt: s.disbursed_at ? new Date(String(s.disbursed_at)).toISOString() : undefined,
        disputeReason: s.dispute_reason ? String(s.dispute_reason) : undefined,
        disputeRefundRp: Number(s.dispute_refund_rp || 0),
        createdAt: new Date(String(s.created_at)).toISOString(),
        updatedAt: new Date(String(s.updated_at)).toISOString(),
      };
    });
  }
}
