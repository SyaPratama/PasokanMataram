/**
 * @file tests/unit/ml/pasok-ensemble-and-adapters.test.ts
 * @description Pengujian unit untuk pipeline ekstraksi fitur, algoritma PasokML ensemble,
 * dan adapter ingesti multi-sumber Bapanas, PIHPS, BMKG, dan Lelang Kulon Progo.
 * Mematuhi Prinsip I, II, dan IV Konstitusi PasokMataram.
 */

import { describe, it, expect } from 'vitest';
import {
  FeatureStoreBuilder,
  PasokEnsembleForecaster,
  BapanasAdapter,
  PihpsAdapter,
  BmkgAdapter,
  LelangKulonProgoAdapter,
} from '../../../services/queue-worker/src';

describe('FeatureStoreBuilder - Ekstraksi Fitur Deret Waktu', () => {
  const dummyPrices = [
    { date: '2026-10-01', price: 40000 },
    { date: '2026-10-02', price: 41000 },
    { date: '2026-10-03', price: 42000 },
    { date: '2026-10-04', price: 41500 },
    { date: '2026-10-05', price: 43000 },
    { date: '2026-10-06', price: 44000 },
    { date: '2026-10-07', price: 45000 },
    { date: '2026-10-08', price: 46000 },
    { date: '2026-10-09', price: 47000 },
    { date: '2026-10-10', price: 46500 },
    { date: '2026-10-11', price: 48000 },
    { date: '2026-10-12', price: 49000 },
    { date: '2026-10-13', price: 50000 },
  ];

  it('berhasil menghitung fitur lag t-1, t-3, t-7, rolling mean dan volatilitas', () => {
    const vector = FeatureStoreBuilder.extractFeatures('test-comm-id', dummyPrices, 15.0);

    expect(vector.commodityId).toBe('test-comm-id');
    expect(vector.currentPrice).toBe(50000);
    expect(vector.lag1d).toBe(49000);
    expect(vector.lag3d).toBe(46500);
    expect(vector.lag7d).toBe(44000);
    expect(vector.rollingMean7d).toBeGreaterThan(45000);
    expect(vector.rollingVolatility14d).toBeGreaterThanOrEqual(0);
    expect(vector.cumulativeRainfall3d).toBe(15.0);
    expect(vector.monthOfYear).toBe(10);
  });

  it('melempar error jika riwayat harga kosong', () => {
    expect(() => FeatureStoreBuilder.extractFeatures('test-id', [])).toThrow();
  });
});

describe('PasokEnsembleForecaster - Inferensi Proyeksi Multi-Horizon', () => {
  const dummyHistory = [
    { date: '2026-10-01', price: 42000 },
    { date: '2026-10-02', price: 43000 },
    { date: '2026-10-03', price: 44000 },
    { date: '2026-10-04', price: 45000 },
    { date: '2026-10-05', price: 46000 },
    { date: '2026-10-06', price: 47000 },
    { date: '2026-10-07', price: 48000 },
  ];

  it('menghasilkan proyeksi 7d, 30d, 90d, trend, dan kurva harga', () => {
    const forecast = PasokEnsembleForecaster.generateForecast(
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Cabai Rawit Merah',
        category: 'Hortikultura',
        originRegion: 'Kulon Progo',
        unit: 'kg',
      },
      dummyHistory,
      25.0
    );

    expect(forecast.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(forecast.currentPrice).toBe(48000);
    expect(forecast.predictedPrice7d).toBeGreaterThan(0);
    expect(forecast.predictedPrice30d).toBeGreaterThan(0);
    expect(forecast.predictedPrice90d).toBeGreaterThan(0);
    expect(forecast.confidenceScore).toBe(88);
    expect(forecast.weatherAnomalyRisk.riskLevel).toBe('TINGGI');
    expect(forecast.optimalBuyWindow.recommendedAction).toBe('KUNCI_KONTRAK');
    expect(forecast.historicalAndProjected.length).toBeGreaterThanOrEqual(10);
  });
});

describe('Adapter Ingesti Multi-Sumber Data Terbuka DIY', () => {
  it('BapanasAdapter mengembalikan fallback harga valid saat offline', async () => {
    const offlineFetch = () => Promise.reject(new Error('Koneksi Bapanas tidak tersedia'));
    const adapter = new BapanasAdapter({ timeoutMs: 100, fetchFn: offlineFetch as unknown as typeof fetch });
    const prices = await adapter.fetchDailyPrices('2026-10-13');
    expect(prices.length).toBeGreaterThanOrEqual(5);
    expect(prices.every((p) => p.sourceType === 'BAPANAS')).toBe(true);
  });

  it('PihpsAdapter mengembalikan data pasar tradisional Yogyakarta', async () => {
    const offlineFetch = () => Promise.reject(new Error('Koneksi PIHPS tidak tersedia'));
    const adapter = new PihpsAdapter({ timeoutMs: 100, fetchFn: offlineFetch as unknown as typeof fetch });
    const prices = await adapter.fetchDailyMarketPrices('2026-10-13');
    expect(prices.length).toBeGreaterThanOrEqual(5);
    expect(prices.every((p) => p.sourceType === 'PIHPS')).toBe(true);
  });

  it('BmkgAdapter mengembalikan observasi cuaca 5 kabupaten/kota DIY', async () => {
    const offlineFetch = () => Promise.reject(new Error('Koneksi BMKG tidak tersedia'));
    const adapter = new BmkgAdapter({ timeoutMs: 100, fetchFn: offlineFetch as unknown as typeof fetch });
    const weather = await adapter.fetchDiyWeatherObservations('2026-10-13');
    expect(weather.length).toBe(5);
    expect(weather.some((w) => w.regency === 'SLEMAN')).toBe(true);
    expect(weather.some((w) => w.regency === 'KULON_PROGO')).toBe(true);
  });

  it('LelangKulonProgoAdapter mengembalikan harga lelang sore sentra tani', async () => {
    const offlineFetch = () => Promise.reject(new Error('Koneksi Lelang tidak tersedia'));
    const adapter = new LelangKulonProgoAdapter({ timeoutMs: 100, fetchFn: offlineFetch as unknown as typeof fetch });
    const auctions = await adapter.fetchAuctionPrices('2026-10-13');
    expect(auctions.length).toBeGreaterThanOrEqual(3);
    expect(auctions.every((a) => a.sourceType === 'PASAR_LELANG')).toBe(true);
  });
});
