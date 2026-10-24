/**
 * @file packages/domain/src/schemas/ecosystem-flow.ts
 * @description Zod validation schemas and tolerance calculation utilities for ecosystem business flow.
 * Complies with MTV Rp 500.000 rule, SNI cold chain standards, and metrology tolerance governance.
 */

import { z } from 'zod';
import type {
  CommodityCategory,
  TemperatureZone,
  WeighingToleranceStatus,
  ToleranceThreshold,
} from '../types/ecosystem';

export const MINIMUM_TRANSACTION_VALUE_RP = 500_000;

export const COMMODITY_TOLERANCES: Record<CommodityCategory, ToleranceThreshold> = {
  MEAT: {
    minTempCelsius: 0,
    maxTempCelsius: 4,
    maxShrinkagePercent: 1.0,
    warningShrinkagePercent: 0.5,
  },
  MILK: {
    minTempCelsius: 0,
    maxTempCelsius: 4,
    maxShrinkagePercent: 1.0,
    warningShrinkagePercent: 0.5,
  },
  PERISHABLE_VEGETABLE: {
    minTempCelsius: 20,
    maxTempCelsius: 28,
    maxShrinkagePercent: 5.0,
    warningShrinkagePercent: 3.0,
  },
  GRAIN: {
    minTempCelsius: 20,
    maxTempCelsius: 32,
    maxShrinkagePercent: 0.5,
    warningShrinkagePercent: 0.2,
  },
  PROCESSED: {
    minTempCelsius: -18,
    maxTempCelsius: 25,
    maxShrinkagePercent: 0.5,
    warningShrinkagePercent: 0.0,
  },
};

export const CreateReservationSchema = z
  .object({
    campaignId: z.string().uuid(),
    buyerTenantId: z.string().uuid(),
    quantityKg: z.number().positive(),
    pricePerKg: z.number().positive(),
    deliveryAddress: z.string().min(5),
  })
  .superRefine((data, ctx) => {
    const totalAmount = data.quantityKg * data.pricePerKg;
    if (totalAmount < MINIMUM_TRANSACTION_VALUE_RP) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quantityKg'],
        message: 'Nilai transaksi reservasi pooling minimal Rp 500.000 untuk efisiensi escrow BPD DIY.',
      });
    }
  });

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;

export const SubmitWeighingSchema = z.object({
  reservationId: z.string().uuid(),
  commodityCategory: z.enum(['MEAT', 'MILK', 'PERISHABLE_VEGETABLE', 'GRAIN', 'PROCESSED']),
  temperatureZone: z.enum(['FROZEN', 'CHILLED', 'AMBIENT_VENTILATED']),
  measuredTempCelsius: z.number(),
  manifestWeightKg: z.number().positive(),
  actualWeightKg: z.number().positive(),
  scaleDeviceId: z.string().min(1),
  operatorId: z.string().uuid(),
});

export type SubmitWeighingInput = z.infer<typeof SubmitWeighingSchema>;

export const FunnelTelemetrySchema = z.object({
  step: z.enum(['CAMPAIGN_VIEWED', 'QUANTITY_SELECTED', 'RESERVATION_CREATED', 'PAYMENT_COMPLETED']),
  campaignId: z.string().uuid(),
  buyerTenantId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export type FunnelTelemetryInput = z.infer<typeof FunnelTelemetrySchema>;

export interface WeighingEvaluationResult {
  toleranceStatus: WeighingToleranceStatus;
  weightDifferenceKg: number;
  shrinkagePercentage: number;
  maxAllowedShrinkagePercent: number;
  isTemperatureCompliant: boolean;
  notes: string;
}

/**
 * Mengevaluasi deviasi susut timbangan fisik komoditas terhadap ambang toleransi SNI.
 * @param params Parameter evaluasi timbangan dan suhu.
 * @returns Hasil analisis toleransi metrologi.
 */
export function evaluateWeighingTolerance(params: {
  commodityCategory: CommodityCategory;
  manifestWeightKg: number;
  actualWeightKg: number;
  measuredTempCelsius: number;
  temperatureZone: TemperatureZone;
}): WeighingEvaluationResult {
  if (!params.manifestWeightKg || params.manifestWeightKg <= 0) {
    throw new TypeError('Bobot manifest wajib bernilai positif.');
  }
  const threshold = COMMODITY_TOLERANCES[params.commodityCategory];
  const weightDiff = params.actualWeightKg - params.manifestWeightKg;

  let toleranceStatus: WeighingToleranceStatus = 'WITHIN_TOLERANCE';
  let shrinkagePercentage = 0;

  if (weightDiff >= 0) {
    toleranceStatus = weightDiff > 0 ? 'SURPLUS' : 'WITHIN_TOLERANCE';
  } else {
    shrinkagePercentage = Number(((Math.abs(weightDiff) / params.manifestWeightKg) * 100).toFixed(2));
    if (shrinkagePercentage <= threshold.warningShrinkagePercent) {
      toleranceStatus = 'WITHIN_TOLERANCE';
    } else if (shrinkagePercentage <= threshold.maxShrinkagePercent) {
      toleranceStatus = 'ACCEPTABLE_DEFICIT';
    } else {
      toleranceStatus = 'EXCESS_DEFICIT';
    }
  }

  let isTemperatureCompliant = true;
  if (params.temperatureZone === 'FROZEN') {
    isTemperatureCompliant = params.measuredTempCelsius <= -18;
  } else if (params.temperatureZone === 'CHILLED') {
    isTemperatureCompliant = params.measuredTempCelsius >= 0 && params.measuredTempCelsius <= 4;
  } else {
    isTemperatureCompliant = params.measuredTempCelsius >= 20 && params.measuredTempCelsius <= 30;
  }

  const notes =
    toleranceStatus === 'EXCESS_DEFICIT'
      ? `Susut bobot (${shrinkagePercentage}%) melebihi toleransi maksimal (${threshold.maxShrinkagePercent}%). Perlu dispute penyesuaian dana.`
      : !isTemperatureCompliant
        ? `Suhu terukur (${params.measuredTempCelsius}C) di luar standar zona ${params.temperatureZone}.`
        : 'Metrologi timbangan fisik dan suhu dalam batas kepatuhan standar.';

  return {
    toleranceStatus,
    weightDifferenceKg: Number(weightDiff.toFixed(2)),
    shrinkagePercentage,
    maxAllowedShrinkagePercent: threshold.maxShrinkagePercent,
    isTemperatureCompliant,
    notes,
  };
}

export const StandingOrderSchema = z.object({
  id: z.string().min(3),
  commodity: z.string().min(3),
  origin: z.string().min(3),
  frequency: z.string().min(3),
  dailyVolumeKg: z.number().positive(),
  unitPrice: z.number().positive(),
  totalWeeklyIdr: z.number().positive(),
  deliveryTime: z.string().min(4),
  status: z.enum(['UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED']),
});

export type StandingOrder = z.infer<typeof StandingOrderSchema>;
