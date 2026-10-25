/**
 * @file tests/e2e/sandbox-live-browser-capture.test.ts
 * @description Puppeteer Live Browser Testing & Visual Screenshot Capture for PasokMataram Sandbox Mode.
 * Verifies live browser interactivity across 4 personas, Solosmartpay payment simulator, and responsive viewports.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

const BASE_URL = process.env.APP_URL || 'http://localhost:3005';
const SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots');

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

describe('Sandbox Mode Live Browser Testing & Visual Capture (Puppeteer)', { timeout: 35000 }, () => {
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
      console.warn(`[E2E SANDBOX INFO] Server web offline di ${BASE_URL}. Pengujian capture diskip.`);
    }

    if (isServerUp && chromePath && fs.existsSync(chromePath)) {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1440,900',
        ],
        defaultViewport: { width: 1440, height: 900 },
      });
    }
  }, 35000);

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

  it('1. menguji landing page dengan aktivasi sandbox mode dan banner floating', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/?sandbox=true`, { waitUntil: 'networkidle0', timeout: 30000 });

      const bannerText = await page.$eval('aside', (el) => el.textContent || '');
      expect(bannerText).toContain('MODE SANDBOX LIVE');
      expect(bannerText).toContain('Persona');
      expect(bannerText).toContain('Simulasi Bayar');

      const screenshotPath = path.join(SCREENSHOTS_DIR, 'sandbox-01-landing-mode.png');
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('2. menguji portal buyer pooling, dialog alokasi kuota, dan penerbitan VA BPD DIY', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/buyer/pooling?sandbox=true&persona=BUYER`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const title = await page.$eval('h1', (el) => el.textContent || '');
      expect(title).toContain('Belanja Bersama Pasokan Dapur');

      const ikutButtons = await page.$$('button');
      let targetButton = null;
      for (const btn of ikutButtons) {
        const text = await page.evaluate((el) => el.textContent || '', btn);
        if (text.includes('Ikut Alokasi Kuota')) {
          targetButton = btn;
          break;
        }
      }
      expect(targetButton).not.toBeNull();
      if (targetButton) {
        await targetButton.click();
        await page.waitForSelector('#pooling-dialog-title', { timeout: 5000 });

        const confirmButtons = await page.$$('button');
        let submitBtn = null;
        for (const btn of confirmButtons) {
          const text = await page.evaluate((el) => el.textContent || '', btn);
          if (text.includes('Konfirmasi Ikut Kuota')) {
            submitBtn = btn;
            break;
          }
        }
        if (submitBtn) {
          await submitBtn.click();
        }

        await page.waitForFunction(
          () => document.body.innerText.includes('Nomor Virtual Account Bank BPD DIY'),
          { timeout: 8000 }
        );

        const pageText = await page.evaluate(() => document.body.innerText);
        expect(pageText).toContain('Nomor Virtual Account Bank BPD DIY');
        expect(pageText).toContain('Simulasikan Bayar via Solosmartpay');

        const screenshotPath = path.join(SCREENSHOTS_DIR, 'sandbox-02-buyer-pooling-allocation.png');
        await page.screenshot({ path: screenshotPath, fullPage: false });
        expect(fs.existsSync(screenshotPath)).toBe(true);
      }
    } finally {
      await page.close();
    }
  });

  it('3. menguji simulator pembayaran Solosmartpay (VA BPD DIY, QRIS EMVCo, dan webhook HMAC)', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/buyer/pooling?sandbox=true&persona=BUYER`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const buttons = await page.$$('button');
      let simBtn = null;
      for (const b of buttons) {
        const text = await page.evaluate((el) => el.textContent || '', b);
        if (text.includes('Simulasi Bayar')) {
          simBtn = b;
          break;
        }
      }
      expect(simBtn).not.toBeNull();
      if (simBtn) {
        await simBtn.click();
        await page.waitForSelector('#solosmartpay-sim-title', { timeout: 5000 });

        const modalText = await page.evaluate(() => document.body.innerText);
        expect(modalText).toContain('Simulator Pembayaran Dual-Rail');
        expect(modalText).toContain('Biaya Layanan Pembeli (0.3%)');
        expect(modalText).toContain('Fee Platform Merchant (0.5%)');

        const vaScreenshot = path.join(SCREENSHOTS_DIR, 'sandbox-03-solosmartpay-modal-bpd-diy.png');
        await page.screenshot({ path: vaScreenshot, fullPage: false });
        expect(fs.existsSync(vaScreenshot)).toBe(true);

        const methodBtns = await page.$$('button');
        let qrisBtn = null;
        for (const b of methodBtns) {
          const t = await page.evaluate((el) => el.textContent || '', b);
          if (t.includes('QRIS Dinamis')) {
            qrisBtn = b;
            break;
          }
        }
        if (qrisBtn) {
          await qrisBtn.click();
          await page.waitForFunction(
            () => document.body.innerText.includes('SOLOSMARTPAY EMVCO'),
            { timeout: 5000 }
          );
          const qrisScreenshot = path.join(SCREENSHOTS_DIR, 'sandbox-04-solosmartpay-modal-qris.png');
          await page.screenshot({ path: qrisScreenshot, fullPage: false });
          expect(fs.existsSync(qrisScreenshot)).toBe(true);
        }

        const payBtns = await page.$$('button');
        let executePayBtn = null;
        for (const b of payBtns) {
          const t = await page.evaluate((el) => el.textContent || '', b);
          if (t.includes('Simulasikan Pembayaran Berhasil')) {
            executePayBtn = b;
            break;
          }
        }
        if (executePayBtn) {
          await executePayBtn.click();
          await page.waitForFunction(
            () => document.body.innerText.includes('STATUS: ESCROW_HELD | ZERO DB MUTATION'),
            { timeout: 8000 }
          );

          const successScreenshot = path.join(
            SCREENSHOTS_DIR,
            'sandbox-05-payment-success-escrow.png'
          );
          await page.screenshot({ path: successScreenshot, fullPage: false });
          expect(fs.existsSync(successScreenshot)).toBe(true);
        }
      }
    } finally {
      await page.close();
    }
  });

  it('4. menguji portal Supplier Gapoktan dalam mode sandbox', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/supplier/dashboard?sandbox=true&persona=SUPPLIER`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const text = await page.evaluate(() => document.body.innerText);
      expect(text).toContain('Supplier Gapoktan');

      const screenshot = path.join(SCREENSHOTS_DIR, 'sandbox-06-supplier-dashboard.png');
      await page.screenshot({ path: screenshot, fullPage: false });
      expect(fs.existsSync(screenshot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('5. menguji portal Logistics Hub Bantul dalam mode sandbox', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/hub/inbound?sandbox=true&persona=HUB`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const text = await page.evaluate(() => document.body.innerText);
      expect(text).toContain('Hub');

      const screenshot = path.join(SCREENSHOTS_DIR, 'sandbox-07-hub-inbound.png');
      await page.screenshot({ path: screenshot, fullPage: false });
      expect(fs.existsSync(screenshot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('6. menguji portal Super Admin dalam mode sandbox', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/admin?sandbox=true&persona=ADMIN`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const text = await page.evaluate(() => document.body.innerText);
      expect(text).toContain('Admin');

      const screenshot = path.join(SCREENSHOTS_DIR, 'sandbox-08-admin-oversight.png');
      await page.screenshot({ path: screenshot, fullPage: false });
      expect(fs.existsSync(screenshot)).toBe(true);
    } finally {
      await page.close();
    }
  });

  it('7. menguji responsivitas mobile (390x844) pada mode sandbox dan simulator pembayaran', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(`${BASE_URL}/buyer/pooling?sandbox=true&persona=BUYER`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const mobileScreenshot1 = path.join(
        SCREENSHOTS_DIR,
        'sandbox-09-mobile-responsive-buyer.png'
      );
      await page.screenshot({ path: mobileScreenshot1, fullPage: false });
      expect(fs.existsSync(mobileScreenshot1)).toBe(true);

      const buttons = await page.$$('button');
      let simBtn = null;
      for (const b of buttons) {
        const text = await page.evaluate((el) => el.textContent || '', b);
        if (text.includes('Simulasi Bayar')) {
          simBtn = b;
          break;
        }
      }
      if (simBtn) {
        await simBtn.click();
        await page.waitForSelector('#solosmartpay-sim-title', { timeout: 5000 });

        const mobileScreenshot2 = path.join(
          SCREENSHOTS_DIR,
          'sandbox-10-mobile-responsive-payment.png'
        );
        await page.screenshot({ path: mobileScreenshot2, fullPage: false });
        expect(fs.existsSync(mobileScreenshot2)).toBe(true);
      }
    } finally {
      await page.close();
    }
  });

  it('8. menguji mobile bottom navigation bar (Image #2) dan pemicu drawer Lainnya', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
      await page.goto(`${BASE_URL}/buyer/dashboard?sandbox=true&persona=BUYER`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const bottomNav = await page.$('nav[aria-label="Navigasi Bawah Mobile"]');
      expect(bottomNav).not.toBeNull();

      const burgerButton = await page.$('button[aria-label="Buka Menu Navigasi"]');
      expect(burgerButton).toBeNull();

      const mobileNavScreenshot = path.join(
        SCREENSHOTS_DIR,
        'sandbox-11-mobile-bottom-navigation.png'
      );
      await page.screenshot({ path: mobileNavScreenshot, fullPage: false });
      expect(fs.existsSync(mobileNavScreenshot)).toBe(true);

      const moreButton = await page.$('button[aria-label="Buka Menu Lainnya"]');
      expect(moreButton).not.toBeNull();
      if (moreButton) {
        await page.evaluate((el) => (el as HTMLButtonElement).click(), moreButton);
        await page.waitForSelector('div[aria-label="Menu Navigasi Mobile"]', { timeout: 5000 });

        const drawerScreenshot = path.join(
          SCREENSHOTS_DIR,
          'sandbox-12-mobile-drawer-opened.png'
        );
        await page.screenshot({ path: drawerScreenshot, fullPage: false });
        expect(fs.existsSync(drawerScreenshot)).toBe(true);
      }
    } finally {
      await page.close();
    }
  });

  it('9. menguji halaman verifikasi legalitas mandiri di dalam dashboard /buyer/legalitas', async () => {
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/buyer/legalitas?sandbox=true&persona=BUYER`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const heading = await page.$eval('h1', (el) => el.textContent || '');
      expect(heading).toContain('Verifikasi Kepatuhan Usaha (KYB)');

      const legalitasScreenshot = path.join(
        SCREENSHOTS_DIR,
        'sandbox-13-dashboard-legalitas-horeka.png'
      );
      await page.screenshot({ path: legalitasScreenshot, fullPage: false });
      expect(fs.existsSync(legalitasScreenshot)).toBe(true);
    } finally {
      await page.close();
    }
  });
});
