/**
 * @file tests/e2e/frontend-ui-flow.test.ts
 * @description Suite pengujian verifikasi alur antarmuka frontend Minggu 1.7:
 * 1. Dataset tiruan mandiri (hermetic mock data) untuk multi-outlet, tenant KYB, standing orders, panen
 * 2. Halaman Login multi-role (HoReKa, Gapoktan, Admin)
 * 3. Panel remediasi KYB status REJECTED dan integrasinya di alur onboarding
 * 4. Portal Buyer/HoReKa (layout shell, manajemen multi-outlet DIY, kartu gerai, dialog tambah cabang, dashboard pengadaan)
 * 5. Portal Supplier/Gapoktan (layout shell, meja kerja panen & alokasi sentra hub DIY)
 * 6. Penyempurnaan Meja Kerja Admin KYB (filter tab status antrean, pencarian, dan offline fallback)
 * 7. Perlindungan direktori tests/screenshots/ via .gitignore
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Minggu 1.7 - Penuntasan Lengkap Seluruh Antarmuka Frontend UI/UX (Zero-Backend Blocker)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const webAppDir = path.join(rootDir, 'apps/web/src/app');
  const webLibDir = path.join(rootDir, 'apps/web/src/lib');

  it('memvalidasi keberadaan dataset tiruan mandiri (hermetic mock data) di apps/web/src/lib/mock-data.ts', () => {
    const mockDataPath = path.join(webLibDir, 'mock-data.ts');
    expect(fs.existsSync(mockDataPath)).toBe(true);

    const content = fs.readFileSync(mockDataPath, 'utf-8');
    expect(content).toContain('export const MOCK_OUTLETS');
    expect(content).toContain('export const MOCK_TENANTS_KYB');
    expect(content).toContain('export const MOCK_STANDING_ORDERS');
    expect(content).toContain('export const MOCK_HARVEST_COMMITMENTS');
    expect(content).toContain('Dapur Pusat Malioboro');
    expect(content).toContain('Gapoktan Srikayangan Makmur');
  });

  it('memvalidasi halaman Login multi-role di apps/web/src/app/(auth)/login/page.tsx', () => {
    const loginPath = path.join(webAppDir, '(auth)/login/page.tsx');
    expect(fs.existsSync(loginPath)).toBe(true);

    const content = fs.readFileSync(loginPath, 'utf-8');
    expect(content).toContain('handleSubmit');
    expect(content).toContain('HOREKA');
    expect(content).toContain('GAPOKTAN');
    expect(content).toContain('showForgotModal');
    expect(content).toContain('isLoading');
  });

  it('memvalidasi komponen panel remediasi KYB di (auth)/onboarding-kyb/_components/remediation-panel.tsx', () => {
    const panelPath = path.join(webAppDir, '(auth)/onboarding-kyb/_components/remediation-panel.tsx');
    expect(fs.existsSync(panelPath)).toBe(true);

    const content = fs.readFileSync(panelPath, 'utf-8');
    expect(content).toContain('rejectionReason');
    expect(content).toContain('handleResubmit');
    expect(content).toContain('Berkas Perbaikan Berhasil Dikirimkan');
    expect(content).toContain('PENDING_VERIFICATION');
  });

  it('memvalidasi integrasi panel remediasi dan status simulator di (auth)/onboarding-kyb/page.tsx', () => {
    const onboardingPath = path.join(webAppDir, '(auth)/onboarding-kyb/page.tsx');
    expect(fs.existsSync(onboardingPath)).toBe(true);

    const content = fs.readFileSync(onboardingPath, 'utf-8');
    expect(content).toContain("import { RemediationPanel } from './_components/remediation-panel';");
    expect(content).toContain("kybStatus === 'REJECTED'");
    expect(content).toContain('StatusBadge');
  });

  it('memvalidasi shell portal Buyer/HoReKa di buyer/layout.tsx dan OutletContextSelector', () => {
    const buyerLayoutPath = path.join(webAppDir, 'buyer/layout.tsx');
    const outletSelectorPath = path.join(rootDir, 'apps/web/src/components/dashboard-shell/outlet-context-selector.tsx');
    expect(fs.existsSync(buyerLayoutPath)).toBe(true);
    expect(fs.existsSync(outletSelectorPath)).toBe(true);

    const content = fs.readFileSync(buyerLayoutPath, 'utf-8');
    expect(content).toContain('activeOutletId');
    expect(content).toContain('OutletContextSelector');
    expect(content).toContain('/buyer/dashboard');
    expect(content).toContain('/buyer/outlets');
    expect(content).toContain('Restoran Bale Raos');
  });

  it('memvalidasi komponen manajemen multi-outlet (OutletCard, OutletSkeleton, AddOutletDialog)', () => {
    const skeletonPath = path.join(webAppDir, 'buyer/outlets/_components/outlet-skeleton.tsx');
    const cardPath = path.join(webAppDir, 'buyer/outlets/_components/outlet-card.tsx');
    const dialogPath = path.join(webAppDir, 'buyer/outlets/_components/add-outlet-dialog.tsx');
    const pagePath = path.join(webAppDir, 'buyer/outlets/page.tsx');

    expect(fs.existsSync(skeletonPath)).toBe(true);
    expect(fs.existsSync(cardPath)).toBe(true);
    expect(fs.existsSync(dialogPath)).toBe(true);
    expect(fs.existsSync(pagePath)).toBe(true);

    const cardContent = fs.readFileSync(cardPath, 'utf-8');
    expect(cardContent).toContain('GeoRegencyTag');
    expect(cardContent).toContain('outlet.isMain');

    const dialogContent = fs.readFileSync(dialogPath, 'utf-8');
    expect(dialogContent).toContain('handleRegencyChange');
    expect(dialogContent).toContain('latitude');
    expect(dialogContent).toContain('longitude');

    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    expect(pageContent).toContain('filteredOutlets');
    expect(pageContent).toContain('regencyFilter');
    expect(pageContent).toContain('handleAddOutletSuccess');
  });

  it('memvalidasi dashboard ringkasan pengadaan dapur HoReKa di buyer/dashboard/page.tsx', () => {
    const dashboardPath = path.join(webAppDir, 'buyer/dashboard/page.tsx');
    expect(fs.existsSync(dashboardPath)).toBe(true);

    const content = fs.readFileSync(dashboardPath, 'utf-8');
    expect(content).toContain('MOCK_STANDING_ORDERS');
    expect(content).toContain('Jadwal Pengiriman Bahan Baku Rutin');
    expect(content).toContain('Hemat Pooling Bulan Ini');
    expect(content).toContain('Jadwal Drop Terdekat');
  });

  it('memvalidasi shell portal Gapoktan/Supplier di supplier/layout.tsx dan dashboard/page.tsx', () => {
    const supplierLayoutPath = path.join(webAppDir, 'supplier/layout.tsx');
    const supplierDashboardPath = path.join(webAppDir, 'supplier/dashboard/page.tsx');

    expect(fs.existsSync(supplierLayoutPath)).toBe(true);
    expect(fs.existsSync(supplierDashboardPath)).toBe(true);

    const layoutContent = fs.readFileSync(supplierLayoutPath, 'utf-8');
    expect(layoutContent).toContain('Gapoktan Srikayangan Makmur');
    expect(layoutContent).toContain('Pak Subardi');

    const dashboardContent = fs.readFileSync(supplierDashboardPath, 'utf-8');
    expect(dashboardContent).toContain('MOCK_HARVEST_COMMITMENTS');
    expect(dashboardContent).toContain('Komitmen Jadwal Panen & Alokasi Pasok Sentra Hub');
    expect(dashboardContent).toContain('Dana Escrow Tertampung');
    expect(dashboardContent).toContain('520/SK-DISTAN/KP/2024');
  });

  it('memvalidasi penyempurnaan Meja Kerja Admin KYB di (admin)/tenants/page.tsx', () => {
    const adminPath = path.join(webAppDir, '(admin)/tenants/page.tsx');
    expect(fs.existsSync(adminPath)).toBe(true);

    const content = fs.readFileSync(adminPath, 'utf-8');
    expect(content).toContain('MOCK_TENANTS_KYB');
    expect(content).toContain('mapMockToQueueItem');
    expect(content).toContain('statusFilter');
    expect(content).toContain('PENDING_VERIFICATION');
    expect(content).toContain('VERIFIED');
    expect(content).toContain('REJECTED');
    expect(content).toContain('KybAuditPanel');
  });

  it('memvalidasi atribut aksesibilitas form dan meta tag mobile-web-app-capable', () => {
    const layoutPath = path.join(webAppDir, 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    expect(layoutContent).toContain("'mobile-web-app-capable': 'yes'");

    const outletPagePath = path.join(webAppDir, 'buyer/outlets/page.tsx');
    const outletContent = fs.readFileSync(outletPagePath, 'utf-8');
    expect(outletContent).toContain('id="buyer-outlet-search"');
    expect(outletContent).toContain('name="buyer-outlet-search"');
    expect(outletContent).toContain('htmlFor="buyer-outlet-search"');

    const adminPagePath = path.join(webAppDir, '(admin)/tenants/page.tsx');
    const adminContent = fs.readFileSync(adminPagePath, 'utf-8');
    expect(adminContent).toContain('id="admin-tenant-search"');
    expect(adminContent).toContain('name="admin-tenant-search"');
    expect(adminContent).toContain('htmlFor="admin-tenant-search"');
  });

  it('memvalidasi keberadaan direktori tests/screenshots dan berkas .gitignore pelindungnya', () => {
    const screenshotsDir = path.join(rootDir, 'tests/screenshots');
    const gitignorePath = path.join(screenshotsDir, '.gitignore');

    expect(fs.existsSync(screenshotsDir)).toBe(true);
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignoreContent).toContain('*');
    expect(gitignoreContent).toContain('!.gitignore');
  });
});
