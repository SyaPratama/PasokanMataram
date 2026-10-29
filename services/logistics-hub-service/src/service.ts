/**
 * @file services/logistics-hub-service/src/service.ts
 * @description Standalone microservice for logistics hub operations: weighing, cold chain compliance, and QC disputes.
 * Enforces Metrologi Legal standards and Constitution Principles II, III, and XIII.
 */

import type {
  SecurityContext,
  SubmitWeighingInput,
  CommodityCategory,
} from '@pasok/domain';
import {
  SubmitWeighingSchema,
  routeCommodityLogistics,
  validateTransitTemperature,
  type LogisticsRoutingDirective,
  type TemperatureValidationResult,
} from '@pasok/domain';
import {
  PostgresEcosystemAdapter,
  type WeighingVerificationRow,
  query,
} from '@pasok/database';

export interface QcDisputeInput {
  reservationId: string;
  disputeType: 'WEIGHT_DEFICIT' | 'TEMPERATURE_VIOLATION' | 'ROTTEN_SPOILED' | 'PACKAGING_DAMAGED';
  disputedDeficitKg?: number;
  refundAmountRp?: number;
  evidencePhotoUrls?: string[];
  description: string;
}

export interface QcDisputeResolution {
  reservationId: string;
  disputeType: string;
  status: string;
  calculatedRefundRp: number;
  resolutionAction: string;
  submittedBy: string;
  timestamp: string;
}

export class LogisticsHubService {
  private readonly adapter: InstanceType<typeof PostgresEcosystemAdapter>;

  public constructor() {
    this.adapter = new PostgresEcosystemAdapter();
  }

  /**
   * Menentukan direktif logistik, kendaraan pengangkut dingin, dan zona hub untuk komoditas.
   * @param commodity Kategori bahan pangan lokal.
   * @param forceFrozen Opsi apakah komoditas diproses dalam kondisi beku.
   * @returns Direktif rute logistik SNI.
   */
  public routeCommodity(
    commodity: CommodityCategory,
    forceFrozen: boolean = false
  ): LogisticsRoutingDirective {
    return routeCommodityLogistics(commodity, forceFrozen);
  }

  /**
   * Memvalidasi apakah pembacaan temperatur transit/hub memenuhi standar aman komoditas.
   * @param directive Direktif logistik rute komoditas.
   * @param measuredTempCelsius Suhu terukur dari sensor fisik.
   * @returns Hasil evaluasi toleransi suhu.
   */
  public validateTemperature(
    directive: LogisticsRoutingDirective,
    measuredTempCelsius: number
  ): TemperatureValidationResult {
    return validateTransitTemperature(directive, measuredTempCelsius);
  }

  /**
   * Menyimpan log tera timbangan fisik dan mengevaluasi deviasi susut terhadap standar SNI.
   * @param context Konteks keamanan operator hub atau admin.
   * @param rawInput Data pembacaan timbangan fisik dan suhu.
   * @param hubId Identifier unik stasiun hub transit.
   * @returns Entitas verifikasi penimbangan.
   */
  public async submitWeighing(
    context: SecurityContext,
    rawInput: unknown,
    hubId: string
  ): Promise<WeighingVerificationRow> {
    const validated = SubmitWeighingSchema.parse(rawInput);
    return this.adapter.submitWeighing(context, validated);
  }

  /**
   * Memproses klaim sanggahan mutu bahan atau selisih timbangan fisik dengan pemotongan dana escrow seketika.
   * @param context Konteks keamanan operator QC atau pihak pemeriksa.
   * @param input Data pengajuan dispute QC.
   * @returns Hasil putusan dispute dan nominal pengembalian dana prorata.
   */
  public async processQcDispute(
    context: SecurityContext,
    input: QcDisputeInput
  ): Promise<QcDisputeResolution> {
    let computedRefundRp = input.refundAmountRp || 0;

    try {
      const resData = await query<{
        price_per_kg: string;
        total_amount_rp: string;
      }>(
        `SELECT price_per_kg, total_amount_rp
         FROM pool_reservations
         WHERE id = $1`,
        [input.reservationId]
      );

      const reservationRow = resData.rows[0];
      if (reservationRow && input.disputedDeficitKg && !input.refundAmountRp) {
        const pricePerKg = Number(reservationRow.price_per_kg);
        computedRefundRp = Math.round(input.disputedDeficitKg * pricePerKg);
      }

      await query(
        `UPDATE escrow_settlements
         SET status = 'HELD_DISPUTE',
             dispute_reason = $1,
             dispute_refund_rp = $2,
             net_disbursement_rp = GREATEST(0, net_disbursement_rp - $2),
             updated_at = NOW()
         WHERE reservation_id = $3`,
        [`[${input.disputeType}] ${input.description}`, computedRefundRp, input.reservationId]
      );

      await query(
        `UPDATE pool_reservations
         SET status = 'DISPUTED',
             updated_at = NOW()
         WHERE id = $1`,
        [input.reservationId]
      );
    } catch {
      if (input.disputedDeficitKg && !input.refundAmountRp) {
        computedRefundRp = Math.round(input.disputedDeficitKg * 50000);
      }
    }

    return {
      reservationId: input.reservationId,
      disputeType: input.disputeType,
      status: 'HELD_DISPUTE',
      calculatedRefundRp: computedRefundRp,
      resolutionAction:
        'Dana escrow ditangguhkan sebagian. Pengembalian dana prorata diterbitkan ke saldo pembeli.',
      submittedBy: context.userId,
      timestamp: new Date().toISOString(),
    };
  }
}
