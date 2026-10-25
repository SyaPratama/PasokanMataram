/**
 * @file tests/e2e/ux-refinements-and-gating.test.ts
 * @description Suite pengujian verifikasi penyempurnaan UI/UX, Copywriting, dan Progressive KYB Gating:
 * 1. Dropdown wilayah operasional DIY menggunakan custom ChevronDown dengan inset padding proporsional (tidak mepet/terlalu jauh)
 * 2. Penghapusan teks 'Pendaftar Pertama = OWNER' di halaman registrasi
 * 3. Arah navigasi pasca-registrasi langsung ke dashboard mandiri (/buyer/dashboard atau /supplier/dashboard)
 * 4. Eliminasi tombol 'Verifikasi Usaha' dari hero section landing page, digantikan eksplorasi 'Lihat Komoditas Pangan'
 * 5. Generalisasi teks keamanan login ('Terproteksi Sistem Enkripsi & Keamanan Data Usaha')
 * 6. Generalisasi teks analisis harga ('Pusat Analisis Tren Harga Pangan DIY' & badge 'Tren DIY')
 * 7. Gating ketat pemesanan/pembelian mewajibkan verifikasi KTP & NIB di menu Legalitas & KYB dashboard
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Penyempurnaan UI/UX, Copywriting Humanis, dan Gating Legalitas KYB', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webAppDir = path.join(rootDir, 'apps/web/src/app');
  const webComponentsDir = path.join(rootDir, 'apps/web/src/components');

  it('1. memvalidasi dropdown wilayah operasional DIY di register/page.tsx berjarak rapi dengan ChevronDown dan pr-10', () => {
    const registerPath = path.join(webAppDir, '(auth)/register/page.tsx');
    expect(fs.existsSync(registerPath)).toBe(true);

    const content = fs.readFileSync(registerPath, 'utf-8');
    expect(content).toContain('import {');
    expect(content).toContain('ChevronDown');
    expect(content).toContain('id="reg-regency"');
    expect(content).toContain('pl-3.5 pr-10');
    expect(content).toContain('appearance-none cursor-pointer');
    expect(content).toContain('absolute right-3.5 top-1/2 -translate-y-1/2');
  });

  it('2. memastikan teks "Pendaftar Pertama = OWNER" telah dihapus dari halaman registrasi', () => {
    const registerPath = path.join(webAppDir, '(auth)/register/page.tsx');
    const content = fs.readFileSync(registerPath, 'utf-8');
    expect(content).not.toContain('Pendaftar Pertama = OWNER');
    expect(content).not.toContain('Pendaftar Pertama');
  });

  it('3. memvalidasi bahwa pasca-registrasi langsung mengarahkan ke dashboard pengguna tanpa paksaan verifikasi berkas di awal', () => {
    const registerPath = path.join(webAppDir, '(auth)/register/page.tsx');
    const content = fs.readFileSync(registerPath, 'utf-8');
    expect(content).toContain("const targetDashboard = intent === 'HOREKA' ? '/buyer/dashboard' : '/supplier/dashboard';");
    expect(content).toContain('router.push(targetDashboard);');
  });

  it('4. memvalidasi hero section landing page tidak memuat tombol "Verifikasi Usaha", diganti "Lihat Komoditas Pangan"', () => {
    const heroPath = path.join(webAppDir, '_components/hero-section.tsx');
    expect(fs.existsSync(heroPath)).toBe(true);

    const content = fs.readFileSync(heroPath, 'utf-8');
    expect(content).not.toContain('<span>Verifikasi Usaha</span>');
    expect(content).not.toContain('href="/onboarding-kyb"');
    expect(content).toContain('<span>Lihat Komoditas Pangan</span>');
    expect(content).toContain('href="/komoditas"');
  });

  it('5. memvalidasi teks keamanan login telah digeneralisasi (anti-jargon)', () => {
    const loginPath = path.join(webAppDir, '(auth)/login/page.tsx');
    const content = fs.readFileSync(loginPath, 'utf-8');
    expect(content).not.toContain('Row-Level Security &amp; Argon2id');
    expect(content).not.toContain('Argon2id Kriptografi');
    expect(content).toContain('Terproteksi Sistem Enkripsi &amp; Keamanan Data Usaha');
  });

  it('6. memvalidasi teks prakiraan harga telah digeneralisasi (bebas jargon PasokML v2.1)', () => {
    const publicForecastPath = path.join(webAppDir, 'prediksi-harga/page.tsx');
    const content = fs.readFileSync(publicForecastPath, 'utf-8');
    expect(content).not.toContain('PasokML Forecasting Intelligence v2.1');
    expect(content).toContain('Pusat Analisis Tren Harga Pangan DIY');

    const buyerLayoutPath = path.join(webAppDir, 'buyer/layout.tsx');
    const buyerLayoutContent = fs.readFileSync(buyerLayoutPath, 'utf-8');
    expect(buyerLayoutContent).toContain("badge: 'Tren DIY'");

    const supplierLayoutPath = path.join(webAppDir, 'supplier/layout.tsx');
    const supplierLayoutContent = fs.readFileSync(supplierLayoutPath, 'utf-8');
    expect(supplierLayoutContent).toContain("badge: 'Tren DIY'");
  });

  it('7. memvalidasi modal KybBlockerModal dan integrasi gating pemesanan/pembelian bahan dapur', () => {
    const modalPath = path.join(webComponentsDir, 'shared/kyb-blocker-modal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');
    expect(content).toContain('KTP Penanggung Jawab &amp; NIB / Izin Usaha');
    expect(content).toContain('Syarat Memesan &amp; Membeli');
    expect(content).toContain('Buka Legalitas &amp; KYB');
    expect(content).toContain('href="/buyer/legalitas"');

    const poolingPath = path.join(webAppDir, 'buyer/pooling/page.tsx');
    const poolingContent = fs.readFileSync(poolingPath, 'utf-8');
    expect(poolingContent).toContain('KybBlockerModal');
    expect(poolingContent).toContain('isKybVerified');

    const ordersPath = path.join(webAppDir, 'buyer/orders/page.tsx');
    const ordersContent = fs.readFileSync(ordersPath, 'utf-8');
    expect(ordersContent).toContain('KybBlockerModal');
    expect(ordersContent).toContain('isKybVerified');

    const katalogPath = path.join(webAppDir, 'buyer/katalog/page.tsx');
    const katalogContent = fs.readFileSync(katalogPath, 'utf-8');
    expect(katalogContent).toContain('KybBlockerModal');
    expect(katalogContent).toContain('isKybVerified');
  });
});
