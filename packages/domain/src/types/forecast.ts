/**
 * @file packages/domain/src/types/forecast.ts
 * @description Branded Types, kontrak domain, dan skema Zod untuk model prakiraan harga komoditas pangan AI/ML.
 * Mematuhi Prinsip II, III, dan XIII Konstitusi PasokMataram (Strict Branded Types, zero any, formal JSDoc only).
 */

import { z } from 'zod';

export type CommodityId = string & { readonly __brand: unique symbol };
export type ForecastRecordId = string & { readonly __brand: unique symbol };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Memvalidasi dan mengubah string menjadi tipe branded CommodityId.
 * @param value String kandidat UUID.
 * @returns CommodityId tervalidasi.
 * @throws TypeError jika format UUID tidak valid.
 */
export function asCommodityId(value: string): CommodityId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk CommodityId`);
  }
  return value as CommodityId;
}

/**
 * Memvalidasi dan mengubah string menjadi tipe branded ForecastRecordId.
 * @param value String kandidat UUID.
 * @returns ForecastRecordId tervalidasi.
 * @throws TypeError jika format UUID tidak valid.
 */
export function asForecastRecordId(value: string): ForecastRecordId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk ForecastRecordId`);
  }
  return value as ForecastRecordId;
}

export type ForecastCommodityCategory = 'Hortikultura' | 'Pangan Pokok' | 'Perkebunan';
export type PriceSource = 'BAPANAS' | 'PIHPS' | 'PASAR_LELANG' | 'INTERNAL_ESCROW';
export type ForecastHorizon = 7 | 30 | 90;
export type ForecastTrend = 'UP' | 'DOWN' | 'STABLE';
export type RecommendedAction = 'BELI_SEKARANG' | 'TUNGGU_PANEN_RAYA' | 'KUNCI_KONTRAK';
export type WeatherRiskLevel = 'RENDAH' | 'SEDANG' | 'TINGGI';

export const PriceDataPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().positive(),
  isProjected: z.boolean(),
  confidenceLower: z.number().positive().optional(),
  confidenceUpper: z.number().positive().optional(),
});

export type PriceDataPoint = z.infer<typeof PriceDataPointSchema>;

export const OptimalBuyWindowSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetPrice: z.number().positive(),
  recommendedAction: z.enum(['BELI_SEKARANG', 'TUNGGU_PANEN_RAYA', 'KUNCI_KONTRAK']),
  explanation: z.string().min(1),
});

export type OptimalBuyWindow = z.infer<typeof OptimalBuyWindowSchema>;

export const WeatherAnomalyRiskSchema = z.object({
  riskLevel: z.enum(['RENDAH', 'SEDANG', 'TINGGI']),
  description: z.string().min(1),
  rainfallForecastMm: z.number().nonnegative(),
  bmkgSource: z.string().min(1),
});

export type WeatherAnomalyRisk = z.infer<typeof WeatherAnomalyRiskSchema>;

export const ModelMetadataSchema = z.object({
  algorithm: z.string().min(1),
  mapeAccuracy: z.number().nonnegative(),
  lastTrained: z.string(),
});

export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;

export const CommodityForecastSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
  originRegion: z.string().min(1),
  unit: z.string().default('kg'),
  currentPrice: z.number().positive(),
  predictedPrice7d: z.number().positive(),
  predictedPrice30d: z.number().positive(),
  predictedPrice90d: z.number().positive(),
  trend: z.enum(['UP', 'DOWN', 'STABLE']),
  trendPercentage: z.number(),
  confidenceScore: z.number().min(0).max(100),
  optimalBuyWindow: OptimalBuyWindowSchema,
  weatherAnomalyRisk: WeatherAnomalyRiskSchema,
  modelMetadata: ModelMetadataSchema,
  historicalAndProjected: z.array(PriceDataPointSchema),
});

export type CommodityForecast = z.infer<typeof CommodityForecastSchema>;

export const MarketPriceIngestSchema = z.object({
  commodityCode: z.string().min(1),
  sourceType: z.enum(['BAPANAS', 'PIHPS', 'PASAR_LELANG', 'INTERNAL_ESCROW']),
  price: z.number().positive(),
  marketLocation: z.string().min(1),
  recordedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  metadata: z.record(z.unknown()).optional(),
});

export type MarketPriceIngest = z.infer<typeof MarketPriceIngestSchema>;

export const WeatherObservationSchema = z.object({
  regency: z.enum(['SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA']),
  recordedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rainfallMm: z.number().nonnegative(),
  humidityPercent: z.number().min(0).max(100),
  temperatureCelsius: z.number(),
  weatherCondition: z.string().min(1),
  bmkgStationCode: z.string().default('BMKG-DIY'),
});

export type WeatherObservation = z.infer<typeof WeatherObservationSchema>;
