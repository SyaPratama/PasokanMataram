/**
 * @file scripts/optimize-images.mjs
 * @description Skrip otomasi untuk memproses aset gambar JPG/PNG dari folder staging menjadi format WebP
 * terkompresi sesuai ketentuan Konstitusi PasokMataram v1.4.0 (Prinsip VIII).
 * 
 * Penggunaan:
 *   node scripts/optimize-images.mjs [folder-sumber] [folder-tujuan]
 * Contoh:
 *   node scripts/optimize-images.mjs staging-assets public/images/commodities
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Pustaka sharp digunakan untuk pemrosesan gambar berkinerja tinggi.
 */
let sharp;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default || sharpModule;
} catch {
  console.warn('[PERINGATAN] Modul "sharp" belum terpasang. Jalankan "npm install -D sharp" untuk mengaktifkan konversi WebP.');
}

const args = process.argv.slice(2);
const stagingDir = path.resolve(args[0] || 'staging-assets');
const outputDir = path.resolve(args[1] || 'public/images/commodities');

/**
 * Memproses seluruh berkas raster menjadi format WebP teroptimasi.
 */
async function processImages() {
  if (!sharp) {
    console.error('[GAGAL] Pustaka sharp diperlukan untuk menjalankan konversi WebP.');
    process.exit(1);
  }

  if (!fs.existsSync(stagingDir)) {
    console.log(`[INFO] Folder staging belum ditemukan di ${stagingDir}.`);
    console.log('Buat folder "staging-assets" dan letakkan foto dari Unsplash/Pexels di dalamnya.');
    return;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entries = fs.readdirSync(stagingDir, { withFileTypes: true });
  const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.bmp']);

  let convertedCount = 0;

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!validExtensions.has(ext)) continue;

    const baseName = path.basename(entry.name, ext);
    const inputFilePath = path.join(stagingDir, entry.name);
    const outputFilePath = path.join(outputDir, `${baseName}.webp`);

    try {
      console.log(`[PROSES] Mengonversi ${entry.name} -> ${baseName}.webp...`);

      await sharp(inputFilePath)
        .resize(800, 800, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: false,
        })
        .webp({
          quality: 80,
          effort: 6,
          lossless: false,
        })
        .toFile(outputFilePath);

      const inStat = fs.statSync(inputFilePath);
      const outStat = fs.statSync(outputFilePath);
      const savings = (((inStat.size - outStat.size) / inStat.size) * 100).toFixed(1);

      console.log(
        `[BERHASIL] ${baseName}.webp (${(outStat.size / 1024).toFixed(1)} KB, hemat ${savings}%)`
      );
      convertedCount++;
    } catch (err) {
      console.error(`[ERROR] Gagal memproses ${entry.name}:`, err.message);
    }
  }

  console.log(`\nSelesai! Berhasil mengonversi ${convertedCount} aset ke WebP di ${outputDir}`);
}

processImages().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
