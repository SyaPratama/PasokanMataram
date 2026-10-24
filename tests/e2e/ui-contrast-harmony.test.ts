/**
 * @file tests/e2e/ui-contrast-harmony.test.ts
 * @description Suite pengujian E2E validasi Minggu 1.65:
 * 1. Keberadaan favicon.ico & icon.svg di native Next.js 14 App Router (src/app/)
 * 2. Konsistensi penggunaan Next/image pada seluruh logo kustom (Navbar, Footer, PWA Modal)
 * 3. Harmonisasi warna komplementer (eliminasi warna lime-green #7CB342 becek)
 * 4. Kepatuhan kontras WCAG 2.1 AA (>= 4.5:1) & pencegahan line-wrap pada badge harga
 * 5. Isolasi CSS di dalam folder src/styles/ dan direktori tests/screenshots dengan .gitignore
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Minggu 1.65 - Brand Identity & UI Contrast Harmony Verification', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webSrcDir = path.join(rootDir, 'apps/web/src');
  const webAppDir = path.join(webSrcDir, 'app');

  it('memvalidasi penempatan berkas native favicon & icon di src/app/', () => {
    const faviconAppPath = path.join(webAppDir, 'favicon.ico');
    const iconAppPath = path.join(webAppDir, 'icon.svg');
    const appleIconAppPath = path.join(webAppDir, 'apple-icon.svg');

    expect(fs.existsSync(faviconAppPath)).toBe(true);
    expect(fs.existsSync(iconAppPath)).toBe(true);
    expect(fs.existsSync(appleIconAppPath)).toBe(true);

    const iconContent = fs.readFileSync(iconAppPath, 'utf-8');
    expect(iconContent).toContain('<svg');
    expect(iconContent).toContain('</svg>');
  });

  it('memvalidasi isolasi berkas CSS hanya berada di dalam folder src/styles/ (bukan file lepas)', () => {
    const looseAppCssPath = path.join(webAppDir, 'globals.css');
    const centralizedStylesCssPath = path.join(webSrcDir, 'styles/globals.css');

    // Wajib: tidak ada globals.css yang berdiri sendiri di src/app/
    expect(fs.existsSync(looseAppCssPath)).toBe(false);

    // Wajib: styles/globals.css adalah sumber styling tunggal
    expect(fs.existsSync(centralizedStylesCssPath)).toBe(true);
    const stylesContent = fs.readFileSync(centralizedStylesCssPath, 'utf-8');
    expect(stylesContent).toContain('@tailwind base;');
    expect(stylesContent).toContain('font-family: var(--font-heading)');
  });

  it('memvalidasi integrasi Next/image pada logo Navbar (desktop & drawer mobile)', () => {
    const navbarPath = path.join(webAppDir, '_components/navbar.tsx');
    expect(fs.existsSync(navbarPath)).toBe(true);

    const content = fs.readFileSync(navbarPath, 'utf-8');
    expect(content).toContain("import Image from 'next/image';");
    expect(content).toContain('src="/icons/icon.svg"');
    expect(content).toContain('alt="Logo PasokMataram"');
  });

  it('memvalidasi integrasi Next/image pada logo Footer', () => {
    const footerPath = path.join(webAppDir, '_components/footer.tsx');
    expect(fs.existsSync(footerPath)).toBe(true);

    const content = fs.readFileSync(footerPath, 'utf-8');
    expect(content).toContain("import Image from 'next/image';");
    expect(content).toContain('src="/icons/icon.svg"');
    expect(content).toContain('alt="Logo PasokMataram"');
  });

  it('memvalidasi integrasi Next/image pada modal PWA Floating Action Button', () => {
    const pwaFabPath = path.join(webSrcDir, 'components/pwa-floating-button.tsx');
    expect(fs.existsSync(pwaFabPath)).toBe(true);

    const content = fs.readFileSync(pwaFabPath, 'utf-8');
    expect(content).toContain("import Image from 'next/image';");
    expect(content).toContain('src="/icons/icon-192.svg"');
    expect(content).toContain('alt="Ikon PasokMataram PWA"');
  });

  it('memvalidasi perbaikan tombol Lihat Semua Komoditas dan Kartu 02 di solutions-grid.tsx', () => {
    const solutionsPath = path.join(webAppDir, '_components/solutions-grid.tsx');
    expect(fs.existsSync(solutionsPath)).toBe(true);

    const content = fs.readFileSync(solutionsPath, 'utf-8');

    // Tombol Lihat Semua Komoditas harus bg-primer text-white (kontras 8.33:1), bukan bg-cta
    expect(content).toContain('bg-primer text-white hover:bg-primer-hover');
    expect(content).not.toContain('bg-cta text-primer-darkest hover:bg-cta-hover');

    // Kartu 02 tidak boleh menjadi blok hijau lime penuh (bg-cta)
    expect(content).toContain('bg-white border-2 border-primer/30');
    expect(content).toContain('Kunci Alokasi Kuota');
    expect(content).toContain('Proteksi Escrow 100%');
  });

  it('memvalidasi pencegahan line-wrap (whitespace-nowrap) dan kontras tinggi pada badge paket-layanan.tsx', () => {
    const paketPath = path.join(webAppDir, '_components/paket-layanan.tsx');
    expect(fs.existsSync(paketPath)).toBe(true);

    const content = fs.readFileSync(paketPath, 'utf-8');

    // Badge Paling Banyak Dipilih harus memiliki whitespace-nowrap dan warna komplementer Bata Mataram
    expect(content).toContain('whitespace-nowrap');
    expect(content).toContain('bg-sekunder text-white');
    expect(content).not.toContain('bg-cta text-white shadow-md uppercase tracking-wider');

    // Tombol kartu rekomendasi harus kontras tinggi (bg-white text-primer-deep)
    expect(content).toContain('bg-white text-primer-deep hover:bg-white/95');
  });

  it('memvalidasi keberadaan direktori screenshots dan file .gitignore', () => {
    const screenshotsDir = path.join(rootDir, 'tests/screenshots');
    const gitignorePath = path.join(screenshotsDir, '.gitignore');

    expect(fs.existsSync(screenshotsDir)).toBe(true);
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignoreContent).toContain('*');
    expect(gitignoreContent).toContain('!.gitignore');
  });
});
