#!/usr/bin/env node

/**
 * @file packages/database/scripts/seed.ts
 * @description Database seeding script with Production Smart Seed Gate (4NF Compliant)
 * Populates realistic data across 26 tables for all personas and features.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SeedConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const config: SeedConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'pasok_user',
  password: process.env.DB_PASSWORD || 'Tama123',
  database: process.env.DB_NAME || 'pasokmataram_db',
};

async function connectWithRetry(
  connConfig: mysql.ConnectionOptions,
  maxRetries = 3,
  delayMs = 2000
): Promise<mysql.Connection> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await mysql.createConnection(connConfig);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.log(`  Connection attempt ${attempt} failed (${(err as Error).message}). Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

async function seedDatabase() {
  console.log('--- PasokMataram Database Seeding ---');
  console.log(`Target: ${config.host}:${config.port}/${config.database}\n`);

  let connection: mysql.Connection | null = null;

  try {
    connection = await connectWithRetry({
      ...config,
      connectTimeout: 30000,
      multipleStatements: true,
    });
    console.log('Connected to MySQL server successfully.\n');

    // 1. SMART SEED GATE (Production Data Protection)
    const [rows] = await connection.query<any[]>(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tenants'"
    );
    const tableExists = Array.isArray(rows) && rows[0]?.count > 0;

    if (tableExists) {
      const [countRows] = await connection.query<any[]>('SELECT COUNT(*) as count FROM tenants');
      const tenantCount = Array.isArray(countRows) ? countRows[0]?.count : 0;

      if (tenantCount > 0 && process.env.DB_FORCE_RESET !== 'true') {
        console.log(`[PRODUCTION SAFETY GATE] Active data detected (${tenantCount} tenants found).`);
        console.log('Skipping seed to protect live users, orders, and settlements.');
        console.log('(To force re-seed, set DB_FORCE_RESET=true explicitly)\n');
        return;
      }
    }

    console.log('[SEED] Running initial 4NF database population...');

    // 2. Locate SQL seed files
    const candidateDirs = [
      join(process.cwd(), 'docker/mysql/init'),
      join(__dirname, '../../../docker/mysql/init'),
      join(process.cwd(), 'packages/database/src/schema'),
      join(__dirname, '../src/schema'),
    ];

    let seedDir = '';
    for (const dir of candidateDirs) {
      if (existsSync(join(dir, '02-seed-taxonomy.sql')) || existsSync(join(dir, '03-seed-data.sql'))) {
        seedDir = dir;
        break;
      }
    }

    if (!seedDir) {
      throw new Error(`Seed SQL directory not found. Checked: ${candidateDirs.join(', ')}`);
    }

    console.log(`Loading seed files from: ${seedDir}`);

    // Execute taxonomy mapping
    const taxonomyFile = join(seedDir, '02-seed-taxonomy.sql');
    if (existsSync(taxonomyFile)) {
      const sql = readFileSync(taxonomyFile, 'utf-8').trim();
      if (sql) {
        await connection.query(sql);
        console.log('  Applied 02-seed-taxonomy.sql');
      }
    }

    // Execute comprehensive seed data (tenants, users, kyb, pooling, etc.)
    const seedDataFile = join(seedDir, '03-seed-data.sql');
    if (existsSync(seedDataFile)) {
      const sql = readFileSync(seedDataFile, 'utf-8').trim();
      if (sql) {
        await connection.query(sql);
        console.log('  Applied 03-seed-data.sql');
      }
    }

    // 3. Seed demo buyer account if not present
    const demoPasswordHash =
      '$argon2id$v=19$m=65536,t=3,p=4$vnpRsVUMELfMlCGOmC5D7A$9Mbqk8n+7CSbjcy6n/dAqt2BBCcosEXI1YpCVA9dp04'; // demo123
    await connection.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, phone_number, role, is_active)
       VALUES (
         '90000000-0000-0000-0000-000000000001',
         '10000000-0000-0000-0000-000000000001',
         'buyer@demo.com',
         ?,
         'Demo Buyer Manager',
         '+6281234567890',
         'PROCUREMENT_MANAGER',
         1
       ) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [demoPasswordHash]
    );
    console.log('  Ensured demo buyer (buyer@demo.com / demo123)');

    // 4. Seed Weather Observations (30 days x 5 regencies)
    console.log('  Seeding 150 weather observations...');
    const regencies = ['SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA'];
    const now = Date.now();
    for (let day = 0; day < 30; day++) {
      const dateStr = new Date(now - day * 86400000).toISOString().slice(0, 10);
      for (const reg of regencies) {
        const rainfall = Math.round(Math.random() * 80);
        const temp = Number((24 + Math.random() * 8).toFixed(1));
        const humidity = Number((65 + Math.random() * 25).toFixed(1));
        await connection.query(
          `INSERT INTO weather_observations (id, regency, recorded_date, rainfall_mm, temperature_celsius, humidity_percent, created_at)
           VALUES (UUID(), ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE rainfall_mm = VALUES(rainfall_mm)`,
          [reg, dateStr, rainfall, temp, humidity]
        );
      }
    }

    // 5. Seed Commodity Forecasts & 4NF Forecast Horizons
    console.log('  Seeding commodity forecasts & 4NF horizons...');
    const [comms] = await connection.query<any[]>('SELECT id, code, name, category FROM commodities');
    if (Array.isArray(comms) && comms.length > 0) {
      for (const c of comms) {
        const basePrice = c.code.includes('BERAS') ? 14800 : c.code.includes('CABAI') ? 48000 : c.code.includes('BAWANG') ? 36000 : 25000;
        const forecastId = `fc-${c.code.toLowerCase().replace(/_/g, '-')}`;

        await connection.query(
          `INSERT INTO commodity_forecasts (
             id, commodity_id, current_price, predicted_price_7d, predicted_price_30d, predicted_price_90d,
             trend, trend_percentage, confidence_score, mape_accuracy, optimal_buy_start, optimal_buy_end, target_price,
             recommended_action, action_explanation, weather_risk_level, weather_risk_description,
             rainfall_forecast_mm, historical_and_projected, algorithm, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, 'STABLE', 2.00, 93.5, 3.6, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), ?,
                     'BELI_SEKARANG', 'Harga stabil pasokan lancar', 'RENDAH', 'Kondisi cuaca mendukung',
                     15, '[]', 'LightGBM Multi-Horizon v1.3', NOW(), NOW())
           ON DUPLICATE KEY UPDATE current_price = VALUES(current_price)`,
          [forecastId, c.id, basePrice, Math.round(basePrice * 1.02), Math.round(basePrice * 1.05), Math.round(basePrice * 1.08), basePrice]
        );

        // 4NF multi-horizon table
        const horizons = [
          { days: 7, mult: 1.02 },
          { days: 30, mult: 1.05 },
          { days: 90, mult: 1.08 },
        ];
        for (const h of horizons) {
          const pred = Math.round(basePrice * h.mult);
          await connection.query(
            `INSERT INTO forecast_horizons (id, forecast_id, horizon_days, predicted_price, confidence_lower, confidence_upper, created_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`,
            [forecastId, h.days, pred, Math.round(pred * 0.95), Math.round(pred * 1.05)]
          );
        }
      }
    }

    console.log('\n[SUCCESS] Comprehensive 26-table seeding finished successfully!\n');
  } catch (error: unknown) {
    console.error('\n[ERROR] Seeding failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase().catch(console.error);
