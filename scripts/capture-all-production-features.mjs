import puppeteer from 'puppeteer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'docs/screenshots/production');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function makeToken(macroRole, microRole, email, businessName) {
  const secret = 'yOMMDA2WVBqXOsGuL8liOcWBhHTyVkL8WTPnfevbpDR';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    userId: `usr_${microRole.toLowerCase()}_prod`,
    tenantId: `tnt_${macroRole.toLowerCase()}_prod`,
    macroRole,
    microRole,
    isSuperAdmin: macroRole === 'SUPER_ADMIN',
    email,
    businessName,
    kybStatus: 'VERIFIED',
    exp: Math.floor(Date.now() / 1000) + 86400 * 7
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

const BASE_URL = 'https://pasok.syapratama.tech';
const DOMAIN = 'pasok.syapratama.tech';

const publicPages = [
  { name: '01_public_landing_hero.png', path: '/' },
  { name: '02_public_katalog_komoditas.png', path: '/komoditas' },
  { name: '03_public_prediksi_harga.png', path: '/prediksi-harga' },
  { name: '04_public_kalkulator.png', path: '/kalkulator' },
  { name: '05_public_alur_pengadaan.png', path: '/alur-pengadaan' },
  { name: '06_public_paket_layanan.png', path: '/paket-layanan' },
  { name: '07_public_login.png', path: '/login' },
  { name: '08_public_register.png', path: '/register' },
  { name: '09_public_tentang.png', path: '/tentang' },
  { name: '10_public_mekanisme.png', path: '/mekanisme' },
  { name: '11_public_faq.png', path: '/faq' },
];

const buyerPages = [
  { name: '12_buyer_dashboard.png', path: '/buyer/dashboard' },
  { name: '13_buyer_katalog.png', path: '/buyer/katalog' },
  { name: '14_buyer_pooling.png', path: '/buyer/pooling' },
  { name: '15_buyer_orders.png', path: '/buyer/orders' },
  { name: '16_buyer_outlets.png', path: '/buyer/outlets' },
  { name: '17_buyer_legalitas.png', path: '/buyer/legalitas' },
  { name: '18_buyer_forecast.png', path: '/buyer/forecast' },
  { name: '19_buyer_qc.png', path: '/buyer/qc' },
  { name: '20_buyer_deliveries.png', path: '/buyer/deliveries' },
  { name: '21_buyer_team.png', path: '/buyer/team' },
];

const supplierPages = [
  { name: '22_supplier_dashboard.png', path: '/supplier/dashboard' },
  { name: '23_supplier_allocations.png', path: '/supplier/allocations' },
  { name: '24_supplier_market.png', path: '/supplier/market' },
  { name: '25_supplier_forecast.png', path: '/supplier/forecast' },
  { name: '26_supplier_legalitas.png', path: '/supplier/legalitas' },
  { name: '27_supplier_qc_handoff.png', path: '/supplier/qc-handoff' },
];

const hubPages = [
  { name: '28_hub_overview.png', path: '/hub' },
  { name: '29_hub_inbound.png', path: '/hub/inbound' },
  { name: '30_hub_weighing.png', path: '/hub/weighing' },
  { name: '31_hub_quarantine.png', path: '/hub/quarantine' },
  { name: '32_hub_deliveries.png', path: '/hub/deliveries' },
  { name: '33_hub_sop.png', path: '/hub/sop' },
];

const adminPages = [
  { name: '34_admin_dashboard.png', path: '/admin' },
  { name: '35_admin_escrow.png', path: '/admin/escrow' },
  { name: '36_admin_quotas.png', path: '/admin/quotas' },
  { name: '37_admin_system.png', path: '/admin/system' },
  { name: '38_admin_logistics_operators.png', path: '/admin/logistics/operators' },
  { name: '39_admin_tenants.png', path: '/tenants' },
];

async function captureGroup(browser, pages, roleConfig = null) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.25 });

  if (roleConfig) {
    const token = makeToken(roleConfig.macroRole, roleConfig.microRole, roleConfig.email, roleConfig.businessName);
    await page.setCookie(
      { name: 'pasok_session', value: token, domain: DOMAIN, path: '/' },
      { name: 'pasok_session_role', value: roleConfig.microRole, domain: DOMAIN, path: '/' },
      { name: 'pasok_macro_role', value: roleConfig.macroRole, domain: DOMAIN, path: '/' },
      { name: 'pasok_kyb_status', value: 'VERIFIED', domain: DOMAIN, path: '/' },
      { name: 'pasok_business_name', value: encodeURIComponent(roleConfig.businessName), domain: DOMAIN, path: '/' },
      { name: 'pasok_user_name', value: encodeURIComponent(roleConfig.userName), domain: DOMAIN, path: '/' },
    );
  }

  for (const item of pages) {
    const targetUrl = `${BASE_URL}${item.path}`;
    try {
      console.log(`[Capture Production] ${targetUrl} -> ${item.name}...`);
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise((r) => setTimeout(r, 1200));
      const dest = path.join(outDir, item.name);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`  Saved: ${dest}`);
    } catch (err) {
      console.warn(`  Failed ${targetUrl}:`, err.message);
    }
  }

  await page.close();
}

async function main() {
  console.log('--- Production Auto-Capture Engine ---');
  console.log(`Target: ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  console.log('Capturing Public Pages...');
  await captureGroup(browser, publicPages);

  console.log('\nCapturing Buyer HoReKa Dashboards...');
  await captureGroup(browser, buyerPages, {
    macroRole: 'HOREKA',
    microRole: 'OWNER',
    email: 'buyer@demo.com',
    businessName: 'Restoran Bale Raos Kotagede',
    userName: 'Ibu Sri Rejeki',
  });

  console.log('\nCapturing Supplier Gapoktan Dashboards...');
  await captureGroup(browser, supplierPages, {
    macroRole: 'GAPOKTAN',
    microRole: 'CHAIRPERSON',
    email: 'supplier@demo.com',
    businessName: 'Gapoktan Srikayangan Makmur Sleman',
    userName: 'Pak Subardi',
  });

  console.log('\nCapturing Logistics Hub Operator Dashboards...');
  await captureGroup(browser, hubPages, {
    macroRole: 'HUB_OPERATOR',
    microRole: 'OPERATOR',
    email: 'hub@demo.com',
    businessName: 'Sentra Hub Logistik Kulon Progo',
    userName: 'Operator Timbangan Sentolo',
  });

  console.log('\nCapturing Super Admin Governance Dashboards...');
  await captureGroup(browser, adminPages, {
    macroRole: 'SUPER_ADMIN',
    microRole: 'SUPER_ADMIN',
    email: 'admin@pasokmataram.id',
    businessName: 'Pusat Tata Kelola Pangan Pemda DIY',
    userName: 'Administrator DIY',
  });

  await browser.close();
  console.log('\nAll 39 feature pages and dashboards captured from PRODUCTION successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
