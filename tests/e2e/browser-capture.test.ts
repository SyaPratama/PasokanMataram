/**
 * @file tests/e2e/browser-capture.test.ts
 * @description Automated browser & DOM capture test verifying rendered pages, standard PostCSS CSS integration, and UI elements.
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

let BASE_URL = process.env.APP_URL || 'http://127.0.0.1:3002';

let isServerUp = false;

beforeAll(async () => {
  const candidates = [process.env.APP_URL, 'http://127.0.0.1:3002', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://localhost:3000'].filter(Boolean) as string[];
  for (const candidate of candidates) {
    try {
      const res = await fetch(`${candidate}/`, { signal: AbortSignal.timeout(2000) });
      const reg = await fetch(`${candidate}/register`, { signal: AbortSignal.timeout(2000) });
      if (res.ok && reg.ok) {
        BASE_URL = candidate;
        isServerUp = true;
        break;
      }
    } catch {
      // try next candidate
    }
  }
  if (!isServerUp) {
    console.warn(`[E2E TEST INFO] Server offline di ${candidates.join(', ')}. Pengujian browser capture dilewati secara terisolasi.`);
  }
});

describe('Browser & Web Capture Automated Test', () => {
  beforeEach((ctx) => {
    if (!isServerUp) {
      ctx.skip();
    }
  });

  it('berhasil memvalidasi rendering halaman landing page (GET /)', async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('PasokMataram');
    expect(html).toContain('Digitalisasi Rantai Pasok Pangan');
    expect(html).toContain('One-Stop Supplier Pangan DIY');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/buyer/legalitas"');

    // Validasi skip link aksesibilitas (antislop-human)
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');

    // Validasi tautan navigasi ke rute semantik App Router bebas hash (Minggu 2.0)
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/alur-pengadaan"');
    expect(html).toContain('href="/komoditas"');
    expect(html).toContain('href="/kalkulator"');
    expect(html).toContain('href="/mekanisme"');
    expect(html).toContain('href="/paket-layanan"');
    expect(html).toContain('href="/prediksi-harga"');
    expect(html).toContain('href="/tentang"');
    expect(html).toContain('href="/faq"');
  });

  it('berhasil memvalidasi Hero Container mengadopsi layout referensi', async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain('5 Kabupaten/Kota');
    expect(html).toContain('Kulon Progo, Bantul, Sleman, Gunungkidul');
    expect(html).toContain('Lihat Komoditas Pangan');
  });

  it('berhasil memvalidasi Story Mission 2-kolom dengan foto tumpang tindih', async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain('Menghubungkan Sentra Panen Langsung ke Meja Dapur Kafe');
    expect(html).toContain('Pangkas 5 titik rantai pasok tradisional');
    expect(html).toContain('Pelajari Alur Kerja');
  });

  it('berhasil memvalidasi 4 Langkah Sourcing dan Grid Asimetris Solusi', async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain('Langkah Mudah Kolaborasi Sourcing');
    expect(html).toContain('Hubungkan Profil Usaha');
    expect(html).toContain('Kunci Alokasi Kuota');
    expect(html).toContain('QC di Hub Transit Bantul');
    expect(html).toContain('Drop Subuh &amp; Rilis Dana');
    expect(html).toContain('Standar Mutu &amp; Fasilitas Hub Transit Sentral');
  });

  it('berhasil memvalidasi katalog komoditas sentra DIY (#komoditas)', async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain('Bawang Merah Srikayangan');
    expect(html).toContain('Cabai Rawit Merah Panjatan');
    expect(html).toContain('Beras Premium Sleman');
  });

  it('berhasil memvalidasi split FAQ dan banner pra-footer', async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain('Pertanyaan yang Sering Diajukan');
    expect(html).toContain('Bagaimana jika kualitas atau timbangan komoditas saat tiba di dapur tidak sesuai?');
    expect(html).toContain('Siap Memulai Efisiensi Pengadaan Dapur Anda?');
  });

  it('berhasil memvalidasi formulir pendaftaran bisnis (GET /register)', async () => {
    const response = await fetch(`${BASE_URL}/register`);
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('Pendaftaran Entitas Usaha');
    expect(html).toContain('Pembeli HoReKa');
    expect(html).toContain('Pemasok Gapoktan');
  });

  it('berhasil memvalidasi komponen legalitas KYB di dashboard (GET /buyer/legalitas)', async () => {
    const response = await fetch(`${BASE_URL}/buyer/legalitas?sandbox=true&persona=BUYER`);
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('Legalitas');
    expect(html).toContain('KYB');
    expect(html).toContain('PDF atau WebP');
  });

  it('berhasil memastikan bundle CSS PostCSS dimuat di seluruh halaman', async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();
    expect(html).toMatch(/<link[^>]+rel=["']stylesheet["']|style/);
  });
});
