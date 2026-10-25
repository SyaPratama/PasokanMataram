import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Minggu 1.6: UI Refinement, Asset Localization & Enterprise Technical SEO Test Suite', () => {
  const rootDir = process.cwd();

  it('memverifikasi seluruh aset fotografi agrikultur terlokalisasi di public/images/', () => {
    const imagesDir = path.join(rootDir, 'apps/web/public/images');
    expect(fs.existsSync(imagesDir)).toBe(true);

    const requiredAssets = [
      'hero/agricultural-fields-diy.webp',
      'hero/farmer-harvest-portrait.webp',
      'commodities/bawang-merah-srikayangan.webp',
      'commodities/cabai-rawit-panjatan.webp',
      'commodities/beras-premium-sleman.webp',
      'story/fresh-produce-basket.webp',
      'story/farmer-in-field.webp',
      'solutions/transit-hub.webp',
      'solutions/qc-lab.webp',
      'solutions/field-harvest.webp',
      'cta/agricultural-landscape.webp',
      'og/pasokmataram-og-cover.png',
    ];

    for (const relPath of requiredAssets) {
      const fullPath = path.join(imagesDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000); // Pastikan bukan file kosong
    }
  });

  it('memverifikasi struktur styling terpusat di src/styles/globals.css', () => {
    const stylesPath = path.join(rootDir, 'apps/web/src/styles/globals.css');
    expect(fs.existsSync(stylesPath)).toBe(true);

    const cssContent = fs.readFileSync(stylesPath, 'utf-8');
    expect(cssContent).toContain('--color-primer: #2E5339;');
    expect(cssContent).toContain('--color-sekunder: #B85324;');
    expect(cssContent).toContain('--color-aksen: #D48028;');
    expect(cssContent).toContain(':focus-visible');
    expect(cssContent).toContain('animate-landing-fade-in');
  });

  it('memverifikasi generator robots.ts native Next.js 14 App Router', async () => {
    const robotsPath = path.join(rootDir, 'apps/web/src/app/robots.ts');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const robotsModule = await import('../../apps/web/src/app/robots.js').catch(async () => {
      // Direct TypeScript import or parse content
      return { default: null };
    });

    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    expect(robotsContent).toContain('MetadataRoute.Robots');
    expect(robotsContent).toContain("allow: '/'");
    expect(robotsContent).toContain("'/api/'");
    expect(robotsContent).toContain("sitemap.xml");
  });

  it('memverifikasi generator sitemap.ts native Next.js 14 App Router', () => {
    const sitemapPath = path.join(rootDir, 'apps/web/src/app/sitemap.ts');
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    expect(sitemapContent).toContain('MetadataRoute.Sitemap');
    expect(sitemapContent).toContain("priority: 1.0");
    expect(sitemapContent).toContain("priority: 0.9");
    expect(sitemapContent).toContain("priority: 0.8");
    expect(sitemapContent).toContain("/register");
    expect(sitemapContent).not.toContain("/onboarding-kyb");
  });

  it('memverifikasi komponen Structured Data JSON-LD (Organization, BreadcrumbList, Product, AggregateOffer)', () => {
    const jsonLdPath = path.join(rootDir, 'apps/web/src/components/seo/json-ld.tsx');
    expect(fs.existsSync(jsonLdPath)).toBe(true);

    const jsonLdContent = fs.readFileSync(jsonLdPath, 'utf-8');
    expect(jsonLdContent).toContain("'@type': 'Organization'");
    expect(jsonLdContent).toContain("'@type': 'BreadcrumbList'");
    expect(jsonLdContent).toContain("'@type': 'Product'");
    expect(jsonLdContent).toContain("'@type': 'AggregateOffer'");
    expect(jsonLdContent).toContain('Bawang Merah Srikayangan');
    expect(jsonLdContent).toContain('Daerah Istimewa Yogyakarta');
  });

  it('memverifikasi konfigurasi enterprise metadata, canonical URL, OpenGraph 1200x630, dan kata kunci di layout.tsx', () => {
    const layoutPath = path.join(rootDir, 'apps/web/src/app/layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);

    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain('metadataBase');
    expect(layoutContent).toContain('canonical');
    expect(layoutContent).toContain('openGraph');
    expect(layoutContent).toContain('twitter');
    expect(layoutContent).toContain('1200');
    expect(layoutContent).toContain('630');
    expect(layoutContent).toContain('EnterpriseJsonLd');
    expect(layoutContent).toContain('pengadaan bahan baku restoran jogja');
    expect(layoutContent).toContain('supplier sayur hotel horeka sleman');
  });

  it('memverifikasi Navbar mengadopsi sistem Grouping Dropdown accessible dan mobile accordion', () => {
    const navbarPath = path.join(rootDir, 'apps/web/src/app/_components/navbar.tsx');
    expect(fs.existsSync(navbarPath)).toBe(true);

    const navbarContent = fs.readFileSync(navbarPath, 'utf-8');
    expect(navbarContent).toContain('Layanan Dapur');
    expect(navbarContent).toContain('Skema & Biaya');
    expect(navbarContent).toContain('Tentang Platform');
    expect(navbarContent).toContain('aria-expanded');
    expect(navbarContent).toContain('aria-haspopup="true"');
    expect(navbarContent).toContain('Daftar Kemitraan');
  });

  it('memverifikasi kalkulator duplikat telah dihapus dari mekanisme-pooling.tsx', () => {
    const poolingPath = path.join(rootDir, 'apps/web/src/app/_components/mekanisme-pooling.tsx');
    expect(fs.existsSync(poolingPath)).toBe(true);

    const poolingContent = fs.readFileSync(poolingPath, 'utf-8');
    expect(poolingContent).not.toContain('Kalkulator Efisiensi Pengadaan Bawang Merah Srikayangan');
    expect(poolingContent).not.toContain('Simulasi Kebutuhan Dapur');
    expect(poolingContent).toContain('Mekanisme Pooling: Harga Grosir untuk Dapur Mandiri');
    expect(poolingContent).toContain('QC Hub Transit Bantul');
    expect(poolingContent).toContain('Garansi Bebas Risiko Retur');
  });

  it('memverifikasi Floating Action Button PWA terpasang di pojok kanan bawah (bottom-6 right-6)', () => {
    const fabPath = path.join(rootDir, 'apps/web/src/components/pwa-floating-button.tsx');
    expect(fs.existsSync(fabPath)).toBe(true);

    const fabContent = fs.readFileSync(fabPath, 'utf-8');
    expect(fabContent).toContain('fixed bottom-6 right-6 z-40');
    expect(fabContent).toContain('Aplikasi Dapur PWA');
    expect(fabContent).toContain('role="dialog"');
    expect(fabContent).toContain('usePwaInstall');
  });
});
