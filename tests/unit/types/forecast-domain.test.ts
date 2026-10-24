/**
 * @file tests/unit/types/forecast-domain.test.ts
 * @description Pengujian unit untuk tipe domain branded types dan skema Zod prakiraan harga pangan ML.
 * Mematuhi Prinsip II, III, dan XIII Konstitusi PasokMataram.
 */

import { describe, it, expect } from 'vitest';
import {
  asCommodityId,
  asForecastRecordId,
  CommodityForecastSchema,
  PriceDataPointSchema,
  MarketPriceIngestSchema,
  WeatherObservationSchema,
} from '@pasok/domain';

describe('Domain Prakiraan Harga Komoditas - Branded Types', () => {
  it('berhasil memvalidasi UUID valid untuk CommodityId', () => {
    const validUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const branded = asCommodityId(validUuid);
    expect(branded).toBe(validUuid);
  });

  it('melempar TypeError untuk format UUID yang tidak valid pada CommodityId', () => {
    expect(() => asCommodityId('bukan-uuid')).toThrow(TypeError);
    expect(() => asCommodityId('12345')).toThrow(TypeError);
  });

  it('berhasil memvalidasi UUID valid untuk ForecastRecordId', () => {
    const validUuid = 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
    const branded = asForecastRecordId(validUuid);
    expect(branded).toBe(validUuid);
  });

  it('melempar TypeError untuk format UUID yang tidak valid pada ForecastRecordId', () => {
    expect(() => asForecastRecordId('invalid-uuid-token')).toThrow(TypeError);
  });
});

describe('Domain Prakiraan Harga Komoditas - Skema Validasi Zod', () => {
  it('berhasil memvalidasi titik data kurva harga PriceDataPointSchema', () => {
    const validPoint = {
      date: '2026-10-13',
      price: 48500,
      isProjected: false,
    };
    const parsed = PriceDataPointSchema.safeParse(validPoint);
    expect(parsed.success).toBe(true);
  });

  it('menolak PriceDataPointSchema jika harga bernilai negatif atau nol', () => {
    const invalidPoint = {
      date: '2026-10-13',
      price: -5000,
      isProjected: true,
    };
    const parsed = PriceDataPointSchema.safeParse(invalidPoint);
    expect(parsed.success).toBe(false);
  });

  it('berhasil memvalidasi payload MarketPriceIngestSchema dari scraper', () => {
    const payload = {
      commodityCode: 'CABAI_RAWIT_MERAH',
      sourceType: 'BAPANAS' as const,
      price: 48000,
      marketLocation: 'Pasar Beringharjo',
      recordedDate: '2026-10-13',
      metadata: { originalName: 'Cabai Rawit Merah' },
    };
    const parsed = MarketPriceIngestSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('berhasil memvalidasi observasi cuaca BMKG WeatherObservationSchema', () => {
    const weather = {
      regency: 'KULON_PROGO' as const,
      recordedDate: '2026-10-13',
      rainfallMm: 18.5,
      humidityPercent: 85,
      temperatureCelsius: 27.5,
      weatherCondition: 'Hujan Ringan',
      bmkgStationCode: 'AWS Panjatan Kulon Progo',
    };
    const parsed = WeatherObservationSchema.safeParse(weather);
    expect(parsed.success).toBe(true);
  });

  it('berhasil memvalidasi entitas lengkap CommodityForecastSchema', () => {
    const forecast = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Cabai Rawit Merah',
      category: 'Hortikultura' as const,
      originRegion: 'Kulon Progo (Panjatan)',
      unit: 'kg',
      currentPrice: 48000,
      predictedPrice7d: 52000,
      predictedPrice30d: 58000,
      predictedPrice90d: 45000,
      trend: 'UP' as const,
      trendPercentage: 20.8,
      confidenceScore: 88,
      optimalBuyWindow: {
        startDate: '2026-10-13',
        endDate: '2026-10-18',
        targetPrice: 48000,
        recommendedAction: 'KUNCI_KONTRAK' as const,
        explanation: 'Potensi kenaikan harga akibat anomali hujan.',
      },
      weatherAnomalyRisk: {
        riskLevel: 'TINGGI' as const,
        description: 'Hujan intensitas tinggi di sentra pesisir.',
        rainfallForecastMm: 25.0,
        bmkgSource: 'BMKG DIY',
      },
      modelMetadata: {
        algorithm: 'PasokML Ensemble v1.0',
        mapeAccuracy: 3.8,
        lastTrained: '2026-10-13T04:00:00Z',
      },
      historicalAndProjected: [
        { date: '2026-10-13', price: 48000, isProjected: false },
        { date: '2026-10-20', price: 52000, isProjected: true },
      ],
    };
    const parsed = CommodityForecastSchema.safeParse(forecast);
    expect(parsed.success).toBe(true);
  });
});
