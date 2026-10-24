/**
 * @file tests/contract/ml-forecast-api.test.ts
 * @description Pengujian kontrak API integrasi FastAPI ML dan fallback deterministik.
 */

import { describe, it, expect } from 'vitest';
import {
  MlSimulationInputSchema,
  MlCommodityForecastResponseSchema,
  MlForecastListResponseSchema,
} from '../../packages/domain/src';
import {
  generateDeterministicForecast,
  adaptMlToDomainForecast,
  fetchMlSingleForecast,
  fetchMlForecastList,
  simulateMlScenario,
} from '../../apps/web/src/lib/ml-forecast-client';
import { GET, POST } from '../../apps/web/src/app/api/v1/forecast/ml/route';

describe('FastAPI ML Integration & Hermetic Fallback Contracts', () => {
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

  describe('Deterministic Hermetic Fallback Engine', () => {
    it('menghasilkan prakiraan deterministik yang valid saat ML service luring', () => {
      const result = generateDeterministicForecast('BAWANG_MERAH', 35000, 20, 10);
      expect(result.commodity_code).toBe('BAWANG_MERAH');
      expect(result.current_price).toBe(35000);
      expect(result.predicted_prices_7d.length).toBe(7);
      expect(result.curve.length).toBe(22);
      expect(result.model_metadata.horizon_days).toBe(7);

      const parsed = MlCommodityForecastResponseSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it('mengadaptasi respons ML ke struktur domain antarmuka PasokMataram', () => {
      const ml = generateDeterministicForecast('CABAI_RAWIT_MERAH', 48000, 30, 15);
      const adapted = adaptMlToDomainForecast(ml);

      expect(adapted.name).toBe(ml.name);
      expect(adapted.currentPrice).toBe(48000);
      expect(adapted.predictedPrice7d).toBe(ml.predicted_price_7d);
      expect(adapted.historicalAndProjected.length).toBe(22);
      expect(adapted.optimalBuyWindow.recommendedAction).toBeDefined();
    });
  });

  describe('Client Adapter Hermetic Behavior', () => {
    it('fetchMlSingleForecast mengembalikan fallback berstatus HERMETIC_FALLBACK saat offline', async () => {
      const res = await fetchMlSingleForecast('BAWANG_MERAH');
      expect(['FASTAPI_ML', 'HERMETIC_FALLBACK']).toContain(res.source);
      expect(res.data.commodity_code).toBe('BAWANG_MERAH');
    });

    it('fetchMlForecastList mengembalikan daftar komoditas tanpa exception', async () => {
      const res = await fetchMlForecastList();
      expect(['FASTAPI_ML', 'HERMETIC_FALLBACK']).toContain(res.source);
      expect(res.data.data.length).toBeGreaterThan(0);
    });

    it('simulateMlScenario menghitung skenario simulasi tanpa exception', async () => {
      const res = await simulateMlScenario({
        commodity_code: 'BAWANG_MERAH',
        current_price: 36000,
        rainfall_anomaly_percent: 25,
        fuel_price_hike_percent: 10,
      });

      expect(['FASTAPI_ML', 'HERMETIC_FALLBACK']).toContain(res.source);
      expect(res.data.current_price).toBe(36000);
      expect(res.data.predicted_prices_7d.length).toBe(7);
    });
  });

  describe('Next.js Route Handler /api/v1/forecast/ml', () => {
    it('GET /api/v1/forecast/ml mengembalikan daftar prakiraan hermetis', async () => {
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
