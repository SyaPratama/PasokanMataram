/**
 * @file packages/domain/src/rules/temperature-router.ts
 * @description Multi-temperature logistics routing and cold chain SNI compliance engine.
 * Governs transit vehicle selection, hub storage bays, and real-time temperature violation alerts.
 */

import type { CommodityCategory, TemperatureZone } from '../types/ecosystem';

export type TransportVehicleType =
  | 'REFRIGERATED_TRUCK_FREEZER'
  | 'CHILLER_VAN'
  | 'VENTILATED_PICKUP';

export type HubStorageBay =
  | 'FREEZER_BAY'
  | 'CHILLER_BAY'
  | 'AMBIENT_VENTILATED_BAY';

export interface LogisticsRoutingDirective {
  commodityCategory: CommodityCategory;
  temperatureZone: TemperatureZone;
  targetTempRangeCelsius: {
    min: number;
    max: number;
  };
  recommendedVehicle: TransportVehicleType;
  hubStorageBay: HubStorageBay;
  requiresContinuousDataLogger: boolean;
  maxTransitHours: number;
  handlingInstructions: string;
}

export interface TemperatureValidationResult {
  isCompliant: boolean;
  deviationCelsius: number;
  alertLevel: 'NONE' | 'WARNING' | 'CRITICAL';
  diagnosticMessage: string;
}

/**
 * Menentukan direktif logistik, zona penyimpanan hub, dan armada transportasi berdasarkan kategori komoditas.
 * @param commodity Kategori bahan pangan lokal.
 * @param forceFrozen Opsi apakah komoditas diproses dalam kondisi beku.
 * @returns Petunjuk rute logistik suhu terkendali.
 */
export function routeCommodityLogistics(
  commodity: CommodityCategory,
  forceFrozen: boolean = false
): LogisticsRoutingDirective {
  if (forceFrozen || (commodity === 'PROCESSED' && forceFrozen)) {
    return {
      commodityCategory: commodity,
      temperatureZone: 'FROZEN',
      targetTempRangeCelsius: { min: -25, max: -18 },
      recommendedVehicle: 'REFRIGERATED_TRUCK_FREEZER',
      hubStorageBay: 'FREEZER_BAY',
      requiresContinuousDataLogger: true,
      maxTransitHours: 8,
      handlingInstructions:
        'Wajib pembekuan konstan di bawah -18C. Dilarang membiarkan komoditas di area transit terbuka melebihi 15 menit.',
    };
  }

  switch (commodity) {
    case 'MEAT':
      return {
        commodityCategory: 'MEAT',
        temperatureZone: 'CHILLED',
        targetTempRangeCelsius: { min: 0, max: 4 },
        recommendedVehicle: 'CHILLER_VAN',
        hubStorageBay: 'CHILLER_BAY',
        requiresContinuousDataLogger: true,
        maxTransitHours: 6,
        handlingInstructions:
          'Daging karkas dingin SNI 0-4C. Hindari paparan panas matahari langsung; periksa es batu kering atau insulasi chiller.',
      };
    case 'MILK':
      return {
        commodityCategory: 'MILK',
        temperatureZone: 'CHILLED',
        targetTempRangeCelsius: { min: 1, max: 4 },
        recommendedVehicle: 'CHILLER_VAN',
        hubStorageBay: 'CHILLER_BAY',
        requiresContinuousDataLogger: true,
        maxTransitHours: 4,
        handlingInstructions:
          'Susu segar wajib dalam tangki dingin stainless steel atau milk can berinsulasi chiller maksimal 4C guna mencegah keasaman.',
      };
    case 'PERISHABLE_VEGETABLE':
      return {
        commodityCategory: 'PERISHABLE_VEGETABLE',
        temperatureZone: 'AMBIENT_VENTILATED',
        targetTempRangeCelsius: { min: 20, max: 28 },
        recommendedVehicle: 'VENTILATED_PICKUP',
        hubStorageBay: 'AMBIENT_VENTILATED_BAY',
        requiresContinuousDataLogger: false,
        maxTransitHours: 12,
        handlingInstructions:
          'Hortikultura sayur segar berventilasi. Hindari penumpukan melebihi 4 krat untuk menjaga sirkulasi udara alami.',
      };
    case 'GRAIN':
      return {
        commodityCategory: 'GRAIN',
        temperatureZone: 'AMBIENT_VENTILATED',
        targetTempRangeCelsius: { min: 20, max: 32 },
        recommendedVehicle: 'VENTILATED_PICKUP',
        hubStorageBay: 'AMBIENT_VENTILATED_BAY',
        requiresContinuousDataLogger: false,
        maxTransitHours: 48,
        handlingInstructions:
          'Beras dan butiran kering. Pastikan terpal pelindung hujan tertutup rapat dan kelembapan ruangan di bawah 70%.',
      };
    case 'PROCESSED':
    default:
      return {
        commodityCategory: 'PROCESSED',
        temperatureZone: 'AMBIENT_VENTILATED',
        targetTempRangeCelsius: { min: 20, max: 30 },
        recommendedVehicle: 'VENTILATED_PICKUP',
        hubStorageBay: 'AMBIENT_VENTILATED_BAY',
        requiresContinuousDataLogger: false,
        maxTransitHours: 24,
        handlingInstructions:
          'Bahan pangan olahan kering (gula semut, bumbu siap pakai). Simpan pada suhu ruang kering dan berventilasi.',
      };
  }
}

/**
 * Memvalidasi apakah suhu yang diukur selama transit atau di hub memenuhi rentang aman SNI.
 * @param directive Direktif logistik rute komoditas.
 * @param measuredTempCelsius Suhu terukur dari sensor IoT atau termometer fisik.
 * @returns Hasil evaluasi kepatuhan suhu dan level peringatan.
 */
export function validateTransitTemperature(
  directive: LogisticsRoutingDirective,
  measuredTempCelsius: number
): TemperatureValidationResult {
  const { min, max } = directive.targetTempRangeCelsius;

  if (measuredTempCelsius >= min && measuredTempCelsius <= max) {
    return {
      isCompliant: true,
      deviationCelsius: 0,
      alertLevel: 'NONE',
      diagnosticMessage: `Suhu terukur (${measuredTempCelsius}C) dalam rentang target aman (${min}C s.d. ${max}C).`,
    };
  }

  const deviation =
    measuredTempCelsius < min
      ? Number((min - measuredTempCelsius).toFixed(1))
      : Number((measuredTempCelsius - max).toFixed(1));

  const isCritical =
    directive.temperatureZone === 'FROZEN'
      ? measuredTempCelsius > -10
      : directive.temperatureZone === 'CHILLED'
        ? measuredTempCelsius > 8
        : deviation > 10;

  const alertLevel = isCritical ? 'CRITICAL' : 'WARNING';
  const diagnosticMessage =
    alertLevel === 'CRITICAL'
      ? `Pelanggaran suhu kritis (${measuredTempCelsius}C)! Deviasi ${deviation}C melebihi batas aman komoditas ${directive.commodityCategory}. Mutu bahan pangan terancam rusak.`
      : `Peringatan fluktuasi suhu (${measuredTempCelsius}C). Deviasi ${deviation}C terdeteksi. Segera sesuaikan pendingin armada.`;

  return {
    isCompliant: false,
    deviationCelsius: deviation,
    alertLevel,
    diagnosticMessage,
  };
}
