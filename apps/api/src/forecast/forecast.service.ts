/**
 * @file apps/api/src/forecast/forecast.service.ts
 * @description NestJS service connecting to D:/MLPasokanMataram LightGBM multi-horizon forecasting service.
 * Fetches forecasts from the configured FastAPI ML service and persists synchronized results to MySQL.
 */

import { Injectable } from '@nestjs/common';
import {
  MlForecastListResponseSchema,
  MlSimulationInputSchema,
  type MlSimulationInput,
  type MlForecastListResponse,
} from '@pasok/domain';
import { query } from '@pasok/database';
import * as cache from '@pasok/cache';

@Injectable()
export class ForecastService {
  private readonly mlBaseUrl: string;

  public constructor() {
    const rawUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    // Validate ML service URL to prevent SSRF
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      throw new Error(`Invalid ML_SERVICE_URL: ${rawUrl}`);
    }

    // Only allow http/https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error(`ML_SERVICE_URL must use http or https protocol, got: ${parsedUrl.protocol}`);
    }

    // Allowlist: localhost, 127.0.0.1, production ML domain, or explicitly configured hosts
    const allowedHosts = ['localhost', '127.0.0.1', 'api-predict.syapratama.tech'];
    if (process.env.ML_ALLOWED_HOSTS) {
      allowedHosts.push(...process.env.ML_ALLOWED_HOSTS.split(','));
    }

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      throw new Error(
        `ML_SERVICE_URL hostname "${parsedUrl.hostname}" not in allowlist: ${allowedHosts.join(', ')}`
      );
    }

    this.mlBaseUrl = rawUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  /**
   * Mengambil proyeksi harga komoditas pangan lokal DIY untuk 7 hari ke depan.
   * @param commodityId Identifier komoditas (misal: cabai-rawit-merah, bawang-merah).
   * @returns Proyeksi multi-horizon H+1 s.d. H+7.
   */
  public async getCommodityForecast(commodityId: string) {
    const cacheKey = `ml:forecast:${commodityId}`;
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    const response = await fetch(
      `${this.mlBaseUrl}/api/v1/forecast/commodity/${encodeURIComponent(commodityId)}`
    );
    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}.`);
    }
    const data: unknown = await response.json();
    try {
      await cache.set(cacheKey, JSON.stringify(data), 300);
    } catch {
      return data;
    }
    return data;
  }

  /**
   * Menjalankan simulasi interaktif dampak curah hujan BMKG (%) atau kenaikan solar (%) terhadap harga.
   * @param rawInput Data masukan simulasi.
   * @returns Hasil proyeksi kurva simulasi.
   */
  public async simulateScenario(rawInput: unknown) {
    const validated: MlSimulationInput = MlSimulationInputSchema.parse(rawInput);
    const response = await fetch(`${this.mlBaseUrl}/api/v1/forecast/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    });
    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}.`);
    }
    return await response.json();
  }


  /**
   * Proxy to ML service: get all commodities with forecasts
   */
  async getAllCommodities(): Promise<MlForecastListResponse> {
    const cacheKey = 'ml:forecast:commodities';
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        const parsed = MlForecastListResponseSchema.safeParse(JSON.parse(cached));
        if (parsed.success) return parsed.data;
      }
    } catch {
      return await this.fetchAllCommodities(cacheKey);
    }
    return await this.fetchAllCommodities(cacheKey);
  }

  private async fetchAllCommodities(cacheKey: string): Promise<MlForecastListResponse> {
    const response = await fetch(`${this.mlBaseUrl}/api/v1/forecast/commodities`);
    if (!response.ok) throw new Error(`ML service error: ${response.statusText}`);
    const parsed = MlForecastListResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error('ML service response schema is invalid.');
    try {
      await cache.set(cacheKey, JSON.stringify(parsed.data), 300);
    } catch {
      return parsed.data;
    }
    return parsed.data;
  }
  /**
   * Sync ML forecasts to database
   */
  async syncForecastsToDB(): Promise<{ synced: number }> {
    const response = await fetch(`${this.mlBaseUrl}/api/v1/forecast/commodities`);
    if (!response.ok) {
      throw new Error(`ML service error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const commodities = Array.isArray(data?.commodities) ? data.commodities : [];

    let synced = 0;
    for (const forecast of commodities) {
      if (!forecast || typeof forecast !== 'object') continue;
      
      const code = 'commodity_code' in forecast ? String(forecast.commodity_code) : '';
      if (!code) continue;

      const queryResult = await query('SELECT id FROM commodities WHERE code = ? LIMIT 1', [code]);
      if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) continue;
      
      const row = queryResult.rows[0];
      const commodityId = row && typeof row === 'object' && 'id' in row ? String(row.id) : '';
      if (!commodityId) continue;

      const currentPrice = 'current_price' in forecast ? Number(forecast.current_price) : 0;
      const predicted7d = 'predicted_7d' in forecast ? Number(forecast.predicted_7d) : currentPrice;
      const predicted30d = 'predicted_30d' in forecast ? Number(forecast.predicted_30d) : currentPrice;
      const predicted90d = 'predicted_90d' in forecast ? Number(forecast.predicted_90d) : currentPrice;
      const trend = 'trend' in forecast ? String(forecast.trend) : 'STABLE';
      const confidence = 'confidence' in forecast ? Number(forecast.confidence) : 0.8;

      await query(
        `INSERT INTO commodity_forecasts 
        (id, commodity_id, current_price, predicted_price_7d, predicted_price_30d, predicted_price_90d, 
         trend, confidence_score, mape_accuracy, optimal_buy_start, optimal_buy_end, target_price,
         recommended_action, action_explanation, weather_risk_level, weather_risk_description, 
         rainfall_forecast_mm, historical_and_projected, algorithm, created_at, updated_at)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 5.0, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), ?, 
                'BELI_SEKARANG', 'Prakiraan harga stabil', 'RENDAH', 'Tidak ada risiko cuaca', 
                0, '[]', 'PasokML Ensemble v1.0', NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          current_price = VALUES(current_price),
          predicted_price_7d = VALUES(predicted_price_7d),
          predicted_price_30d = VALUES(predicted_price_30d),
          predicted_price_90d = VALUES(predicted_price_90d),
          trend = VALUES(trend),
          confidence_score = VALUES(confidence_score),
          updated_at = NOW()`,
        [commodityId, currentPrice, predicted7d, predicted30d, predicted90d, trend, confidence, currentPrice]
      );
      synced++;
    }

    return { synced };
  }
}
