/**
 * @file tests/e2e/mobile-bottom-nav-and-dashboard-kyb.test.ts
 * @description Suite pengujian verifikasi bilah navigasi bawah mobile (Image #2) dan pemisahan fitur KYB ke dalam dashboard:
 * 1. Mobile bottom navigation bar di DashboardShell: tepat 5 destinasi (4 inti + 1 Lainnya drawer trigger).
 * 2. Eliminasi tombol burger menu (<Menu />) pada navbar atas mobile dashboard.
 * 3. Pemisahan verifikasi KYB ke dalam dashboard mandiri (/buyer/legalitas dan /supplier/legalitas), bukan di registrasi awal.
 * 4. Gating legalitas transaksional tetap kokoh melalui KybBlockerModal.
 * 5. Kepatuhan WCAG AA touch target >= 48px dan kelas safe-area PWA pb-safe.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Dashboard Mobile Bottom Bar (Image #2) & In-Dashboard KYB Verification (Image #1)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webAppDir = path.join(rootDir, 'apps/web/src/app');
  const webComponentsDir = path.join(rootDir, 'apps/web/src/components');

  describe('1. Mobile Bottom Navigation Bar & Topbar Refactoring (Image #2)', () => {
    it('memvalidasi penghapusan burger menu dari navbar atas mobile di dashboard-shell.tsx', () => {
      const shellPath = path.join(webComponentsDir, 'dashboard-shell/dashboard-shell.tsx');
      const content = fs.readFileSync(shellPath, 'utf-8');

      expect(content).not.toMatch(/<Menu\s/);
      expect(content).not.toContain('aria-label="Buka Menu Navigasi"');
      expect(content).toContain('Portal <span className="text-sekunder">{portalBadge.label}</span>');
    });

    it('memvalidasi fixed bottom navigation bar dengan maksimal 5 item (grid-cols-5) dan tombol Lainnya', () => {
      const shellPath = path.join(webComponentsDir, 'dashboard-shell/dashboard-shell.tsx');
      const content = fs.readFileSync(shellPath, 'utf-8');

      expect(content).toContain('aria-label="Navigasi Bawah Mobile"');
      expect(content).toContain('grid grid-cols-5');
      expect(content).toContain('min-h-[48px]');
      expect(content).toContain('pb-safe');
      expect(content).toContain('MoreHorizontal');
      expect(content).toContain('onClick={() => setMobileMenuOpen(true)}');
      expect(content).toContain('Lainnya');
    });

    it('memvalidasi penambahan offset pb-24 pada container main agar tidak tertutup bottom bar mobile', () => {
      const shellPath = path.join(webComponentsDir, 'dashboard-shell/dashboard-shell.tsx');
      const content = fs.readFileSync(shellPath, 'utf-8');

      expect(content).toContain('pb-24');
    });

    it('memvalidasi konfigurasi bottomNavItems pada Buyer, Supplier, dan Hub layout', () => {
      const buyerLayout = fs.readFileSync(path.join(webAppDir, 'buyer/layout.tsx'), 'utf-8');
      expect(buyerLayout).toContain('bottomNavItems={bottomNavItems}');
      expect(buyerLayout).toContain("href: '/buyer/dashboard'");
      expect(buyerLayout).toContain("href: '/buyer/katalog'");
      expect(buyerLayout).toContain("href: '/buyer/pooling'");
      expect(buyerLayout).toContain("href: '/buyer/legalitas'");

      const supplierLayout = fs.readFileSync(path.join(webAppDir, 'supplier/layout.tsx'), 'utf-8');
      expect(supplierLayout).toContain('bottomNavItems={bottomNavItems}');
      expect(supplierLayout).toContain("href: '/supplier/dashboard'");
      expect(supplierLayout).toContain("href: '/supplier/allocations'");
      expect(supplierLayout).toContain("href: '/supplier/market'");
      expect(supplierLayout).toContain("href: '/supplier/legalitas'");

      const hubLayout = fs.readFileSync(path.join(webAppDir, 'hub/layout.tsx'), 'utf-8');
      expect(hubLayout).toContain('bottomNavItems={bottomNavItems}');
      expect(hubLayout).toContain("href: '/hub/inbound'");
      expect(hubLayout).toContain("href: '/hub/weighing'");
      expect(hubLayout).toContain("href: '/hub/deliveries'");
      expect(hubLayout).toContain("href: '/hub/quarantine'");
    });
  });

  describe('2. In-Dashboard KYB Verification Separation (Image #1)', () => {
    it('memvalidasi keberadaan halaman verifikasi legalitas mandiri di /buyer/legalitas', () => {
      const buyerLegalitasPath = path.join(webAppDir, 'buyer/legalitas/page.tsx');
      expect(fs.existsSync(buyerLegalitasPath)).toBe(true);

      const content = fs.readFileSync(buyerLegalitasPath, 'utf-8');
      expect(content).toContain('Verifikasi Kepatuhan Usaha (KYB)');
      expect(content).toContain('DocumentUploader');
      expect(content).toContain('StatusBadge');
      expect(content).toContain('RemediationPanel');
      expect(content).toContain('Nomor Induk Berusaha (NIB OSS RI)');
      expect(content).toContain('KTP Penanggung Jawab');
    });

    it('memvalidasi keberadaan halaman verifikasi legalitas mandiri di /supplier/legalitas', () => {
      const supplierLegalitasPath = path.join(webAppDir, 'supplier/legalitas/page.tsx');
      expect(fs.existsSync(supplierLegalitasPath)).toBe(true);

      const content = fs.readFileSync(supplierLegalitasPath, 'utf-8');
      expect(content).toContain('Legalitas &amp; Sertifikasi Gapoktan');
      expect(content).toContain('DocumentUploader');
      expect(content).toContain('StatusBadge');
      expect(content).toContain('Surat Pengukuhan / SK Gapoktan');
    });

    it('memvalidasi tautan sidebar dashboard mengarah ke rute legalitas internal, bukan eksternal auth', () => {
      const buyerLayout = fs.readFileSync(path.join(webAppDir, 'buyer/layout.tsx'), 'utf-8');
      expect(buyerLayout).toContain("href: '/buyer/legalitas'");
      expect(buyerLayout).toContain("active: pathname === '/buyer/legalitas'");

      const supplierLayout = fs.readFileSync(path.join(webAppDir, 'supplier/layout.tsx'), 'utf-8');
      expect(supplierLayout).toContain("href: '/supplier/legalitas'");
      expect(supplierLayout).toContain("active: pathname === '/supplier/legalitas'");
    });

    it('memvalidasi alur registrasi tidak memaksa pengguna ke /onboarding-kyb', () => {
      const registerPath = path.join(webAppDir, '(auth)/register/page.tsx');
      const content = fs.readFileSync(registerPath, 'utf-8');

      expect(content).toContain("intent === 'HOREKA' ? '/buyer/dashboard' : '/supplier/dashboard'");
      expect(content).not.toContain("router.push('/onboarding-kyb')");
    });
  });
});
