/**
 * @file packages/domain/src/types/ecosystem.ts
 * @description Branded Types, enums, and domain invariants for the local food business ecosystem flow.
 * Complies with Constitution Principles II, III, and XIII (Strict Branded Types, zero any, formal JSDoc only).
 */

export type CampaignId = string & { readonly __brand: unique symbol };
export type ReservationId = string & { readonly __brand: unique symbol };
export type EscrowSettlementId = string & { readonly __brand: unique symbol };
export type WeighingLogId = string & { readonly __brand: unique symbol };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates and casts an unknown string to a CampaignId branded type.
 * @param value String identifier to validate.
 * @returns Strongly-typed CampaignId.
 */
export function asCampaignId(value: string): CampaignId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Invalid CampaignId format: ${value}`);
  }
  return value as CampaignId;
}

/**
 * Validates and casts an unknown string to a ReservationId branded type.
 * @param value String identifier to validate.
 * @returns Strongly-typed ReservationId.
 */
export function asReservationId(value: string): ReservationId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Invalid ReservationId format: ${value}`);
  }
  return value as ReservationId;
}

/**
 * Validates and casts an unknown string to an EscrowSettlementId branded type.
 * @param value String identifier to validate.
 * @returns Strongly-typed EscrowSettlementId.
 */
export function asEscrowSettlementId(value: string): EscrowSettlementId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Invalid EscrowSettlementId format: ${value}`);
  }
  return value as EscrowSettlementId;
}

/**
 * Validates and casts an unknown string to a WeighingLogId branded type.
 * @param value String identifier to validate.
 * @returns Strongly-typed WeighingLogId.
 */
export function asWeighingLogId(value: string): WeighingLogId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Invalid WeighingLogId format: ${value}`);
  }
  return value as WeighingLogId;
}

/**
 * Zona temperatur rantai dingin dan logistik hub.
 */
export type TemperatureZone = 'FROZEN' | 'CHILLED' | 'AMBIENT_VENTILATED';

/**
 * Kategori komoditas bahan pangan lokal DIY.
 */
export type CommodityCategory = 'MEAT' | 'MILK' | 'PERISHABLE_VEGETABLE' | 'GRAIN' | 'PROCESSED';

/**
 * Status alur reservasi kuota pooling horeka.
 */
export type ReservationStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'ALLOCATED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'DISPUTED';

/**
 * Status evaluasi metrologi timbangan fisik dan susut bobot.
 */
export type WeighingToleranceStatus =
  | 'WITHIN_TOLERANCE'
  | 'ACCEPTABLE_DEFICIT'
  | 'EXCESS_DEFICIT'
  | 'SURPLUS';

/**
 * Status rekening bersama (escrow) dan pencairan H+1.
 */
export type SettlementStatus =
  | 'ESCROW_LOCKED'
  | 'READY_FOR_DISBURSEMENT'
  | 'DISBURSED'
  | 'HELD_DISPUTE'
  | 'REFUNDED';

/**
 * Batas toleransi susut dan rentang suhu aman komoditas.
 */
export interface ToleranceThreshold {
  minTempCelsius: number;
  maxTempCelsius: number;
  maxShrinkagePercent: number;
  warningShrinkagePercent: number;
}
