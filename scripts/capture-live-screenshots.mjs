import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'docs/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const targets = [
  { name: '01_landing_hero.png', url: 'https://pasok.syapratama.tech/' },
  { name: '02_katalog_komoditas.png', url: 'https://pasok.syapratama.tech/komoditas' },
  { name: '03_prediksi_harga_ml.png', url: 'https://pasok.syapratama.tech/prediksi-harga' },
  { name: '04_portal_login.png', url: 'https://pasok.syapratama.tech/login' },
  { name: '05_portal_registrasi.png', url: 'https://pasok.syapratama.tech/register' },
  { name: '06_kalkulator_penghematan.png', url: 'https://pasok.syapratama.tech/kalkulator' },
  { name: '07_alur_pengadaan.png', url: 'https://pasok.syapratama.tech/alur-pengadaan' },
  { name: '08_paket_layanan.png', url: 'https://pasok.syapratama.tech/paket-layanan' },
];

async function run() {
  console.log('Launching headless browser for auto-capture...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  for (const t of targets) {
    try {
      console.log(`Capturing: ${t.url} -> ${t.name}...`);
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise((r) => setTimeout(r, 1000));
      const dest = path.join(outDir, t.name);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`Saved: ${dest}`);
    } catch (err) {
      console.warn(`Failed capturing ${t.url}:`, err.message);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
