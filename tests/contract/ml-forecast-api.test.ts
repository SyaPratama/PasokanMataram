/**
 * @file tests/contract/ml-forecast-api.test.ts
 * @description Pengujian kontrak API integrasi FastAPI ML dan fallback deterministik.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MlSimulationInputSchema,
  MlCommodityForecastResponseSchema,
} from '../../packages/domain/src';
import {
  adaptMlToDomainForecast,
  fetchMlSingleForecast,
  fetchMlForecastList,
  simulateMlScenario,
} from '../../apps/web/src/lib/ml-forecast-client';
import { GET, POST } from '../../apps/web/src/app/api/v1/forecast/ml/route';

const forecastFixture = {
  commodity_id: 'commodity-bawang-merah',
  commodity_code: 'BAWANG_MERAH',
  name: 'Bawang Merah Srikayangan',
  category: 'Hortikultura',
  origin_region: 'Kulon Progo',
  unit: 'kg',
  current_price: 36000,
  predicted_prices_7d: [36100, 36200, 36300, 36400, 36500, 36600, 36700],
  predicted_price_7d: 36700,
  trend: 'UP',
  trend_percentage: 1.94,
  confidence_score: 0.93,
  optimal_buy_window: {
    start_date: '2026-11-10',
    end_date: '2026-11-17',
    target_price: 36000,
    recommended_action: 'KUNCI_KONTRAK',
    explanation: 'Kunci kontrak untuk menjaga harga.',
  },
  weather_impact: {
    risk_level: 'SEDANG',
    description: 'Anomali hujan terpantau.',
    rainfall_forecast_mm: 120,
    bmkg_source: 'BMKG DIY',
  },
  model_metadata: {
    algorithm: 'LightGBM Direct Multi-Horizon',
    mape_accuracy: 3.6,
    last_trained: '2026-11-01',
    horizon_days: 7,
  },
  curve: [
    { date: '2026-11-09', price: 35900, is_projected: false, confidence_lower: null, confidence_upper: null },
    { date: '2026-11-10', price: 36000, is_projected: false, confidence_lower: null, confidence_upper: null },
  ],
};

const listFixture = { success: true, count: 1, data: [forecastFixture] };

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('FastAPI ML Integration Contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      return String(input).includes('/commodities') ? response(listFixture) : response(forecastFixture);
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Zod Schema Validations', () => {
    it('memvalidasi dan mentransformasi payload simulasi skenario input', () => {
      const validCamelCase = {
        commodityCode: 'bawang_merah',
        currentPrice: 32000,
        rainfallAnomalyPercent: 20,
        fuelPriceHikePercent: 10,
      };

      const parsed = MlSimulationInputSchema.parse(validCamelCase);
      expect(parsed.commodity_code).toBe('BAWANG_MERAH');
      expect(parsed.current_price).toBe(32000);
      expect(parsed.rainfall_anomaly_percent).toBe(20);
      expect(parsed.fuel_price_hike_percent).toBe(10);
    });

    it('memvalidasi payload simulasi snake_case dari klien eksternal', () => {
      const validSnakeCase = {
        commodity_code: 'CABAI_RAWIT_MERAH',
        current_price: 45000,
        rainfall_anomaly_percent: -15,
        fuel_price_hike_percent: 5,
      };

      const parsed = MlSimulationInputSchema.parse(validSnakeCase);
      expect(parsed.commodity_code).toBe('CABAI_RAWIT_MERAH');
      expect(parsed.current_price).toBe(45000);
      expect(parsed.rainfall_anomaly_percent).toBe(-15);
      expect(parsed.fuel_price_hike_percent).toBe(5);
    });

    it('menolak payload simulasi dengan harga negatif', () => {
      const invalid = {
        commodityCode: 'BAWANG_MERAH',
        currentPrice: -5000,
      };

      expect(() => MlSimulationInputSchema.parse(invalid)).toThrow();
    });
  });

  describe('Client Adapter', () => {
    it('validates and adapts a successful commodity response', () => {
      const parsed = MlCommodityForecastResponseSchema.parse(forecastFixture);
      const adapted = adaptMlToDomainForecast(parsed);
      expect(adapted.name).toBe('Bawang Merah Srikayangan');
      expect(adapted.currentPrice).toBe(36000);
      expect(adapted.predictedPrice7d).toBe(36700);
      expect(adapted.historicalAndProjected).toHaveLength(2);
    });

    it('reads successful FastAPI responses without synthetic fallback', async () => {
      const single = await fetchMlSingleForecast('BAWANG_MERAH');
      const list = await fetchMlForecastList();
      const simulation = await simulateMlScenario({
        commodity_code: 'BAWANG_MERAH',
        current_price: 36000,
        rainfall_anomaly_percent: 25,
        fuel_price_hike_percent: 10,
      });
      expect(single.source).toBe('FASTAPI_ML');
      expect(list.data.data).toHaveLength(1);
      expect(simulation.data.current_price).toBe(36000);
    });

    it('fails closed when FastAPI is unavailable', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => response({ error: 'offline' }, 503)));
      await expect(fetchMlSingleForecast('BAWANG_MERAH')).rejects.toThrow(
        'Prakiraan komoditas tidak tersedia.'
      );
    });
  });

  describe('Next.js Route Handler /api/v1/forecast/ml', () => {
    it('GET /api/v1/forecast/ml mengembalikan daftar dari FastAPI', async () => {
      const req = new Request('http://localhost:3000/api/v1/forecast/ml');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('GET /api/v1/forecast/ml?code=BAWANG_MERAH&adapt=domain mengembalikan format domain', async () => {
      const req = new Request('http://localhost:3000/api/v1/forecast/ml?code=BAWANG_MERAH&adapt=domain');
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.currentPrice).toBeDefined();
      expect(json.data.historicalAndProjected).toBeDefined();
    });

    it('POST /api/v1/forecast/ml menolak payload yang tidak valid dengan status 400', async () => {
      const req = new Request('http://localhost:3000/api/v1/forecast/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_price: -100 }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it('POST /api/v1/forecast/ml berhasil mengeksekusi simulasi dengan status 200', async () => {
      const req = new Request('http://localhost:3000/api/v1/forecast/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity_code: 'BAWANG_MERAH',
          current_price: 36000,
          rainfall_anomaly_percent: 20,
          fuel_price_hike_percent: 15,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.predicted_price_7d).toBeDefined();
    });
  });
});
