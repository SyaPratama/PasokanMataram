import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Pengadaan Dapur Restoran & Native PWA Integration Test Suite', () => {
  const rootDir = process.cwd();

  it('memverifikasi W3C Web App Manifest valid dan memiliki konfigurasi PWA mandiri', () => {
    const manifestPath = path.join(rootDir, 'apps/web/public/manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifestContent.name).toBe('PasokMataram - Pengadaan Bahan Baku Dapur Restoran');
    expect(manifestContent.short_name).toBe('PasokMataram');
    expect(manifestContent.display).toBe('standalone');
    expect(manifestContent.theme_color).toBe('#2E5339');
    expect(manifestContent.icons).toHaveLength(2);
    expect(manifestContent.icons[0].src).toBe('/icons/icon-192.svg');
    expect(manifestContent.icons[1].src).toBe('/icons/icon-512.svg');
  });

  it('memverifikasi keberadaan native Service Worker dan strategi caching offline shell', () => {
    const swPath = path.join(rootDir, 'apps/web/public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain('pasokmataram-pwa-v1.5');
    expect(swContent).toContain('install');
    expect(swContent).toContain('activate');
    expect(swContent).toContain('fetch');
    expect(swContent).toContain('/manifest.webmanifest');
  });

  it('memverifikasi ikon SVG PWA beresolusi 192px dan 512px tersedia di public/icons', () => {
    const icon192Path = path.join(rootDir, 'apps/web/public/icons/icon-192.svg');
    const icon512Path = path.join(rootDir, 'apps/web/public/icons/icon-512.svg');

    expect(fs.existsSync(icon192Path)).toBe(true);
    expect(fs.existsSync(icon512Path)).toBe(true);

    const icon192 = fs.readFileSync(icon192Path, 'utf-8');
    expect(icon192).toContain('<svg');
    expect(icon192).toContain('</svg>');
  });

  it('memverifikasi komponen PWA registrar dan hook usePwaInstall terimplementasi dengan benar', () => {
    const registrarPath = path.join(rootDir, 'apps/web/src/components/pwa-registrar.tsx');
    const hookPath = path.join(rootDir, 'apps/web/src/hooks/use-pwa-install.ts');
    const bannerPath = path.join(rootDir, 'apps/web/src/components/pwa-install-banner.tsx');

    expect(fs.existsSync(registrarPath)).toBe(true);
    expect(fs.existsSync(hookPath)).toBe(true);
    expect(fs.existsSync(bannerPath)).toBe(true);

    const hookContent = fs.readFileSync(hookPath, 'utf-8');
    expect(hookContent).toContain('beforeinstallprompt');
    expect(hookContent).toContain('display-mode: standalone');
  });

  it('memverifikasi komponen pemasaran pengadaan dapur (Hero, Alur Pengadaan, Kalkulator, Paket B2B) terpasang', () => {
    const heroPath = path.join(rootDir, 'apps/web/src/app/_components/hero-section.tsx');
    const alurPath = path.join(rootDir, 'apps/web/src/app/_components/alur-pengadaan.tsx');
    const kalkulatorPath = path.join(rootDir, 'apps/web/src/app/_components/kalkulator-penghematan.tsx');
    const paketPath = path.join(rootDir, 'apps/web/src/app/_components/paket-b2b.tsx');
    const pagePath = path.join(rootDir, 'apps/web/src/app/page.tsx');

    expect(fs.existsSync(heroPath)).toBe(true);
    expect(fs.existsSync(alurPath)).toBe(true);
    expect(fs.existsSync(kalkulatorPath)).toBe(true);
    expect(fs.existsSync(paketPath)).toBe(true);

    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    expect(pageContent).toContain('AlurPengadaan');
    expect(pageContent).toContain('KalkulatorPenghematan');
    expect(pageContent).toContain('PaketB2b');
    expect(pageContent.includes('PwaInstallBanner') || pageContent.includes('PwaFloatingButton')).toBe(true);

    const heroContent = fs.readFileSync(heroPath, 'utf-8');
    expect(heroContent).toContain('Pengadaan Bahan Baku Dapur Restoran & Petani');
    expect(heroContent).toContain('Mulai Pengadaan');

    const alurContent = fs.readFileSync(alurPath, 'utf-8');
    expect(alurContent).toContain('QC Digital di PWA & Pencairan Dana');

    const kalkulatorContent = fs.readFileSync(kalkulatorPath, 'utf-8');
    expect(kalkulatorContent).toContain('Hitung Potensi Penghematan Dapur');

    const paketContent = fs.readFileSync(paketPath, 'utf-8');
    expect(paketContent).toContain('Dapur Mandiri');
    expect(paketContent).toContain('Jaringan Multi-Outlet');
    expect(paketContent).toContain('Mitra Gapoktan');
  });

  it('memverifikasi batasan Zero-IoT: tidak ada modul atau pustaka perangkat keras IoT', () => {
    const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    const allDeps = {
      ...(rootPkg.dependencies || {}),
      ...(rootPkg.devDependencies || {}),
    };

    // Ensure zero IoT packages
    const bannedIotKeywords = ['mqtt', 'zigbee', 'serialport', 'johnny-five', 'onoff', 'raspi'];
    for (const pkg of Object.keys(allDeps)) {
      for (const banned of bannedIotKeywords) {
        expect(pkg.toLowerCase()).not.toContain(banned);
      }
    }
  });
});
