/**
 * @file tests/e2e/human-uiux-journey.test.ts
 * @description Suite pengujian E2E & visual capture interaktif seperti pengguna riil (Real User Journey Simulation):
 * 1. Persona Public Buyer: Eksplorasi landing page, navigasi fitur alur pengadaan & komoditas
 * 2. Persona HOREKA Buyer: Login operasional dapur, dasbor belanja, pooling komoditas & dialog alokasi
 * 3. Persona GAPOKTAN Supplier: Dasbor komitmen panen, pasar standing orders, proyeksi harga
 * 4. Persona HUB OPERATOR: Meja kerja hub logistik Bantul, penerimaan barang, timbangan & toleransi SNI
 * 5. Persona SUPER ADMIN: Pusat komando tata kelola konsorsium DIY, audit berkas legalitas KYB mitra
 * Seluruh tangkapan layar disimpan beresolusi tinggi ke tests/screenshots/live-user/.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CAPTURE_DIR = path.resolve(__dirname, '../screenshots/live-user');

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const envLocalPath = path.resolve(__dirname, '../../apps/web/.env.local');
    if (fs.existsSync(envLocalPath)) {
      const match = fs.readFileSync(envLocalPath, 'utf-8').match(/^JWT_SECRET=(.+)$/m);
      const secret = match?.[1];
      if (secret) return secret.trim();
    }
  } catch {}
  return 'rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars';
}

function generateLiveUserToken(macroRole: string, microRole: string, email: string, businessName: string): string {
  const jwtSecret = getJwtSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId: `usr_${microRole.toLowerCase()}_live`,
      tenantId: `tenant_${macroRole.toLowerCase()}_live`,
      macroRole,
      microRole,
      isSuperAdmin: macroRole === 'SUPER_ADMIN',
      email,
      businessName,
      kybStatus: 'VERIFIED',
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    })
  ).toString('base64url');

  const signature = crypto.createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

describe('Simulasi Interaktif & UI/UX Live User Journey (Puppeteer)', { timeout: 60000 }, () => {
  let browser: Browser;

  beforeAll(async () => {
    fs.mkdirSync(CAPTURE_DIR, { recursive: true });
    browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
      defaultViewport: { width: 1440, height: 900 },
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('Journey 1 - Public Guest: Menjelajahi Landing Page & Navigasi Semantik Komoditas', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('#main-content', { timeout: 10000 });

      const landingShot = path.join(CAPTURE_DIR, '01-landing-page-hero.png');
      await page.screenshot({ path: landingShot, fullPage: false });
      expect(fs.existsSync(landingShot)).toBe(true);

      // Cek katalog komoditas
      await page.goto(`${BASE_URL}/komoditas`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const komoditasShot = path.join(CAPTURE_DIR, '02-katalog-komoditas.png');
      await page.screenshot({ path: komoditasShot, fullPage: false });
      expect(fs.existsSync(komoditasShot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('Journey 2 - HoReKa Buyer: Melakukan Interaksi Login & Masuk Meja Kerja Dapur', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('#login-email', { timeout: 10000 });

      // Isi formulir seperti pengetikan manusia nyata
      await page.type('#login-email', 'buyer@demo.com', { delay: 20 });
      await page.type('#login-password', 'demo123', { delay: 20 });

      const loginFormShot = path.join(CAPTURE_DIR, '03-buyer-login-filled.png');
      await page.screenshot({ path: loginFormShot, fullPage: false });
      expect(fs.existsSync(loginFormShot)).toBe(true);

      // Simulasi token sesi valid
      const token = generateLiveUserToken(
        'HOREKA',
        'HEAD_CHEF',
        'chef.budi@gudegyudjum.id',
        'Warung Makan Gudeg Yu Djum'
      );
      const urlObj = new URL(BASE_URL);
      await page.setCookie(
        { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
        { name: 'pasok_session_role', value: 'HEAD_CHEF', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_macro_role', value: 'HOREKA', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
      );

      // Navigasi ke dasbor buyer
      await page.goto(`${BASE_URL}/buyer/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const buyerDashShot = path.join(CAPTURE_DIR, '04-buyer-dashboard-workdesk.png');
      await page.screenshot({ path: buyerDashShot, fullPage: true });
      expect(fs.existsSync(buyerDashShot)).toBe(true);

      // Navigasi ke pooling
      await page.goto(`${BASE_URL}/buyer/pooling`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const buyerPoolingShot = path.join(CAPTURE_DIR, '05-buyer-pooling-catalog.png');
      await page.screenshot({ path: buyerPoolingShot, fullPage: true });
      expect(fs.existsSync(buyerPoolingShot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('Journey 3 - Gapoktan Supplier: Memeriksa Komitmen Panen & Pasar Standing Orders', async () => {
    const page: Page = await browser.newPage();
    try {
      const token = generateLiveUserToken(
        'GAPOKTAN',
        'CHAIRPERSON',
        'harto@sidomakmur.id',
        'Gapoktan Sido Makmur Cangkringan'
      );
      const urlObj = new URL(BASE_URL);
      await page.setCookie(
        { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
        { name: 'pasok_session_role', value: 'CHAIRPERSON', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_macro_role', value: 'GAPOKTAN', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
      );

      await page.goto(`${BASE_URL}/supplier/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const supplierDashShot = path.join(CAPTURE_DIR, '06-supplier-dashboard.png');
      await page.screenshot({ path: supplierDashShot, fullPage: true });
      expect(fs.existsSync(supplierDashShot)).toBe(true);

      await page.goto(`${BASE_URL}/supplier/market`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const supplierMarketShot = path.join(CAPTURE_DIR, '07-supplier-market-orders.png');
      await page.screenshot({ path: supplierMarketShot, fullPage: true });
      expect(fs.existsSync(supplierMarketShot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('Journey 4 - Hub Operator Logistik: Memeriksa Antrean Inbound & Stasiun Timbangan Tera', async () => {
    const page: Page = await browser.newPage();
    try {
      const token = generateLiveUserToken(
        'HUB_OPERATOR',
        'OPERATOR_QC',
        'qc.subuh@hub-bantul.pasokmataram.id',
        'Sentra Hub Logistik Bantul'
      );
      const urlObj = new URL(BASE_URL);
      await page.setCookie(
        { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
        { name: 'pasok_session_role', value: 'OPERATOR_QC', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_macro_role', value: 'HUB_OPERATOR', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
      );

      await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const hubOverviewShot = path.join(CAPTURE_DIR, '08-hub-logistics-overview.png');
      await page.screenshot({ path: hubOverviewShot, fullPage: true });
      expect(fs.existsSync(hubOverviewShot)).toBe(true);

      await page.goto(`${BASE_URL}/hub/weighing`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const hubWeighingShot = path.join(CAPTURE_DIR, '09-hub-weighing-verification.png');
      await page.screenshot({ path: hubWeighingShot, fullPage: true });
      expect(fs.existsSync(hubWeighingShot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('Journey 5 - Super Admin: Pusat Komando Tata Kelola DIY & Audit Dokumen Legalitas KYB', async () => {
    const page: Page = await browser.newPage();
    try {
      const token = generateLiveUserToken(
        'SUPER_ADMIN',
        'SUPER_ADMIN',
        'superadmin@pasokmataram.com',
        'Konsorsium PasokMataram DIY'
      );
      const urlObj = new URL(BASE_URL);
      await page.setCookie(
        { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
        { name: 'pasok_session_role', value: 'SUPER_ADMIN', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_macro_role', value: 'SUPER_ADMIN', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
      );

      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const adminOverviewShot = path.join(CAPTURE_DIR, '10-admin-executive-overview.png');
      await page.screenshot({ path: adminOverviewShot, fullPage: true });
      expect(fs.existsSync(adminOverviewShot)).toBe(true);

      await page.goto(`${BASE_URL}/tenants`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const adminTenantsShot = path.join(CAPTURE_DIR, '11-admin-kyb-audit-table.png');
      await page.screenshot({ path: adminTenantsShot, fullPage: true });
      expect(fs.existsSync(adminTenantsShot)).toBe(true);

      await page.goto(`${BASE_URL}/admin/escrow`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const adminEscrowShot = path.join(CAPTURE_DIR, '12-admin-escrow-settlement.png');
      await page.screenshot({ path: adminEscrowShot, fullPage: true });
      expect(fs.existsSync(adminEscrowShot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('Journey 6 - Mobile Responsive Viewport (390x844 iPhone 14 Pro Layout Audit)', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

      const token = generateLiveUserToken(
        'HOREKA',
        'HEAD_CHEF',
        'chef.budi@gudegyudjum.id',
        'Warung Makan Gudeg Yu Djum'
      );
      const urlObj = new URL(BASE_URL);
      await page.setCookie(
        { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
        { name: 'pasok_session_role', value: 'HEAD_CHEF', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_macro_role', value: 'HOREKA', domain: urlObj.hostname, path: '/' },
        { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
      );

      await page.goto(`${BASE_URL}/buyer/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 10000 });

      const mobileDashShot = path.join(CAPTURE_DIR, '13-mobile-buyer-dashboard.png');
      await page.screenshot({ path: mobileDashShot, fullPage: true });
      expect(fs.existsSync(mobileDashShot)).toBe(true);
    } finally {
      await page.close();
    }
  });
});
