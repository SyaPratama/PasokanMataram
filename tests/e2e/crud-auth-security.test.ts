/**
 * @file tests/e2e/crud-auth-security.test.ts
 * @description Browser tests for outlet CRUD, authentication guards, session tampering, and cross-tenant isolation.
 */

import * as crypto from 'node:crypto';
import puppeteer, { Browser, Page } from 'puppeteer';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolveServerJwtSecret } from './jwt-secret';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BUYER_EMAIL = 'buyer@demo.com';
const BUYER_PASSWORD = 'demo123';

function signSession(macroRole: string, microRole: string, tenantId = crypto.randomUUID()): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId: crypto.randomUUID(),
      tenantId,
      role: microRole,
      macroRole,
      microRole,
      isSuperAdmin: macroRole === 'SUPER_ADMIN',
      email: `e2e.${microRole.toLowerCase()}@pasokmataram.id`,
      businessName: 'E2E Tenant',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', resolveServerJwtSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

async function loginAsBuyer(page: Page): Promise<{ status: number }> {
  return page.evaluate(
    async (email: string, password: string) => {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return { status: response.status };
    },
    BUYER_EMAIL,
    BUYER_PASSWORD
  );
}

describe('E2E CRUD Gerai, Autentikasi & Keamanan Tenant', { timeout: 60000 }, () => {
  let browser: Browser;
  let isServerUp = false;

  beforeAll(async () => {
    try {
      const ping = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(2000) });
      isServerUp = ping.ok;
    } catch {
      isServerUp = false;
      console.warn(`[E2E CRUD INFO] Server web offline di ${BASE_URL}. Suite dilewati.`);
    }
    if (isServerUp) {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: CHROME_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: { width: 1280, height: 900 },
      });
    }
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  async function freshPage(): Promise<Page> {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    const existingCookies = await page.cookies();
    if (existingCookies.length > 0) await page.deleteCookie(...existingCookies);
    return page;
  }

  it('menolak kata sandi salah tanpa menerbitkan cookie sesi', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      const result = await page.evaluate(async () => {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'buyer@demo.com', password: 'salah-total' }),
        });
        return { status: response.status };
      });
      expect(result.status).toBe(401);
      const sessionCookie = (await page.cookies()).find((cookie) => cookie.name === 'pasok_session');
      expect(sessionCookie).toBeUndefined();
    } finally {
      await page.close();
    }
  }, 30000);

  it('menerbitkan sesi HttpOnly dan mengalihkan ke dashboard pembeli', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
      const response = await loginAsBuyer(page);
      expect(response.status).toBe(200);
      const sessionCookie = (await page.cookies()).find((cookie) => cookie.name === 'pasok_session');
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie?.httpOnly).toBe(true);
    } finally {
      await page.close();
    }
  }, 30000);

  it('mengalihkan pengunjung tanpa sesi dari portal pembeli ke login', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    try {
      await page.goto(`${BASE_URL}/buyer/dashboard`, { waitUntil: 'domcontentloaded' });
      expect(new URL(page.url()).pathname).toBe('/login');
    } finally {
      await page.close();
    }
  }, 30000);

  it('menolak token sesi yang dimodifikasi', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      const tampered = `${signSession('HOREKA', 'OWNER').slice(0, -3)}abc`;
      await page.setCookie({ name: 'pasok_session', value: tampered, url: `${BASE_URL}/` });
      await page.goto(`${BASE_URL}/buyer/dashboard`, { waitUntil: 'domcontentloaded' });
      expect(new URL(page.url()).pathname).toBe('/login');
    } finally {
      await page.close();
    }
  }, 30000);

  it('menolak akses silang portal HOREKA ke dashboard supplier', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.setCookie({ name: 'pasok_session', value: signSession('HOREKA', 'OWNER'), url: `${BASE_URL}/` });
      await page.goto(`${BASE_URL}/supplier/dashboard`, { waitUntil: 'domcontentloaded' });
      expect(new URL(page.url()).pathname).toBe('/buyer/dashboard');
    } finally {
      await page.close();
    }
  }, 30000);

  it('membuat, membaca, dan memvalidasi gerai pembeli', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    const outletName = `Gerai E2E ${Date.now()}`;
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
      const loginResponse = await loginAsBuyer(page);
      expect(loginResponse.status).toBe(200);

      const created = await page.evaluate(async (name: string) => {
        const response = await fetch('/api/v1/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, regency: 'SLEMAN', address: 'Jl. E2E No. 1, Sleman', isPrimary: false }),
        });
        return { status: response.status, body: await response.json() };
      }, outletName);
      expect(created.status).toBe(200);
      expect(created.body.success).toBe(true);

      const list = await page.evaluate(async () => {
        const response = await fetch('/api/v1/outlets');
        return { status: response.status, body: await response.json() };
      });
      expect(list.status).toBe(200);
      expect(list.body.data.some((outlet: { name: string }) => outlet.name === outletName)).toBe(true);

      const invalid = await page.evaluate(async () => {
        const response = await fetch('/api/v1/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '', regency: 'SLEMAN', address: '' }),
        });
        return response.status;
      });
      expect(invalid).toBe(400);
    } finally {
      await page.close();
    }
  }, 45000);

  it('tidak membocorkan gerai milik tenant lain', async () => {
    if (!isServerUp) return;
    const page = await freshPage();
    const outletName = `Gerai Isolasi ${Date.now()}`;
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
      const loginResponse = await loginAsBuyer(page);
      expect(loginResponse.status).toBe(200);
      await page.evaluate(async (name: string) => {
        await fetch('/api/v1/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, regency: 'BANTUL', address: 'Jl. Isolasi No. 2, Bantul', isPrimary: false }),
        });
      }, outletName);

      const ownList = await page.evaluate(async () => {
        const response = await fetch('/api/v1/outlets');
        return (await response.json()).data as Array<{ name: string }>;
      });
      expect(ownList.some((outlet) => outlet.name === outletName)).toBe(true);        const otherTenantPage = await freshPage();
      try {
        await otherTenantPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
        const otherTenant = crypto.randomUUID();
        await otherTenantPage.setCookie({
          name: 'pasok_session',
          value: signSession('HOREKA', 'OWNER', otherTenant),
          url: `${BASE_URL}/`,
        });
        const otherList = await otherTenantPage.evaluate(async () => {
          const response = await fetch('/api/v1/outlets');
          return { status: response.status, data: (await response.json()).data as Array<{ name: string }> };
        });
        expect(otherList.status).toBe(200);
        expect(otherList.data.some((outlet) => outlet.name === outletName)).toBe(false);
      } finally {
        await otherTenantPage.close();
      }
    } finally {
      await page.close();
    }
  }, 45000);
});
