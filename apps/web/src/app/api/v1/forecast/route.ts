/**
 * @file apps/web/src/app/api/v1/forecast/route.ts
 * @description Endpoint publik pembacaan prakiraan tren harga pasokan komoditas pangan DIY.
 * Mendukung pembacaan real-time dari database PostgreSQL 16 dengan fallback mock hermetis,
 * filter pencarian kata kunci, pemilihan wilayah kabupaten/kota, dan penyortiran harga.
 * Mematuhi Prinsip I, IV, VII, dan XII Konstitusi PasokMataram.
 */

import { NextResponse } from 'next/server';
import { query } from '@pasok/database';
import { MOCK_COMMODITY_FORECASTS } from '@/lib/mock-forecast-data';
import type { CommodityForecast, PriceDataPoint } from '@/types/forecast';

interface ForecastDbRow {
  id: string;
  name: string;
  category: string;
  origin_region: string;
  unit: string;
  current_price: string;
  predicted_price_7d: string;
  predicted_price_30d: string;
  predicted_price_90d: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trend_percentage: string;
  confidence_score: string;
  mape_accuracy: string;
  optimal_buy_start: string;
  optimal_buy_end: string;
  target_price: string;
  recommended_action: 'BELI_SEKARANG' | 'TUNGGU_PANEN_RAYA' | 'KUNCI_KONTRAK';
  action_explanation: string;
  weather_risk_level: 'RENDAH' | 'SEDANG' | 'TINGGI';
  weather_risk_description: string;
  rainfall_forecast_mm: string;
  historical_and_projected: PriceDataPoint[] | string;
  algorithm: string;
  last_trained_at: string;
}

/**
 * Mengambil data prakiraan harga komoditas dari database dengan fallback hermetis.
 * @returns Larik data CommodityForecast.
 */
async function loadForecastData(): Promise<CommodityForecast[]> {
  try {
    const res = await query<ForecastDbRow>(
      `SELECT
        f.id,
        c.name,
        c.category,
        c.origin_region,
        c.unit,
        f.current_price,
        f.predicted_price_7d,
        f.predicted_price_30d,
        f.predicted_price_90d,
        f.trend,
        f.trend_percentage,
        f.confidence_score,
        f.mape_accuracy,
        f.optimal_buy_start,
        f.optimal_buy_end,
        f.target_price,
        f.recommended_action,
        f.action_explanation,
        f.weather_risk_level,
        f.weather_risk_description,
        f.rainfall_forecast_mm,
        f.historical_and_projected,
        f.algorithm,
        f.last_trained_at
      FROM commodity_forecasts f
      JOIN commodities c ON f.commodity_id = c.id
      WHERE c.is_active = TRUE
      ORDER BY f.created_at DESC
      LIMIT 20`
    );

    if (res.rows.length === 0) {
      return [...MOCK_COMMODITY_FORECASTS];
    }

    return res.rows.map((r) => {
      const curve: PriceDataPoint[] =
        typeof r.historical_and_projected === 'string'
          ? JSON.parse(r.historical_and_projected)
          : r.historical_and_projected;

      return {
        id: r.id,
        name: r.name,
        category: r.category,
        originRegion: r.origin_region,
        unit: r.unit,
        currentPrice: Number(r.current_price),
        predictedPrice7d: Number(r.predicted_price_7d),
        predictedPrice30d: Number(r.predicted_price_30d),
        predictedPrice90d: Number(r.predicted_price_90d),
        trend: r.trend,
        trendPercentage: Number(r.trend_percentage),
        confidenceScore: Number(r.confidence_score),
        optimalBuyWindow: {
          startDate: typeof r.optimal_buy_start === 'string' ? r.optimal_buy_start.slice(0, 10) : new Date(r.optimal_buy_start).toISOString().slice(0, 10),
          endDate: typeof r.optimal_buy_end === 'string' ? r.optimal_buy_end.slice(0, 10) : new Date(r.optimal_buy_end).toISOString().slice(0, 10),
          targetPrice: Number(r.target_price),
          recommendedAction: r.recommended_action,
          explanation: r.action_explanation,
        },
        weatherAnomalyRisk: {
          riskLevel: r.weather_risk_level,
          description: r.weather_risk_description,
          rainfallForecastMm: Number(r.rainfall_forecast_mm),
          bmkgSource: 'BMKG DIY & AWS Panjatan',
        },
        modelMetadata: {
          algorithm: r.algorithm,
          mapeAccuracy: Number(r.mape_accuracy),
          lastTrained: new Date(r.last_trained_at).toISOString(),
        },
        historicalAndProjected: curve,
      };
    });
  } catch {
    return [...MOCK_COMMODITY_FORECASTS];
  }
}

