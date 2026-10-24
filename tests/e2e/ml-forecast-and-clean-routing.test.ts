/**
 * @file tests/e2e/ml-forecast-and-clean-routing.test.ts
 * @description Suite pengujian E2E validasi Minggu 2.0:
 * 1. Eliminasi total seluruh anchor hash (#) pada Navbar dan Footer
 * 2. Keberadaan seluruh rute semantik pemasaran mandiri (komoditas, alur, kalkulator, dll.)
 * 3. Keberadaan seluruh subrute operasional portal buyer & supplier
 * 4. Integritas dataset tiruan prediksi harga pangan AI untuk 6 komoditas unggulan DIY
 * 5. Ketersediaan komponen visual grafik interaktif dan kartu rekomendasi cerdas
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MOCK_COMMODITY_FORECASTS } from '../../apps/web/src/lib/mock-forecast-data';

describe('Minggu 2.0 - Clean Semantic Routing & AI Price Forecasting Verification', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webAppDir = path.join(rootDir, 'apps/web/src/app');

  it('memvalidasi Navbar tidak lagi menggunakan anchor hash (#) pada tautan navigasi', () => {
    const navbarPath = path.join(webAppDir, '_components/navbar.tsx');
    expect(fs.existsSync(navbarPath)).toBe(true);

    const content = fs.readFileSync(navbarPath, 'utf-8');
    expect(content).not.toContain("href: '#alur-pengadaan'");
    expect(content).not.toContain("href: '#solusi'");
    expect(content).not.toContain("href: '#komoditas'");
    expect(content).not.toContain("href: '#kalkulator'");
    expect(content).not.toContain("href: '#mekanisme'");
    expect(content).not.toContain("href: '#biaya'");
    expect(content).not.toContain("href: '#cerita'");
    expect(content).not.toContain("href: '#faq'");
    expect(content).not.toContain('href="#beranda"');

    expect(content).toContain("href: '/alur-pengadaan'");
    expect(content).toContain("href: '/komoditas'");
    expect(content).toContain("href: '/kalkulator'");
    expect(content).toContain("href: '/mekanisme'");
    expect(content).toContain("href: '/paket-layanan'");
    expect(content).toContain("href: '/prediksi-harga'");
    expect(content).toContain("href: '/tentang'");
    expect(content).toContain("href: '/faq'");
    expect(content).toContain('href="/"');
  });

  it('memvalidasi Footer tidak lagi menggunakan anchor hash (#) pada tautan navigasi', () => {
    const footerPath = path.join(webAppDir, '_components/footer.tsx');
    expect(fs.existsSync(footerPath)).toBe(true);

    const content = fs.readFileSync(footerPath, 'utf-8');
    expect(content).not.toContain('href="#beranda"');
    expect(content).not.toContain('href="#cerita"');
    expect(content).not.toContain('href="#langkah"');
    expect(content).not.toContain('href="#solusi"');
    expect(content).not.toContain('href="#komoditas"');

    expect(content).toContain('href="/"');
    expect(content).toContain('href="/tentang"');
    expect(content).toContain('href="/alur-pengadaan"');
    expect(content).toContain('href="/komoditas"');
    expect(content).toContain('href="/prediksi-harga"');
  });

  it('memvalidasi keberadaan 7 halaman rute pemasaran semantik mandiri', () => {
    const marketingRoutes = [
      'komoditas',
      'alur-pengadaan',
      'kalkulator',
      'mekanisme',
      'paket-layanan',
      'tentang',
      'faq',
    ];

    for (const route of marketingRoutes) {
      const pagePath = path.join(webAppDir, route, 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content).toContain('export const metadata');
    }
  });

  it('memvalidasi keberadaan seluruh subrute operasional portal buyer HoReKa', () => {
    const buyerSubroutes = [
      'orders',
      'deliveries',
      'qc',
      'katalog',
      'pooling',
      'team',
      'help',
      'forecast',
    ];

    for (const sub of buyerSubroutes) {
      const pagePath = path.join(webAppDir, 'buyer', sub, 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    }
  });

  it('memvalidasi keberadaan seluruh subrute operasional portal supplier Gapoktan', () => {
    const supplierSubroutes = [
      'allocations',
      'qc-handoff',
      'market',
      'help',
      'forecast',
    ];

    for (const sub of supplierSubroutes) {
      const pagePath = path.join(webAppDir, 'supplier', sub, 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    }
  });

  it('memvalidasi kelengkapan dataset tiruan 6 komoditas unggulan DIY untuk prakiraan AI', () => {
    expect(MOCK_COMMODITY_FORECASTS).toHaveLength(6);

    for (const c of MOCK_COMMODITY_FORECASTS) {
      expect(c.id).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.currentPrice).toBeGreaterThan(0);
      expect(c.predictedPrice7d).toBeGreaterThan(0);
      expect(c.predictedPrice30d).toBeGreaterThan(0);
      expect(c.predictedPrice90d).toBeGreaterThan(0);
      expect(c.confidenceScore).toBeGreaterThanOrEqual(90);
      expect(c.optimalBuyWindow).toBeDefined();
      expect(c.weatherAnomalyRisk).toBeDefined();
      expect(c.modelMetadata.algorithm).toContain('PasokML');
      expect(c.historicalAndProjected.length).toBeGreaterThan(14);
    }
  });

  it('memvalidasi etalase publik prediksi harga di /prediksi-harga', () => {
    const publicForecastPagePath = path.join(webAppDir, 'prediksi-harga', 'page.tsx');
    const simulatorPath = path.join(webAppDir, 'prediksi-harga', 'public-forecast-simulator.tsx');

    expect(fs.existsSync(publicForecastPagePath)).toBe(true);
    expect(fs.existsSync(simulatorPath)).toBe(true);
  });
});
