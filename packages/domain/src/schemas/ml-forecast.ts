/**
 * @file packages/domain/src/schemas/ml-forecast.ts
 * @description Skema validasi Zod untuk payload simulasi dan respons proyeksi harga multi-horizon FastAPI ML.
 */

import { z } from 'zod';

export const MlPricePointSchema = z.object({
  date: z.string(),
  price: z.number(),
  is_projected: z.boolean().default(false),
  confidence_lower: z.number().nullable().optional(),
  confidence_upper: z.number().nullable().optional(),
});

export type MlPricePoint = z.infer<typeof MlPricePointSchema>;

export const MlBuyWindowRecommendationSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  target_price: z.number(),
  recommended_action: z.enum(['BELI_SEKARANG', 'TUNGGU_PANEN_RAYA', 'KUNCI_KONTRAK']),
  explanation: z.string(),
});

export type MlBuyWindowRecommendation = z.infer<typeof MlBuyWindowRecommendationSchema>;

export const MlWeatherImpactSchema = z.object({
  risk_level: z.enum(['RENDAH', 'SEDANG', 'TINGGI']),
  description: z.string(),
  rainfall_forecast_mm: z.number(),
  bmkg_source: z.string(),
});

export type MlWeatherImpact = z.infer<typeof MlWeatherImpactSchema>;

export const MlModelMetadataSchema = z.object({
  algorithm: z.string(),
  mape_accuracy: z.number(),
  last_trained: z.string(),
  horizon_days: z.number().default(7),
});

export type MlModelMetadata = z.infer<typeof MlModelMetadataSchema>;

export const MlCommodityForecastResponseSchema = z.object({
  commodity_id: z.string(),
  commodity_code: z.string(),
  name: z.string(),
  category: z.string(),
  origin_region: z.string(),
  unit: z.string().default('kg'),
  current_price: z.number(),
  predicted_prices_7d: z.array(z.number()),
  predicted_price_7d: z.number(),
  trend: z.enum(['UP', 'DOWN', 'STABLE']),
  trend_percentage: z.number(),
  confidence_score: z.number(),
  optimal_buy_window: MlBuyWindowRecommendationSchema,
  weather_impact: MlWeatherImpactSchema,
  model_metadata: MlModelMetadataSchema,
  curve: z.array(MlPricePointSchema),
});

export type MlCommodityForecastResponse = z.infer<typeof MlCommodityForecastResponseSchema>;

export const MlForecastListResponseSchema = z.object({
  success: z.boolean().default(true),
  count: z.number(),
  data: z.array(MlCommodityForecastResponseSchema),
});

export type MlForecastListResponse = z.infer<typeof MlForecastListResponseSchema>;

export const MlSimulationInputSchema = z.object({
  commodity_code: z.string().min(1).optional(),
  commodityCode: z.string().min(1).optional(),
  current_price: z.number().positive().optional(),
  currentPrice: z.number().positive().optional(),
  rainfall_anomaly_percent: z.number().optional(),
  rainfallAnomalyPercent: z.number().optional(),
  fuel_price_hike_percent: z.number().optional(),
  fuelPriceHikePercent: z.number().optional(),
}).transform((val) => ({
  commodity_code: (val.commodity_code ?? val.commodityCode ?? 'BAWANG_MERAH').toUpperCase(),
  current_price: val.current_price ?? val.currentPrice,
  rainfall_anomaly_percent: Number(val.rainfall_anomaly_percent ?? val.rainfallAnomalyPercent ?? 0),
  fuel_price_hike_percent: Number(val.fuel_price_hike_percent ?? val.fuelPriceHikePercent ?? 0),
}));

export type MlSimulationInput = z.infer<typeof MlSimulationInputSchema>;

export const MultiHorizonForecastSchema = z.object({
  commodityCode: z.string().min(1),
  name: z.string(),
  category: z.string(),
  originRegion: z.string(),
  unit: z.string().default('kg'),
  currentPrice: z.number().positive(),
  predictedPrice7d: z.number().positive(),
  predictedPrice30d: z.number().positive(),
  predictedPrice90d: z.number().positive(),
  trend: z.enum(['UP', 'DOWN', 'STABLE']),
  trendPercentage: z.number(),
  confidenceScore: z.number(),
  optimalBuyWindow: z.object({
    startDate: z.string(),
    endDate: z.string(),
    targetPrice: z.number(),
    recommendedAction: z.enum(['BELI_SEKARANG', 'TUNGGU_PANEN_RAYA', 'KUNCI_KONTRAK']),
    explanation: z.string(),
  }),
  weatherAnomalyRisk: z.object({
    riskLevel: z.enum(['RENDAH', 'SEDANG', 'TINGGI']),
    description: z.string(),
    rainfallForecastMm: z.number(),
    bmkgSource: z.string(),
  }),
  modelMetadata: z.object({
    algorithm: z.string(),
    mapeAccuracy: z.number(),
    lastTrained: z.string(),
    horizonDays: z.number().default(7),
  }),
  curve: z.array(
    z.object({
      date: z.string(),
      price: z.number(),
      isProjected: z.boolean(),
      confidenceLower: z.number().optional(),
      confidenceUpper: z.number().optional(),
    })
  ),
});

export type MultiHorizonForecast = z.infer<typeof MultiHorizonForecastSchema>;
