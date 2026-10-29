/**
 * @file packages/database/src/adapters/ecosystem.ts
 * @description Database adapter for ecosystem business flow: campaigns, reservations, weighing, and escrow.
 * MySQL implementation with application-level multi-tenant isolation.
 */

import type mysql from 'mysql2/promise';
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
  hubStationId: string;
  declaredWeightKg: number;
  actualWeightKg: number;
  deviationPercent: number;
  toleranceStatus: WeighingToleranceStatus;
  teraInspectorNik: string;
  weighingTicketUrl: string;
  createdAt: string;
  updatedAt: string;
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
  disputeRefundRp: number;
  createdAt: string;
  updatedAt: string;
}

export class MySQLEcosystemAdapter {
  public async listCampaigns(context: SecurityContext): Promise<PoolingCampaignRow[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<any[]>(
        `SELECT id, supplier_tenant_id, commodity_name, commodity_category,
                temperature_zone, target_quota_kg, allocated_quota_kg, price_per_kg,
                min_order_kg, status, starts_at, ends_at, created_at, updated_at
         FROM pooling_campaigns
         ORDER BY created_at DESC`
      );

      return rows.map((r: any) => ({
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
        startsAt: new Date(r.starts_at).toISOString(),
        endsAt: new Date(r.ends_at).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));
    });
  }

  public async createReservation(
    context: SecurityContext,
    input: CreateReservationInput
  ): Promise<{ reservation: PoolReservationRow; settlement: EscrowSettlementRow }> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const totalAmount = input.quantityKg * input.pricePerKg;

      const [campaignRows] = await client.query<any[]>(
        `SELECT id, supplier_tenant_id, target_quota_kg, allocated_quota_kg, status
         FROM pooling_campaigns WHERE id = ? FOR UPDATE`,
        [input.campaignId]
      );

      const campaign = campaignRows[0];
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      const supplierTenantId = campaign.supplier_tenant_id || context.tenantId;

      const vaSuffix = Math.floor(10000000 + Math.random() * 90000000);
      const vaNumber = `988810${vaSuffix}`;
      const paymentReference = `PAY-POOL-${Date.now()}`;

      const [resResult] = await client.query<any>(
        `INSERT INTO pool_reservations (
           campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
           total_amount_rp, status, delivery_address, va_number, payment_reference
         ) VALUES (?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?, ?, ?)`,
        [input.campaignId, context.tenantId, input.quantityKg, input.pricePerKg,
         totalAmount, input.deliveryAddress, vaNumber, paymentReference]
      );

      const [newReservation] = await client.query<any[]>(
        `SELECT id, campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
                total_amount_rp, status, delivery_address, va_number,
                payment_reference, created_at, updated_at
         FROM pool_reservations WHERE id = ?`,
        [resResult.insertId]
      );

      const r = newReservation[0];
      if (!r) {
        throw new Error('Failed to create reservation');
      }

      await client.query(
        `UPDATE pooling_campaigns
         SET allocated_quota_kg = allocated_quota_kg + ?,
             updated_at = NOW()
         WHERE id = ?`,
        [input.quantityKg, input.campaignId]
      );

      const platformFee = Math.round(totalAmount * 0.01);
      const netDisbursement = totalAmount - platformFee;
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const [settlementResult] = await client.query<any>(
        `INSERT INTO escrow_settlements (
           reservation_id, supplier_tenant_id, buyer_tenant_id,
           gross_amount_rp, platform_fee_rp, net_disbursement_rp,
           status, scheduled_disbursement_at
         ) VALUES (?, ?, ?, ?, ?, ?, 'ESCROW_LOCKED', ?)`,
        [r.id, supplierTenantId, context.tenantId, totalAmount, platformFee, netDisbursement, scheduledAt]
      );

      const [newSettlement] = await client.query<any[]>(
        `SELECT id, reservation_id, supplier_tenant_id, buyer_tenant_id,
                gross_amount_rp, platform_fee_rp, net_disbursement_rp,
                status, scheduled_disbursement_at, dispute_refund_rp,
                created_at, updated_at
         FROM escrow_settlements WHERE id = ?`,
        [settlementResult.insertId]
      );

      const s = newSettlement[0];
      if (!s) {
        throw new Error('Failed to create settlement');
      }

      return {
        reservation: this.mapReservation(r),
        settlement: this.mapSettlement(s),
      };
    });
  }
  public async submitWeighing(context: SecurityContext, input: SubmitWeighingInput): Promise<WeighingVerificationRow> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const tolerance = evaluateWeighingTolerance({
        commodityCategory: input.commodityCategory,
        manifestWeightKg: input.manifestWeightKg,
        actualWeightKg: input.actualWeightKg,
        measuredTempCelsius: input.measuredTempCelsius,
        temperatureZone: input.temperatureZone,
      });

      const weightDiff = tolerance.weightDifferenceKg;
      const deviationPercent = tolerance.shrinkagePercentage;

      const [result] = await client.query<any>(
        `INSERT INTO weighing_verifications (
           reservation_id, hub_station_id, declared_weight_kg, actual_weight_kg,
           deviation_percent, tolerance_status, tera_inspector_nik, weighing_ticket_url
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.reservationId,
          'HUB-DEFAULT',
          input.manifestWeightKg,
          input.actualWeightKg,
          deviationPercent,
          tolerance.toleranceStatus,
          input.operatorId,
          'https://weighing.placeholder/ticket'
        ]
      );

      const [newRow] = await client.query<any[]>(
        `SELECT id, reservation_id, hub_station_id, declared_weight_kg, actual_weight_kg,
                deviation_percent, tolerance_status, tera_inspector_nik, weighing_ticket_url,
                created_at, updated_at
         FROM weighing_verifications WHERE id = ?`,
        [result.insertId]
      );

      return this.mapWeighing(newRow[0]);
    });
  }

  public async getSettlementStatus(context: SecurityContext, reservationId: string): Promise<EscrowSettlementRow | null> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<any[]>(
        `SELECT id, reservation_id, supplier_tenant_id, buyer_tenant_id,
                gross_amount_rp, platform_fee_rp, net_disbursement_rp,
                status, scheduled_disbursement_at, dispute_refund_rp,
                created_at, updated_at
         FROM escrow_settlements
         WHERE reservation_id = ?
         LIMIT 1`,
        [reservationId]
      );
      return rows[0] ? this.mapSettlement(rows[0]) : null;
    });
  }

  public async listReservations(context: SecurityContext): Promise<PoolReservationRow[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<any[]>(
        `SELECT id, campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
                total_amount_rp, status, delivery_address, va_number,
                payment_reference, created_at, updated_at
         FROM pool_reservations
         ORDER BY created_at DESC`
      );
      return rows.map((r: any) => this.mapReservation(r));
    });
  }

  public async listSettlements(context: SecurityContext): Promise<EscrowSettlementRow[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<any[]>(
        `SELECT id, reservation_id, supplier_tenant_id, buyer_tenant_id,
                gross_amount_rp, platform_fee_rp, net_disbursement_rp,
                status, scheduled_disbursement_at, dispute_refund_rp,
                created_at, updated_at
         FROM escrow_settlements
         ORDER BY created_at DESC`
      );
      return rows.map((r: any) => this.mapSettlement(r));
    });
  }

  private mapReservation(r: any): PoolReservationRow {
    return {
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
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    };
  }

  private mapSettlement(r: any): EscrowSettlementRow {
    return {
      id: String(r.id),
      reservationId: String(r.reservation_id),
      supplierTenantId: String(r.supplier_tenant_id),
      buyerTenantId: String(r.buyer_tenant_id),
      grossAmountRp: Number(r.gross_amount_rp),
      platformFeeRp: Number(r.platform_fee_rp),
      netDisbursementRp: Number(r.net_disbursement_rp),
      status: r.status as SettlementStatus,
      scheduledDisbursementAt: new Date(r.scheduled_disbursement_at).toISOString(),
      disputeRefundRp: Number(r.dispute_refund_rp || 0),
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    };
  }

  private mapWeighing(r: any): WeighingVerificationRow {
    return {
      id: String(r.id),
      reservationId: String(r.reservation_id),
      hubStationId: String(r.hub_station_id),
      declaredWeightKg: Number(r.declared_weight_kg),
      actualWeightKg: Number(r.actual_weight_kg),
      deviationPercent: Number(r.deviation_percent),
      toleranceStatus: r.tolerance_status as WeighingToleranceStatus,
      teraInspectorNik: String(r.tera_inspector_nik),
      weighingTicketUrl: String(r.weighing_ticket_url),
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    };
  }
}

export const PostgresEcosystemAdapter = MySQLEcosystemAdapter;
