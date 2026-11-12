/**
 * @file packages/database/src/adapters/ecosystem.ts
 * @description Database adapter for ecosystem business flow: campaigns, reservations, weighing, and escrow.
 * MySQL implementation with application-level multi-tenant isolation.
 */

import { randomUUID } from 'node:crypto';
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

type DatabaseRow = Record<string, unknown>;

const PLATFORM_FEE_RATE = 0.01;

function asText(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asIsoDate(value: unknown, fallbackMs = 0): string {
  if (value === null || value === undefined) {
    return new Date(fallbackMs).toISOString();
  }
  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? new Date(fallbackMs).toISOString() : parsed.toISOString();
}

export class MySQLEcosystemAdapter {
  public async listCampaigns(context: SecurityContext): Promise<PoolingCampaignRow[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<mysql.RowDataPacket[]>(
        `SELECT id, supplier_tenant_id, commodity_name, commodity_category,
                temperature_zone, target_quota_kg, allocated_quota_kg, price_per_kg,
                min_order_kg, status, starts_at, ends_at, created_at, updated_at
         FROM pooling_campaigns
         ORDER BY created_at DESC`
      );

      return rows.map((r) => ({
        id: asText(r.id),
        supplierTenantId: asText(r.supplier_tenant_id),
        commodityName: asText(r.commodity_name),
        commodityCategory: r.commodity_category as CommodityCategory,
        temperatureZone: r.temperature_zone as TemperatureZone,
        targetQuotaKg: asNumber(r.target_quota_kg),
        allocatedQuotaKg: asNumber(r.allocated_quota_kg),
        pricePerKg: asNumber(r.price_per_kg),
        minOrderKg: asNumber(r.min_order_kg),
        status: asText(r.status),
        startsAt: asIsoDate(r.starts_at),
        endsAt: asIsoDate(r.ends_at),
        createdAt: asIsoDate(r.created_at),
        updatedAt: asIsoDate(r.updated_at),
      }));
    });
  }

  public async createReservation(
    context: SecurityContext,
    input: CreateReservationInput
  ): Promise<{ reservation: PoolReservationRow; settlement: EscrowSettlementRow }> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const totalAmount = input.quantityKg * input.pricePerKg;

      const [campaignRows] = await client.query<mysql.RowDataPacket[]>(
        `SELECT id, supplier_tenant_id, target_quota_kg, allocated_quota_kg, status
         FROM pooling_campaigns WHERE id = ? FOR UPDATE`,
        [input.campaignId]
      );

      const campaign = campaignRows[0];
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      const supplierTenantId = asText(campaign.supplier_tenant_id) || context.tenantId;
      const reservationId = randomUUID();
      const vaSuffix = Math.floor(10000000 + Math.random() * 90000000);
      const vaNumber = `988810${vaSuffix}`;
      const paymentReference = `PAY-POOL-${Date.now()}`;

      await client.query(
        `INSERT INTO pool_reservations (
           id, campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
           total_amount_rp, status, delivery_address, va_number, payment_reference
         ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?, ?, ?)`,
        [reservationId, input.campaignId, context.tenantId, input.quantityKg, input.pricePerKg,
         totalAmount, input.deliveryAddress, vaNumber, paymentReference]
      );

      const [newReservation] = await client.query<mysql.RowDataPacket[]>(
        `SELECT id, campaign_id, buyer_tenant_id, quantity_kg, price_per_kg,
                total_amount_rp, status, delivery_address, va_number,
                payment_reference, created_at, updated_at
         FROM pool_reservations WHERE id = ?`,
        [reservationId]
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

      const settlementId = randomUUID();
      await client.query(
        `INSERT INTO escrow_settlements (
           id, reservation_id, escrow_account_number, locked_amount_rp, status
         ) VALUES (?, ?, ?, ?, 'ESCROW_LOCKED')`,
        [settlementId, reservationId, vaNumber, totalAmount]
      );

      const [newSettlement] = await client.query<mysql.RowDataPacket[]>(
        `SELECT id, reservation_id, escrow_account_number, locked_amount_rp,
                disbursed_amount_rp, status, locked_at, disbursed_at, dispute_reason,
                created_at, updated_at
         FROM escrow_settlements WHERE id = ?`,
        [settlementId]
      );

      const s = newSettlement[0];
      if (!s) {
        throw new Error('Failed to create settlement');
      }

      return {
        reservation: this.mapReservation(r as DatabaseRow),
        settlement: {
          ...this.mapSettlement(s as DatabaseRow),
          supplierTenantId,
          buyerTenantId: context.tenantId,
        },
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
      const weighingId = randomUUID();
      const weightDiff = tolerance.weightDifferenceKg;
      const deviationPercent = tolerance.shrinkagePercentage;

      await client.query(
        `INSERT INTO weighing_verifications (
           id, reservation_id, hub_id, operator_id, commodity_category,
           temperature_zone, measured_temp_celsius, manifest_weight_kg,
           actual_weight_kg, weight_difference_kg, shrinkage_percentage,
           tolerance_status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          weighingId,
          input.reservationId,
          'HUB-DEFAULT',
          context.userId,
          input.commodityCategory,
          input.temperatureZone,
          input.measuredTempCelsius,
          input.manifestWeightKg,
          input.actualWeightKg,
          weightDiff,
          deviationPercent,
          tolerance.toleranceStatus,
        ]
      );

      const [newRow] = await client.query<mysql.RowDataPacket[]>(
        `SELECT id, reservation_id, hub_id, manifest_weight_kg, actual_weight_kg,
                shrinkage_percentage, tolerance_status, operator_id, created_at
         FROM weighing_verifications WHERE id = ?`,
        [weighingId]
      );

      const row = newRow[0];
      if (!row) {
        throw new Error('Failed to store weighing verification');
      }

      return {
        id: asText(row.id),
        reservationId: asText(row.reservation_id),
        hubStationId: asText(row.hub_id),
        declaredWeightKg: asNumber(row.manifest_weight_kg),
        actualWeightKg: asNumber(row.actual_weight_kg),
        deviationPercent: asNumber(row.shrinkage_percentage),
        toleranceStatus: row.tolerance_status as WeighingToleranceStatus,
        teraInspectorNik: asText(row.operator_id),
        weighingTicketUrl: 'https://weighing.placeholder/ticket',
        createdAt: asIsoDate(row.created_at),
        updatedAt: asIsoDate(row.created_at),
      };
    });
  }

  public async getSettlementStatus(context: SecurityContext, reservationId: string): Promise<EscrowSettlementRow | null> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<mysql.RowDataPacket[]>(
        `SELECT es.id, es.reservation_id, es.escrow_account_number, es.locked_amount_rp,
                es.disbursed_amount_rp, es.status, es.locked_at, es.disbursed_at,
                es.dispute_reason, es.created_at, es.updated_at,
                pr.buyer_tenant_id, pc.supplier_tenant_id
         FROM escrow_settlements es
         JOIN pool_reservations pr ON pr.id = es.reservation_id
         JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
         WHERE es.reservation_id = ?
           AND (pr.buyer_tenant_id = ? OR pc.supplier_tenant_id = ? OR ? = 1)
         LIMIT 1`,
        [reservationId, context.tenantId, context.tenantId, context.isSuperAdmin ? 1 : 0]
      );
      return rows[0] ? this.mapSettlement(rows[0] as DatabaseRow) : null;
    });
  }

  public async listReservations(context: SecurityContext): Promise<PoolReservationRow[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<mysql.RowDataPacket[]>(
        `SELECT pr.id, pr.campaign_id, pr.buyer_tenant_id, pr.quantity_kg, pr.price_per_kg,
                pr.total_amount_rp, pr.status, pr.delivery_address, pr.va_number,
                pr.payment_reference, pr.created_at, pr.updated_at
         FROM pool_reservations pr
         JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
         WHERE (pr.buyer_tenant_id = ? OR pc.supplier_tenant_id = ? OR ? = 1)
         ORDER BY pr.created_at DESC`,
        [context.tenantId, context.tenantId, context.isSuperAdmin ? 1 : 0]
      );
      return rows.map((r) => this.mapReservation(r as DatabaseRow));
    });
  }

  public async listSettlements(context: SecurityContext): Promise<EscrowSettlementRow[]> {
    return withTenantContext(context, async (client: mysql.PoolConnection) => {
      const [rows] = await client.query<mysql.RowDataPacket[]>(
        `SELECT es.id, es.reservation_id, es.escrow_account_number, es.locked_amount_rp,
                es.disbursed_amount_rp, es.status, es.locked_at, es.disbursed_at,
                es.dispute_reason, es.created_at, es.updated_at,
                pr.buyer_tenant_id, pc.supplier_tenant_id
         FROM escrow_settlements es
         JOIN pool_reservations pr ON pr.id = es.reservation_id
         JOIN pooling_campaigns pc ON pc.id = pr.campaign_id
         WHERE (pr.buyer_tenant_id = ? OR pc.supplier_tenant_id = ? OR ? = 1)
         ORDER BY es.created_at DESC`,
        [context.tenantId, context.tenantId, context.isSuperAdmin ? 1 : 0]
      );
      return rows.map((r) => this.mapSettlement(r as DatabaseRow));
    });
  }

  private mapReservation(r: DatabaseRow): PoolReservationRow {
    return {
      id: asText(r.id),
      campaignId: asText(r.campaign_id),
      buyerTenantId: asText(r.buyer_tenant_id),
      quantityKg: asNumber(r.quantity_kg),
      pricePerKg: asNumber(r.price_per_kg),
      totalAmountRp: asNumber(r.total_amount_rp),
      status: r.status as ReservationStatus,
      deliveryAddress: asText(r.delivery_address),
      vaNumber: asText(r.va_number),
      paymentReference: asText(r.payment_reference),
      createdAt: asIsoDate(r.created_at),
      updatedAt: asIsoDate(r.updated_at),
    };
  }

  private mapSettlement(r: DatabaseRow): EscrowSettlementRow {
    const gross = asNumber(r.locked_amount_rp);
    const fee = Math.round(gross * PLATFORM_FEE_RATE);
    return {
      id: asText(r.id),
      reservationId: asText(r.reservation_id),
      supplierTenantId: asText(r.supplier_tenant_id),
      buyerTenantId: asText(r.buyer_tenant_id),
      grossAmountRp: gross,
      platformFeeRp: fee,
      netDisbursementRp: gross - fee,
      status: r.status as SettlementStatus,
      scheduledDisbursementAt: asIsoDate(r.disbursed_at, Date.now() + 86400000),
      disputeRefundRp: 0,
      createdAt: asIsoDate(r.created_at),
      updatedAt: asIsoDate(r.updated_at),
    };
  }
}

export const PostgresEcosystemAdapter = MySQLEcosystemAdapter;
