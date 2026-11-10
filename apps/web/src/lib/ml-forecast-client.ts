/**
 * @file apps/web/src/lib/ml-forecast-client.ts
 * @description Client adapter terisolasi penghubung Next.js frontend ke backend FastAPI ML D:/MLPasokanMataram.
 */

import {
  MlCommodityForecastResponseSchema,
  MlForecastListResponseSchema,
  type MlCommodityForecastResponse,
  type MlForecastListResponse,
  type MlSimulationInput,
} from '@pasok/domain';
import type { CommodityForecast, PriceDataPoint, ForecastTrend, RecommendedAction, WeatherRiskLevel } from '../types/forecast';


export function adaptMlToDomainForecast(ml: MlCommodityForecastResponse): CommodityForecast {
  const currentPrice = ml.current_price;
  const p7d = ml.predicted_price_7d;
  const p30d = Math.round(currentPrice * (1 + (ml.trend_percentage / 100) * 1.8));
  const p90d = Math.round(currentPrice * (1 + (ml.trend_percentage / 100) * 2.4));

  const historicalAndProjected: PriceDataPoint[] = ml.curve.map((pt) => ({
    date: pt.date,
    price: pt.price,
    isProjected: pt.is_projected,
    confidenceLower: pt.confidence_lower ?? undefined,
    confidenceUpper: pt.confidence_upper ?? undefined,
  }));

  return {
    id: ml.commodity_id,
    name: ml.name,
    category: ml.category,
    originRegion: ml.origin_region,
    unit: ml.unit,
    currentPrice,
    predictedPrice7d: p7d,
    predictedPrice30d: p30d,
    predictedPrice90d: p90d,
    trend: ml.trend as ForecastTrend,
    trendPercentage: ml.trend_percentage,
    confidenceScore: ml.confidence_score,
    optimalBuyWindow: {
      startDate: ml.optimal_buy_window.start_date,
      endDate: ml.optimal_buy_window.end_date,
      targetPrice: ml.optimal_buy_window.target_price,
      recommendedAction: ml.optimal_buy_window.recommended_action as RecommendedAction,
      explanation: ml.optimal_buy_window.explanation,
    },
    weatherAnomalyRisk: {
      riskLevel: ml.weather_impact.risk_level as WeatherRiskLevel,
      description: ml.weather_impact.description,
      rainfallForecastMm: ml.weather_impact.rainfall_forecast_mm,
      bmkgSource: ml.weather_impact.bmkg_source,
    },
    modelMetadata: {
      algorithm: ml.model_metadata.algorithm,
      mapeAccuracy: ml.model_metadata.mape_accuracy,
      lastTrained: ml.model_metadata.last_trained,
    },
    historicalAndProjected,
  };
}

export async function fetchMlForecastList(
  category?: string
): Promise<{ source: 'FASTAPI_ML'; data: MlForecastListResponse }> {
  const baseUrl = process.env.ML_SERVICE_URL?.trim() || 'http://localhost:8000';
  const url = new URL('/api/v1/forecast/commodities', baseUrl);
  if (category) url.searchParams.set('category', category);
  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`ML service returned ${res.status}.`);
    const parsed = MlForecastListResponseSchema.safeParse(await res.json());
    if (!parsed.success) throw new Error('ML service response schema is invalid.');
    return { source: 'FASTAPI_ML', data: parsed.data };
  } catch {
    throw new Error('Layanan prakiraan harga tidak tersedia.');
  }
}

export async function fetchMlSingleForecast(
  commodityCode: string
): Promise<{ source: 'FASTAPI_ML'; data: MlCommodityForecastResponse }> {
  const baseUrl = process.env.ML_SERVICE_URL?.trim() || 'http://localhost:8000';
  const url = `${baseUrl}/api/v1/forecast/${encodeURIComponent(commodityCode.toUpperCase())}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`ML service returned ${res.status}.`);
    const parsed = MlCommodityForecastResponseSchema.safeParse(await res.json());
    if (!parsed.success) throw new Error('ML service response schema is invalid.');
    return { source: 'FASTAPI_ML', data: parsed.data };
  } catch {
    throw new Error('Prakiraan komoditas tidak tersedia.');
  }
}

export async function simulateMlScenario(
  input: MlSimulationInput
): Promise<{ source: 'FASTAPI_ML'; data: MlCommodityForecastResponse }> {
  const baseUrl = process.env.ML_SERVICE_URL?.trim() || 'http://localhost:8000';
  try {
    const res = await fetch(`${baseUrl}/api/v1/forecast/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        commodity_code: input.commodity_code,
        current_price: input.current_price ?? 0,
        rainfall_anomaly_percent: input.rainfall_anomaly_percent,
        fuel_price_hike_percent: input.fuel_price_hike_percent,
      }),
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`ML service returned ${res.status}.`);
    const parsed = MlCommodityForecastResponseSchema.safeParse(await res.json());
    if (!parsed.success) throw new Error('ML service response schema is invalid.');
    return { source: 'FASTAPI_ML', data: parsed.data };
  } catch {
    throw new Error('Simulasi prakiraan tidak tersedia.');
  }
}
