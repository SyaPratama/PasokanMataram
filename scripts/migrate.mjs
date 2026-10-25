/**
 * @file scripts/migrate.mjs
 * @description Script eksekutor migrasi PostgreSQL 100% berbasis konfigurasi.
 * Mematuhi Prinsip VII dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : (process.env.NODE_ENV === 'test' ? '.env.local' : '.env.local');

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || 'Tama123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pasokmataram_db'}`;

const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

const migrationsDir = path.resolve(process.cwd(), 'docker/postgres/migrations');
const trackingTable = '_migrations';
const lockId = 424242;

async function migrate() {
  console.log(`[MIGRATOR] Menghubungkan ke PostgreSQL via konfigurasi...`);
  const pool = new pg.Pool({
    connectionString,
    ssl,
    connectionTimeoutMillis: 5000,
  });

  const client = await pool.connect();

  try {
    await client.query(`SELECT pg_advisory_lock($1)`, [lockId]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${trackingTable} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const appliedRows = await client.query(
      `SELECT filename FROM ${trackingTable}`
    );
    const appliedFiles = new Set(appliedRows.rows.map((r) => r.filename));

    const allFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`[MIGRATOR] Terdeteksi ${allFiles.length} file migrasi di ${migrationsDir}`);

    let appliedCount = 0;
    for (const file of allFiles) {
      if (appliedFiles.has(file)) {
        console.log(`[MIGRATOR] [-] Dilewati (sudah terpasang): ${file}`);
        continue;
      }

      console.log(`[MIGRATOR] [+] Menjalankan migrasi: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query(
          `INSERT INTO ${trackingTable} (filename) VALUES ($1)`,
          [file]
        );
        await client.query('COMMIT');
        console.log(`[MIGRATOR] [✓] Berhasil: ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[MIGRATOR] [✗] Gagal pada ${file}:`, err.message);
        throw err;
      }
    }

    console.log(`[MIGRATOR] Migrasi selesai. Total ${appliedCount} berkas baru dipasang.`);
  } finally {
    try {
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockId]);
    } catch {
      // Ignored
    }
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('[MIGRATOR FATAL] Kesalahan saat migrasi:', err.message);
  process.exit(1);
});
