/**
 * @file services/queue-worker/src/handlers/ml-forecast-publisher.ts
 * @description Handler pemroses pekerjaan publikasi prakiraan ml.forecast.publish.daily.
 * Mengambil histori data komoditas, mengeksekusi PasokEnsembleForecaster, dan menyimpan
 * hasil agregat ke commodity_forecasts untuk penyajian sub-detik di portal web.
 * Mematuhi Prinsip I, II, dan IV Konstitusi PasokMataram.
 */

import type { QueueJob } from '@pasok/queue';
import { query } from '@pasok/database';
import { type CommodityForecast, MlCommodityForecastResponseSchema } from '@pasok/domain';
import { PasokEnsembleForecaster } from '../ml/pasok-ensemble';

interface CommodityRow {
  id: string;
  code?: string;
  name: string;
  category: 'Hortikultura' | 'Pangan Pokok' | 'Perkebunan';
  origin_region: string;
  unit: string;
}

interface PriceRow {
  recorded_date: string;
  price: string;
}

interface WeatherRow {
  rainfall_mm: string;
}

/**
 * Menghasilkan dan mempublikasikan prakiraan harga untuk semua komoditas aktif.
 * @param job Objek pekerjaan antrean.
 * @returns Jumlah komoditas yang berhasil diproyeksikan.
 */
export async function executeForecastPublish(
  job: QueueJob<'ml.forecast.publish.daily'>
): Promise<number> {
  const commRes = await query<CommodityRow>(
    'SELECT id, code, name, category, origin_region, unit FROM commodities WHERE is_active = TRUE ORDER BY name ASC'
  );

  let publishedCount = 0;

  for (const comm of commRes.rows) {
    try {
      const priceRes = await query<PriceRow>(
        `SELECT recorded_date, AVG(price)::numeric(14,2) as price
         FROM commodity_raw_market_prices
         WHERE commodity_id = $1
         GROUP BY recorded_date
         ORDER BY recorded_date ASC
         LIMIT 60`,
        [comm.id]
      );

      const history = priceRes.rows.map((r) => ({
        date: typeof r.recorded_date === 'string' ? r.recorded_date.slice(0, 10) : new Date(r.recorded_date).toISOString().slice(0, 10),
        price: Number(r.price),
      }));

      const activeHistory = history.length > 0 ? history : getFallbackHistory(comm.name);

      const weatherRes = await query<WeatherRow>(
        'SELECT rainfall_mm FROM weather_observations ORDER BY recorded_date DESC LIMIT 3'
      );
      const rainfall3d = weatherRes.rows.reduce((sum, r) => sum + Number(r.rainfall_mm || 0), 0);
      let forecast: CommodityForecast | null = null;
      const mlUrl = process.env.ML_SERVICE_URL?.trim() || 'http://localhost:8000';
      if (comm.code) {
        try {
          const res = await fetch(`${mlUrl}/api/v1/forecast/${encodeURIComponent(comm.code)}`, {
            signal: AbortSignal.timeout(1500),
          });
          if (res.ok) {
            const json: unknown = await res.json();
            const parsed = MlCommodityForecastResponseSchema.safeParse(json);
            if (parsed.success) {
              const ml = parsed.data;
              forecast = {
                id: comm.id,
                name: comm.name,
                category: comm.category,
                originRegion: comm.origin_region,
                unit: comm.unit,
                currentPrice: ml.current_price,
                predictedPrice7d: ml.predicted_price_7d,
                predictedPrice30d: Math.round(ml.current_price * (1 + (ml.trend_percentage / 100) * 1.8)),
                predictedPrice90d: Math.round(ml.current_price * (1 + (ml.trend_percentage / 100) * 2.4)),
                trend: ml.trend,
                trendPercentage: ml.trend_percentage,
                confidenceScore: ml.confidence_score,
                optimalBuyWindow: {
                  startDate: ml.optimal_buy_window.start_date,
                  endDate: ml.optimal_buy_window.end_date,
                  targetPrice: ml.optimal_buy_window.target_price,
                  recommendedAction: ml.optimal_buy_window.recommended_action,
                  explanation: ml.optimal_buy_window.explanation,
                },
                weatherAnomalyRisk: {
                  riskLevel: ml.weather_impact.risk_level,
                  description: ml.weather_impact.description,
                  rainfallForecastMm: ml.weather_impact.rainfall_forecast_mm,
                  bmkgSource: ml.weather_impact.bmkg_source,
                },
                modelMetadata: {
                  algorithm: ml.model_metadata.algorithm,
                  mapeAccuracy: ml.model_metadata.mape_accuracy,
                  lastTrained: ml.model_metadata.last_trained,
                },
                historicalAndProjected: ml.curve.map((pt) => ({
                  date: pt.date,
                  price: pt.price,
                  isProjected: pt.is_projected,
                  confidenceLower: pt.confidence_lower ?? undefined,
                  confidenceUpper: pt.confidence_upper ?? undefined,
                })),
              };
            }
          }
        } catch {}
      }

      if (!forecast) {
        forecast = PasokEnsembleForecaster.generateForecast(
          {
            id: comm.id,
            name: comm.name,
            category: comm.category,
            originRegion: comm.origin_region,
            unit: comm.unit,
          },
          activeHistory,
          rainfall3d
        );
      }
      await saveCommodityForecast(forecast);
      publishedCount++;
    } catch {
      continue;
    }
  }

  return publishedCount;
}

