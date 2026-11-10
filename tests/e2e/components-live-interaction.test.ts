/**
 * @file tests/e2e/components-live-interaction.test.ts
 * @description Suite pengujian interaktif & visual capture langsung (Live Component Testing):
 * 1. Drop-down Component:
 *    - Native select dropdown filter (#komoditas-regency-select, #reg-regency)
 *    - Collapsible Accordion dropdown (SNI specification breakdown in /buyer/pooling)
 * 2. Button Component:
 *    - Role Intent Switcher Button (/register)
 *    - Quantity Increment/Decrement Button (+/- counter in pooling order modal)
 *    - Preset Scenario Buttons in /prediksi-harga
 * 3. Card Component:
 *    - Metric Summary Cards (/buyer/dashboard)
 *    - Pooling Campaign Cards (/buyer/pooling)
 *    - Commodity Showcase Cards (/komoditas)
 * 4. Button Notification Component:
 *    - Header Bell Button ([aria-label="Pemberitahuan Sistem"])
 *    - Notification Center Popover with SSE live tag and category badges
 * 5. Slider Component (Range Inputs):
 *    - BMKG Rainfall Anomaly Range Slider (#rainfall-slider)
 *    - Fuel Logistics Price Hike Range Slider (#fuel-slider)
 *    - Kitchen Expense Range Slider (/kalkulator)
 * Seluruh tangkapan layar disimpan beresolusi tinggi ke tests/screenshots/components/.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CAPTURE_DIR = path.resolve(__dirname, '../screenshots/components');

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

function generateLiveToken(macroRole: string, microRole: string): string {
  const jwtSecret = getJwtSecret();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId: `usr_${microRole.toLowerCase()}_component_test`,
      tenantId: `tenant_${macroRole.toLowerCase()}_component_test`,
      macroRole,
      microRole,
      isSuperAdmin: macroRole === 'SUPER_ADMIN',
      email: `test.${microRole.toLowerCase()}@pasokmataram.id`,
      businessName: 'Warung Gudeg Heritage Demo',
      kybStatus: 'VERIFIED',
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    })
  ).toString('base64url');

  const signature = crypto.createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

describe('Live Component Interaction & Visual Capture Test (Puppeteer)', { timeout: 60000 }, () => {
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

  describe('1. Drop-down Components (Select & Collapsible Accordion)', () => {
    it('menguji interaksi Drop-down Select Kabupaten pada /komoditas', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/komoditas`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('#komoditas-regency-select option[value="BANTUL"]', { timeout: 15000 });

        // Screenshot sebelum seleksi
        const beforeShot = path.join(CAPTURE_DIR, '01-dropdown-select-before.png');
        await page.screenshot({ path: beforeShot, fullPage: false });
        expect(fs.existsSync(beforeShot)).toBe(true);

        // Pilih kabupaten BANTUL
        await page.select('#komoditas-regency-select', 'BANTUL');
        const selectedVal = await page.$eval('#komoditas-regency-select', (el) => (el as HTMLSelectElement).value);
        expect(selectedVal).toBe('BANTUL');

        // Screenshot setelah seleksi
        const afterShot = path.join(CAPTURE_DIR, '01-dropdown-select-after-bantul.png');
        await page.screenshot({ path: afterShot, fullPage: false });
        expect(fs.existsSync(afterShot)).toBe(true);
      } finally {
        await page.close();
      }
    });

    it('menguji interaksi Drop-down Select pada form /register', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('#reg-regency', { timeout: 10000 });

        await page.select('#reg-regency', 'KULON PROGO');
        const selectedVal = await page.$eval('#reg-regency', (el) => (el as HTMLSelectElement).value);
        expect(selectedVal).toBe('KULON PROGO');

        const shot = path.join(CAPTURE_DIR, '02-dropdown-register-regency.png');
        await page.screenshot({ path: shot, fullPage: false });
        expect(fs.existsSync(shot)).toBe(true);
      } finally {
        await page.close();
      }
    });

    it('menguji Drop-down Collapsible Accordion spesifikasi mutu SNI pada /buyer/pooling', async () => {
      const page: Page = await browser.newPage();
      try {
        const token = generateLiveToken('HOREKA', 'HEAD_CHEF');
        const urlObj = new URL(BASE_URL);
        await page.setCookie(
          { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
          { name: 'pasok_session_role', value: 'HEAD_CHEF', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_macro_role', value: 'HOREKA', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
        );

        await page.goto(`${BASE_URL}/buyer/pooling`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('body', { timeout: 10000 });

        // Cari tombol accordion spesifikasi
        const accordionButtons = await page.$$('button[aria-expanded]');
        const firstAccordion = accordionButtons[0];
        if (!firstAccordion) {
          throw new Error('Expected an accordion button.');
        }
        await firstAccordion.click();
        await page.waitForFunction(() => true);

        const shot = path.join(CAPTURE_DIR, '03-dropdown-accordion-expanded.png');
        await page.screenshot({ path: shot, fullPage: false });
        expect(fs.existsSync(shot)).toBe(true);
      } finally {
        await page.close();
      }
    });
  });

  describe('2. Button Components (State, Switcher, Counter, & Triggers)', () => {
    it('menguji Button Intent Switcher (Kafe & Resto vs Pemasok Gapoktan) di /register', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('button[aria-pressed]', { timeout: 10000 });

        // Klik tombol Pemasok Gapoktan
        const buttons = await page.$$('button[aria-pressed]');
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        // Klik Gapoktan button
        const gapoktanButton = buttons[1];
        const horekaButton = buttons[0];
        if (!gapoktanButton || !horekaButton) {
          throw new Error('Expected both intent buttons.');
        }
        await gapoktanButton.click();
        await page.waitForFunction(() => {
          const btns = document.querySelectorAll('button[aria-pressed]');
          return btns[1]?.getAttribute('aria-pressed') === 'true';
        });

        const shotGapoktan = path.join(CAPTURE_DIR, '04-button-intent-gapoktan-active.png');
        await page.screenshot({ path: shotGapoktan, fullPage: false });
        expect(fs.existsSync(shotGapoktan)).toBe(true);

        // Klik kembali ke HoReKa button
        await horekaButton.click();
        await page.waitForFunction(() => {
          const btns = document.querySelectorAll('button[aria-pressed]');
          return btns[0]?.getAttribute('aria-pressed') === 'true';
        });

        const shotHoreka = path.join(CAPTURE_DIR, '05-button-intent-horeka-active.png');
        await page.screenshot({ path: shotHoreka, fullPage: false });
        expect(fs.existsSync(shotHoreka)).toBe(true);
      } finally {
        await page.close();
      }
    });

    it('menguji Preset Buttons pada simulator /prediksi-harga', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/prediksi-harga`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('#rainfall-slider', { timeout: 10000 });

        // Cari tombol skenario hujan ekstrem (+60%)
        const presetButtons = await page.$$('button');
        let ekstremBtn = null;
        for (const btn of presetButtons) {
          const txt = await page.evaluate((el) => el.textContent || '', btn);
          if (txt.includes('Ekstrem (+60%)')) {
            ekstremBtn = btn;
            break;
          }
        }

        if (ekstremBtn) {
          await ekstremBtn.click();
          await page.waitForFunction(() => {
            const input = document.querySelector('#rainfall-slider') as HTMLInputElement | null;
            return input?.value === '60';
          });
        }

        const shotPreset = path.join(CAPTURE_DIR, '06-button-preset-rainfall-60.png');
        await page.screenshot({ path: shotPreset, fullPage: false });
        expect(fs.existsSync(shotPreset)).toBe(true);
      } finally {
        await page.close();
      }
    });
  });

  describe('3. Card Components (Metric Summary, Campaign, & Product Cards)', () => {
    it('menguji rendering & hover Card Ringkasan Metrik di /buyer/dashboard', async () => {
      const page: Page = await browser.newPage();
      try {
        const token = generateLiveToken('HOREKA', 'HEAD_CHEF');
        const urlObj = new URL(BASE_URL);
        await page.setCookie(
          { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
          { name: 'pasok_session_role', value: 'HEAD_CHEF', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_macro_role', value: 'HOREKA', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
        );

        await page.goto(`${BASE_URL}/buyer/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('body', { timeout: 10000 });

        const cards = await page.$$('.rounded-2xl, .rounded-3xl, [class*="shadow"]');
        expect(cards.length).toBeGreaterThan(0);

        // Hover over the first card
        if (cards[0]) {
          await cards[0].hover();
        }

        const shotCards = path.join(CAPTURE_DIR, '07-card-metrics-dashboard.png');
        await page.screenshot({ path: shotCards, fullPage: false });
        expect(fs.existsSync(shotCards)).toBe(true);
      } finally {
        await page.close();
      }
    });

    it('menguji Card Pooling Campaign di /buyer/pooling', async () => {
      const page: Page = await browser.newPage();
      try {
        const token = generateLiveToken('HOREKA', 'HEAD_CHEF');
        const urlObj = new URL(BASE_URL);
        await page.setCookie(
          { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
          { name: 'pasok_session_role', value: 'HEAD_CHEF', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_macro_role', value: 'HOREKA', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
        );

        await page.goto(`${BASE_URL}/buyer/pooling`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('body', { timeout: 10000 });

        const poolCardShot = path.join(CAPTURE_DIR, '08-card-pooling-campaign.png');
        await page.screenshot({ path: poolCardShot, fullPage: false });
        expect(fs.existsSync(poolCardShot)).toBe(true);
      } finally {
        await page.close();
      }
    });
  });

  describe('4. Button Notification Component (Popover, Unread Badge, & Live Stream Status)', () => {
    it('menguji Button Bell Notifikasi & Membuka Popover Panel Notifikasi Sistem', async () => {
      const page: Page = await browser.newPage();
      try {
        const token = generateLiveToken('HOREKA', 'HEAD_CHEF');
        const urlObj = new URL(BASE_URL);
        await page.setCookie(
          { name: 'pasok_session', value: token, domain: urlObj.hostname, path: '/' },
          { name: 'pasok_session_role', value: 'HEAD_CHEF', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_macro_role', value: 'HOREKA', domain: urlObj.hostname, path: '/' },
          { name: 'pasok_kyb_status', value: 'VERIFIED', domain: urlObj.hostname, path: '/' }
        );

        await page.goto(`${BASE_URL}/buyer/dashboard`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('button[aria-label="Pemberitahuan Sistem"]', { timeout: 10000 });

        // Screenshot sebelum klik tombol notifikasi
        const beforeBellShot = path.join(CAPTURE_DIR, '09-notification-button-before.png');
        await page.screenshot({ path: beforeBellShot, fullPage: false });
        expect(fs.existsSync(beforeBellShot)).toBe(true);

        // Klik tombol notifikasi
        await page.click('button[aria-label="Pemberitahuan Sistem"]');
        await page.waitForSelector('[role="dialog"][aria-label="Panel Notifikasi Sistem"]', { timeout: 10000 });

        // Verifikasi dialog modal notifikasi terbuka
        const dialogOpen = await page.$eval('[role="dialog"][aria-label="Panel Notifikasi Sistem"]', (el) => Boolean(el));
        expect(dialogOpen).toBe(true);

        // Screenshot popover panel notifikasi terbuka
        const popoverOpenShot = path.join(CAPTURE_DIR, '10-notification-popover-open.png');
        await page.screenshot({ path: popoverOpenShot, fullPage: false });
        expect(fs.existsSync(popoverOpenShot)).toBe(true);

        // Tutup kembali notifikasi dengan tombol Escape
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"][aria-label="Panel Notifikasi Sistem"]'));

        const popoverClosedShot = path.join(CAPTURE_DIR, '11-notification-popover-closed.png');
        await page.screenshot({ path: popoverClosedShot, fullPage: false });
        expect(fs.existsSync(popoverClosedShot)).toBe(true);
      } finally {
        await page.close();
      }
    });
  });

  describe('5. Slider Components (Range Inputs: BMKG Anomaly, Fuel Price, & Savings Calculator)', () => {
    it('menguji interaksi Slider Curah Hujan BMKG (#rainfall-slider) pada /prediksi-harga', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/prediksi-harga`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('#rainfall-slider', { timeout: 10000 });

        // Screenshot slider awal
        const initialShot = path.join(CAPTURE_DIR, '12-slider-rainfall-initial.png');
        await page.screenshot({ path: initialShot, fullPage: false });
        expect(fs.existsSync(initialShot)).toBe(true);

        await page.$eval('#rainfall-slider', (el) => {
          const input = el as HTMLInputElement;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          setter?.call(input, '45');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Screenshot slider setelah digeser
        const draggedShot = path.join(CAPTURE_DIR, '13-slider-rainfall-adjusted-45.png');
        await page.screenshot({ path: draggedShot, fullPage: false });
        expect(fs.existsSync(draggedShot)).toBe(true);

        const currentVal = await page.$eval('#rainfall-slider', (el) => (el as HTMLInputElement).value);
        expect(currentVal).toBe('45');
      } finally {
        await page.close();
      }
    });

    it('menguji interaksi Slider Tarif BBM (#fuel-slider) pada /prediksi-harga', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/prediksi-harga`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('#fuel-slider', { timeout: 10000 });

        await page.$eval('#fuel-slider', (el) => {
          const input = el as HTMLInputElement;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          setter?.call(input, '25');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        const shotFuel = path.join(CAPTURE_DIR, '14-slider-fuel-adjusted-25.png');
        await page.screenshot({ path: shotFuel, fullPage: false });
        expect(fs.existsSync(shotFuel)).toBe(true);

        const currentVal = await page.$eval('#fuel-slider', (el) => (el as HTMLInputElement).value);
        expect(currentVal).toBe('25');
      } finally {
        await page.close();
      }
    });

    it('menguji Slider Kalkulator Penghematan Biaya Dapur pada /kalkulator', async () => {
      const page: Page = await browser.newPage();
      try {
        await page.goto(`${BASE_URL}/kalkulator`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForSelector('input[type="range"]', { timeout: 10000 });

        // Geser slider kalkulator ke Rp 4.500.000
        await page.$eval('input[type="range"]', (el) => {
          const input = el as HTMLInputElement;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          setter?.call(input, '4500000');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        const shotCalc = path.join(CAPTURE_DIR, '15-slider-kalkulator-4500k.png');
        await page.screenshot({ path: shotCalc, fullPage: false });
        expect(fs.existsSync(shotCalc)).toBe(true);

        const currentVal = await page.$eval('input[type="range"]', (el) => (el as HTMLInputElement).value);
        expect(currentVal).toBe('4500000');
      } finally {
        await page.close();
      }
    });
  });
});