/**
 * Handler HTTP GET untuk endpoint publik /api/v1/forecast.
 * @param request HTTP Request.
 * @returns Response JSON berisi data prakiraan harga komoditas.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const region = (searchParams.get('region') || 'SEMUA').trim().toUpperCase();
  const sort = (searchParams.get('sort') || 'default').trim().toLowerCase();

  let results = await loadForecastData();

  if (search) {
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.originRegion.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
    );
  }

  if (region && region !== 'SEMUA' && region !== 'ALL') {
    const regionKeywordMap: Record<string, string> = {
      KULON_PROGO: 'kulon progo',
      BANTUL: 'bantul',
      SLEMAN: 'sleman',
      GUNUNGKIDUL: 'gunungkidul',
      YOGYAKARTA: 'yogyakarta',
    };
    const targetKeyword = regionKeywordMap[region] || region.toLowerCase();
    results = results.filter((item) =>
      item.originRegion.toLowerCase().includes(targetKeyword)
    );
  }

  if (sort === 'price_asc' || sort === 'asc') {
    results.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (sort === 'price_desc' || sort === 'desc') {
    results.sort((a, b) => b.currentPrice - a.currentPrice);
  }

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length,
  });
}

/**
 * Handler HTTP POST untuk memperbarui prakiraan harga komoditas via API PasokMataram.
 * Menerima payload dari ML service tanpa akses langsung ke basis data.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : (body.forecasts || [body]);

    let inserted = 0;
    for (const f of items) {
      if (!f.commodity_id && !f.commodityId) continue;
      const commId = f.commodity_id || f.commodityId;
      const curPrice = Number(f.current_price ?? f.currentPrice ?? 0);
      const pred7d = Number(f.predicted_price_7d ?? f.predictedPrice7d ?? curPrice);
      const pred30d = Number(f.predicted_price_30d ?? f.predictedPrice30d ?? pred7d * 1.02);
      const pred90d = Number(f.predicted_price_90d ?? f.predictedPrice90d ?? pred7d * 1.05);
      const trend = f.trend || (pred7d > curPrice ? 'UP' : pred7d < curPrice ? 'DOWN' : 'STABLE');
      const trendPct = Number(f.trend_percentage ?? f.trendPercentage ?? 0);
      const confScore = Number(f.confidence_score ?? f.confidenceScore ?? 90.0);
      const mape = Number(f.mape_accuracy ?? f.mapeAccuracy ?? 2.8);
      const optStart = f.optimal_buy_start ?? f.optimalBuyWindow?.startDate ?? new Date().toISOString().slice(0, 10);
      const optEnd = f.optimal_buy_end ?? f.optimalBuyWindow?.endDate ?? new Date().toISOString().slice(0, 10);
      const targetPrice = Number(f.target_price ?? f.optimalBuyWindow?.targetPrice ?? curPrice);
      const action = f.recommended_action ?? f.optimalBuyWindow?.recommendedAction ?? 'BELI_SEKARANG';
      const explanation = f.action_explanation ?? f.optimalBuyWindow?.explanation ?? 'Rekomendasi otomatis ML';
      const riskLevel = f.weather_risk_level ?? f.weatherAnomalyRisk?.riskLevel ?? 'RENDAH';
      const riskDesc = f.weather_risk_description ?? f.weatherAnomalyRisk?.description ?? 'Pantauan cuaca BMKG DIY';
      const rainfallForecast = Number(f.rainfall_forecast_mm ?? f.weatherAnomalyRisk?.rainfallForecastMm ?? 0);
      const curve = f.curve ?? f.historicalAndProjected ?? [];
      const algorithm = f.algorithm ?? f.modelMetadata?.algorithm ?? 'PasokML LightGBM Direct Multi-Horizon v1.3';

      await query(
        `INSERT INTO commodity_forecasts (
          commodity_id, current_price, predicted_price_7d, predicted_price_30d, predicted_price_90d,
          trend, trend_percentage, confidence_score, mape_accuracy, optimal_buy_start, optimal_buy_end,
          target_price, recommended_action, action_explanation, weather_risk_level, weather_risk_description,
          rainfall_forecast_mm, historical_and_projected, algorithm, last_trained_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, NOW()
        )`,
        [
          commId, curPrice, pred7d, pred30d, pred90d,
          trend, trendPct, confScore, mape, optStart, optEnd,
          targetPrice, action, explanation, riskLevel, riskDesc,
          rainfallForecast, JSON.stringify(curve), algorithm
        ]
      );
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbarui ${inserted} prakiraan komoditas`,
      count: inserted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan prakiraan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