/**
 * Handler antrean job ml.forecast.publish.daily yang mematuhi kontrak JobHandler (Promise<void>).
 * @param job Objek pekerjaan antrean.
 */
export async function handleForecastPublish(
  job: QueueJob<'ml.forecast.publish.daily'>
): Promise<void> {
  await executeForecastPublish(job);
}

/**
 * Menyimpan entitas CommodityForecast ke tabel commodity_forecasts.
 * @param f Entitas forecast lengkap.
 */
async function saveCommodityForecast(f: CommodityForecast): Promise<void> {
  await query(
    `INSERT INTO commodity_forecasts (
      commodity_id, current_price, predicted_price_7d, predicted_price_30d, predicted_price_90d,
      trend, trend_percentage, confidence_score, mape_accuracy, optimal_buy_start, optimal_buy_end,
      target_price, recommended_action, action_explanation, weather_risk_level, weather_risk_description,
      rainfall_forecast_mm, historical_and_projected, algorithm, last_trained_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
    )`,
    [
      f.id,
      f.currentPrice,
      f.predictedPrice7d,
      f.predictedPrice30d,
      f.predictedPrice90d,
      f.trend,
      f.trendPercentage,
      f.confidenceScore,
      f.modelMetadata.mapeAccuracy,
      f.optimalBuyWindow.startDate,
      f.optimalBuyWindow.endDate,
      f.optimalBuyWindow.targetPrice,
      f.optimalBuyWindow.recommendedAction,
      f.optimalBuyWindow.explanation,
      f.weatherAnomalyRisk.riskLevel,
      f.weatherAnomalyRisk.description,
      f.weatherAnomalyRisk.rainfallForecastMm,
      JSON.stringify(f.historicalAndProjected),
      f.modelMetadata.algorithm,
      f.modelMetadata.lastTrained,
    ]
  );
}

/**
 * Menghasilkan riwayat data cadangan hermetis untuk seeding awal.
 * @param name Nama komoditas.
 * @returns Larik riwayat harga 14 hari terakhir.
 */
function getFallbackHistory(name: string): Array<{ date: string; price: number }> {
  const basePrices: Record<string, number> = {
    'Cabai Rawit Merah': 48000,
    'Bawang Merah Srikayangan': 36000,
    'Cabai Merah Keriting': 32000,
    'Beras Premium Sleman': 15500,
    'Bawang Putih Kating': 40000,
    'Daging Ayam Broiler': 35000,
  };

  const basePrice = basePrices[name] ?? 30000;
  const list: Array<{ date: string; price: number }> = [];
  const now = new Date();

  for (let i = 14; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const jitter = Math.sin(i) * 0.05;
    list.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(basePrice * (1 + jitter)),
    });
  }

  return list;
}
