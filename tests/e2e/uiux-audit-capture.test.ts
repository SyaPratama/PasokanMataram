/**
 * @file tests/e2e/uiux-audit-capture.test.ts
 * @description Pengujian visual E2E untuk menangkap screenshot desktop (1280x800) dan mobile (390x844)
 * pada seluruh rute utama PasokMataram:
 * - / (Landing)
 * - /login, /register
 * - /buyer/legalitas
 * - /buyer/dashboard, /buyer/pooling, /buyer/orders
 * - /supplier/dashboard, /supplier/market
 * - /hub, /hub/weighing
 * - /admin, /admin/escrow
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots');

/**
 * Menemukan executable Chromium dari environment atau cache Puppeteer lokal.
 */
function findChromeExecutable(): string {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const userHome = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\inira';
  const puppeteerCache = path.join(userHome, '.cache', 'puppeteer', 'chrome');
  if (fs.existsSync(puppeteerCache)) {
    const entries = fs.readdirSync(puppeteerCache);
    for (const entry of entries) {
      const candidate = path.join(puppeteerCache, entry, 'chrome-win64', 'chrome.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return '';
}

/**
 * Menghasilkan token sesi hermetis untuk otentikasi peran dashboard.
 */
function generateMockSessionToken(macroRole: string, microRole: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId: `usr_audit_${microRole.toLowerCase()}`,
      tenantId: `tenant_audit_${macroRole.toLowerCase()}`,
      macroRole,
      microRole,
      isSuperAdmin: macroRole === 'SUPER_ADMIN',
      email: `audit.${microRole.toLowerCase()}@pasokmataram.id`,
      businessName:
        macroRole === 'HOREKA'
          ? 'Kopi Klotok Heritage'
          : macroRole === 'GAPOKTAN'
            ? 'Gapoktan Srikayangan'
            : macroRole === 'HUB_OPERATOR'
              ? 'Hub Transit Bantul'
              : 'Konsorsium PasokMataram',
      kybStatus: 'VERIFIED',
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    })
  ).toString('base64url');
  return `${header}.${payload}.mock_sig_audit_${Date.now()}`;
}

interface AuditRoute {
  name: string;
  route: string;
  macroRole?: string;
  microRole?: string;
}

const AUDIT_ROUTES: AuditRoute[] = [
  { name: 'landing', route: '/' },
  { name: 'login', route: '/login' },
  { name: 'register', route: '/register' },
  { name: 'buyer-legalitas', route: '/buyer/legalitas', macroRole: 'HOREKA', microRole: 'HEAD_CHEF' },
  { name: 'buyer-dashboard', route: '/buyer/dashboard', macroRole: 'HOREKA', microRole: 'HEAD_CHEF' },
  { name: 'buyer-pooling', route: '/buyer/pooling', macroRole: 'HOREKA', microRole: 'HEAD_CHEF' },
  { name: 'buyer-orders', route: '/buyer/orders', macroRole: 'HOREKA', microRole: 'HEAD_CHEF' },
  { name: 'supplier-dashboard', route: '/supplier/dashboard', macroRole: 'GAPOKTAN', microRole: 'CHAIRPERSON' },
  { name: 'supplier-market', route: '/supplier/market', macroRole: 'GAPOKTAN', microRole: 'CHAIRPERSON' },
  { name: 'hub-dashboard', route: '/hub', macroRole: 'HUB_OPERATOR', microRole: 'OPERATOR_QC' },
  { name: 'hub-weighing', route: '/hub/weighing', macroRole: 'HUB_OPERATOR', microRole: 'OPERATOR_QC' },
  { name: 'admin-dashboard', route: '/admin', macroRole: 'SUPER_ADMIN', microRole: 'SUPER_ADMIN' },
  { name: 'admin-escrow', route: '/admin/escrow', macroRole: 'SUPER_ADMIN', microRole: 'SUPER_ADMIN' },
];

describe('UI/UX Visual Capture & Quality Audit', () => {
  let browser: Browser;
  let chromePath: string;
  let isServerUp = false;

  beforeAll(async () => {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    chromePath = findChromeExecutable();

    try {
      const ping = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(2000) });
      isServerUp = ping.ok;
    } catch {
      isServerUp = false;
    }

    if (isServerUp && chromePath && fs.existsSync(chromePath)) {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    }
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach((ctx) => {
    if (!isServerUp || !browser) {
      ctx.skip();
    }
  });

  /**
   * Helper penangkapan tampilan halaman per viewport.
   */
  async function capturePage(
    page: Page,
    routeInfo: AuditRoute,
    viewport: { width: number; height: number; suffix: string }
  ): Promise<number> {
    await page.setViewport({ width: viewport.width, height: viewport.height });

    if (routeInfo.macroRole && routeInfo.microRole) {
      const token = generateMockSessionToken(routeInfo.macroRole, routeInfo.microRole);
      const urlObj = new URL(BASE_URL);
      const domain = urlObj.hostname;
      await page.setCookie(
        { name: 'pasok_session', value: token, domain, path: '/' },
        { name: 'pasok_session_role', value: routeInfo.microRole, domain, path: '/' },
        { name: 'pasok_macro_role', value: routeInfo.macroRole, domain, path: '/' },
        { name: 'pasok_kyb_status', value: 'VERIFIED', domain, path: '/' }
      );
    }

    const targetUrl = `${BASE_URL}${routeInfo.route}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const filename = `audit-${viewport.suffix}-${routeInfo.name}.png`;
    const outputPath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: outputPath, fullPage: true });

    expect(fs.existsSync(outputPath)).toBe(true);
    const stat = fs.statSync(outputPath);
    expect(stat.size).toBeGreaterThan(1024);
    return stat.size;
  }

  for (const routeInfo of AUDIT_ROUTES) {
    it(`menangkap tampilan desktop 1280x800 untuk ${routeInfo.route}`, async () => {
      const page = await browser.newPage();
      try {
        const size = await capturePage(page, routeInfo, { width: 1280, height: 800, suffix: 'desktop' });
        expect(size).toBeGreaterThan(1024);
      } finally {
        if (!page.isClosed()) {
          await page.close();
        }
      }
    }, 45000);

    it(`menangkap tampilan mobile 390x844 untuk ${routeInfo.route}`, async () => {
      const page = await browser.newPage();
      try {
        const size = await capturePage(page, routeInfo, { width: 390, height: 844, suffix: 'mobile' });
        expect(size).toBeGreaterThan(1024);
      } finally {
        if (!page.isClosed()) {
          await page.close();
        }
      }
    }, 45000);
  }
});
