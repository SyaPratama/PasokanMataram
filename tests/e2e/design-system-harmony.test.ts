/**
 * @file tests/e2e/design-system-harmony.test.ts
 * @description Suite pengujian E2E validasi Penyelarasan Design System Terpadu (Minggu 1.9):
 * 1. Arsitektur token 3-layer di packages/config/src/theme.ts & re-ekspor tunggal apps/web/src/config/theme.ts
 * 2. Variabel CSS semantik & kepatuhan prefers-reduced-motion di apps/web/src/styles/globals.css
 * 3. Eliminasi kelas fiktif & hardcoded inline hex pada login/page.tsx
 * 4. Off-canvas drawer mobile dengan overlay backdrop di buyer/layout.tsx & supplier/layout.tsx
 * 5. Standarisasi grouped sidebar navigation di supplier/layout.tsx
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Minggu 1.9 - Unified Design System & Layout Harmony Verification', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const configThemePath = path.join(rootDir, 'packages/config/src/theme.ts');
  const webThemePath = path.join(rootDir, 'apps/web/src/config/theme.ts');
  const globalsCssPath = path.join(rootDir, 'apps/web/src/styles/globals.css');
  const loginPagePath = path.join(rootDir, 'apps/web/src/app/(auth)/login/page.tsx');
  const buyerLayoutPath = path.join(rootDir, 'apps/web/src/app/buyer/layout.tsx');
  const supplierLayoutPath = path.join(rootDir, 'apps/web/src/app/supplier/layout.tsx');

  it('memvalidasi arsitektur token di packages/config/src/theme.ts', () => {
    expect(fs.existsSync(configThemePath)).toBe(true);
    const content = fs.readFileSync(configThemePath, 'utf-8');

    expect(content).toContain("dark: '#9A5814'");
    expect(content).toContain("dark: '#24422D'");
    expect(content).toContain("pendukung: '#6E8B6E'");
    expect(content).toContain('status:');
    expect(content).toContain("success: '#2E5339'");
    expect(content).toContain("danger: '#B91C1C'");
  });

  it('memvalidasi apps/web/src/config/theme.ts mere-ekspor dari @pasok/config tanpa duplikasi', () => {
    expect(fs.existsSync(webThemePath)).toBe(true);
    const content = fs.readFileSync(webThemePath, 'utf-8');

    expect(content).toContain("from '@pasok/config'");
    expect(content).not.toContain('const themeColors =');
  });

  it('memvalidasi variabel CSS dan query prefers-reduced-motion di globals.css', () => {
    expect(fs.existsSync(globalsCssPath)).toBe(true);
    const content = fs.readFileSync(globalsCssPath, 'utf-8');

    expect(content).toContain('--color-netral-canvas: #F7F4EE;');
    expect(content).toContain('--color-primer: #2E5339;');
    expect(content).toContain('--color-status-success: #2E5339;');
    expect(content).toContain('@media (prefers-reduced-motion: reduce)');
    expect(content).toContain('animation-duration: 0.01ms !important;');
  });

  it('memvalidasi eliminasi hardcoded inline hex di login/page.tsx', () => {
    expect(fs.existsSync(loginPagePath)).toBe(true);
    const content = fs.readFileSync(loginPagePath, 'utf-8');

    expect(content).not.toContain('bg-[#FDFBF7]');
    expect(content).not.toContain('text-[#4A5568]');
    expect(content).toContain('bg-netral-canvas');
  });

  it('memvalidasi off-canvas slide-over drawer dan target sentuh >=44px di DashboardShell dan buyer/layout.tsx', () => {
    expect(fs.existsSync(buyerLayoutPath)).toBe(true);
    const dashboardShellPath = path.join(rootDir, 'apps/web/src/components/dashboard-shell/dashboard-shell.tsx');
    expect(fs.existsSync(dashboardShellPath)).toBe(true);

    const buyerContent = fs.readFileSync(buyerLayoutPath, 'utf-8');
    const shellContent = fs.readFileSync(dashboardShellPath, 'utf-8');

    expect(buyerContent).toContain('DashboardShell');
    expect(shellContent).toContain('fixed inset-0 z-50 md:hidden flex');
    expect(shellContent).toContain('bg-black/50 backdrop-blur-xs');
    expect(shellContent).toContain('min-h-[44px]');
  });

  it('memvalidasi grouped sidebar navigation dan off-canvas drawer di supplier/layout.tsx dan DashboardShell', () => {
    expect(fs.existsSync(supplierLayoutPath)).toBe(true);
    const dashboardShellPath = path.join(rootDir, 'apps/web/src/components/dashboard-shell/dashboard-shell.tsx');
    expect(fs.existsSync(dashboardShellPath)).toBe(true);

    const supplierContent = fs.readFileSync(supplierLayoutPath, 'utf-8');
    const shellContent = fs.readFileSync(dashboardShellPath, 'utf-8');

    expect(supplierContent).toContain("title: 'MENU'");
    expect(supplierContent).toContain("title: 'LOGISTIK PANEN'");
    expect(supplierContent).toContain("title: 'PENGATURAN'");
    expect(supplierContent).toContain('DashboardShell');
    expect(shellContent).toContain('fixed inset-0 z-50 md:hidden flex');
    expect(shellContent).toContain('bg-black/50 backdrop-blur-xs');
    expect(shellContent).toContain('min-h-[44px]');
  });

  it('memvalidasi aturan ruang kerja AGENTS.md dan konstitusi terdefinisi ketat', () => {
    const agentsPath = path.join(rootDir, 'AGENTS.md');
    const constitutionPath = path.join(rootDir, '.specify/memory/constitution.md');

    expect(fs.existsSync(agentsPath)).toBe(true);
    expect(fs.existsSync(constitutionPath)).toBe(true);

    const agentsContent = fs.readFileSync(agentsPath, 'utf-8');
    expect(agentsContent).toContain('Aturan Desain Sistem Ketat');
    expect(agentsContent).toContain('Nol Toleransi Emotikon');
    expect(agentsContent).toContain('DILARANG KERAS');
    expect(agentsContent).toContain('Lucide Icons');

    const constitutionContent = fs.readFileSync(constitutionPath, 'utf-8');
    expect(constitutionContent).toContain('Prinsip XIII');
  });

  it('memvalidasi ketiadaan karakter emotikon dan karakter Unicode dekoratif di seluruh apps/web/src', () => {
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;
    const srcDir = path.join(rootDir, 'apps/web/src');

    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
          const fileContent = fs.readFileSync(fullPath, 'utf-8');
          expect(emojiRegex.test(fileContent)).toBe(false);
        }
      }
    };

    checkDir(srcDir);
  });

  it('memvalidasi story-mission.tsx menggunakan Lucide Check dan tanpa karakter mentah', () => {
    const storyMissionPath = path.join(rootDir, 'apps/web/src/app/_components/story-mission.tsx');
    expect(fs.existsSync(storyMissionPath)).toBe(true);

    const content = fs.readFileSync(storyMissionPath, 'utf-8');
    expect(content).toContain('Check');
    expect(content).toContain('<Check className="w-3.5 h-3.5 text-primer"');
  });
});
