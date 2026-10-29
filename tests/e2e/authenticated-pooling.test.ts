/**
 * @file tests/e2e/authenticated-pooling.test.ts
 * Puppeteer browser test untuk authenticated user flow + pooling page.
 * Ponytail: minimal test yang verify critical path.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';

const isCI = process.env.CI === 'true';

describe.skipIf(isCI)('Authenticated User - Pooling Flow', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Login dengan demo credentials', async () => {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
    
    await page.type('input[type="email"]', 'buyer@demo.com');
    await page.type('input[type="password"]', 'demo123');
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    const url = page.url();
    expect(url).not.toContain('/login');
    console.log('✅ Login successful, redirected to:', url);
  }, 30000);

  test('Navigate ke pooling page', async () => {
    await page.goto(`${baseUrl}/buyer/pooling`, { waitUntil: 'networkidle2' });
    
    const content = await page.content();
    expect(content).toContain('Belanja Bersama');
    
    const campaigns = await page.$$('[data-testid="pooling-campaign"]');
    console.log(`✅ Pooling page loaded, found ${campaigns.length} campaigns`);
    expect(campaigns.length).toBeGreaterThan(0);
  }, 30000);

  test('Pooling campaign card visible', async () => {
    await page.goto(`${baseUrl}/buyer/pooling`, { waitUntil: 'networkidle2' });
    
    const cabaiCampaign = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Cabai Merah');
    });
    
    expect(cabaiCampaign).toBe(true);
    console.log('✅ Campaign "Cabai Merah" visible on page');
  }, 30000);

  test('Verify no blank white screen', async () => {
    await page.goto(`${baseUrl}/buyer/pooling`, { waitUntil: 'networkidle2' });
    
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeGreaterThan(500);
    
    const hasContent = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return body.trim().length > 100;
    });
    
    expect(hasContent).toBe(true);
    console.log('✅ Page has content, not blank');
  }, 30000);
});
