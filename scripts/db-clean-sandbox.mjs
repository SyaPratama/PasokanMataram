/**
 * @file scripts/db-clean-sandbox.mjs
 * @description Skrip isolasi pembersih & reset database sandbox PostgreSQL.
 * Menghapus schema public, menjalankan ulang seluruh migrasi 001-010,
 * dan memasukkan data seed fixtures bersih untuk pengujian lingkungan terisolasi.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const envLocal = path.resolve(process.cwd(), '.env.local');
const envDefault = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
}
if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || 'Tama123'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'pasokmataram_db'}`;

const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
const migrationsDir = path.resolve(process.cwd(), 'docker/postgres/migrations');
const advisoryLockId = 987654;

/**
 * Eksekusi reset schema dan seed sandbox.
 */
async function resetSandboxDatabase() {
  console.log('[SANDBOX-RESET] Menghubungkan ke basis data PostgreSQL...');
  const pool = new pg.Pool({
    connectionString,
    ssl,
    connectionTimeoutMillis: 5000,
  });

  let client;
  try {
    client = await pool.connect();
  } catch (connectionError) {
    console.warn('[SANDBOX-RESET] Peringatan: Basis data PostgreSQL tidak dapat dijangkau.');
    console.warn('[SANDBOX-RESET] Panduan: Pastikan kontainer docker aktif dengan menjalankan "docker compose up -d postgres"');
    console.warn('[SANDBOX-RESET] Detail error:', connectionError.message);
    await pool.end();
    return;
  }

  try {
    await client.query('SELECT pg_advisory_lock($1)', [advisoryLockId]);
    console.log('[SANDBOX-RESET] Advisory lock diperoleh. Menghapus schema public lama...');

    await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`[SANDBOX-RESET] Menerapkan ${migrationFiles.length} berkas migrasi deklaratif...`);

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[SANDBOX-RESET] [+] Berhasil menerapkan: ${file}`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        console.error(`[SANDBOX-RESET] [X] Gagal menerapkan ${file}:`, migrationErr.message);
        throw migrationErr;
      }
    }

    console.log('[SANDBOX-RESET] Memasukkan data benih (seed fixtures) sandbox...');
    await client.query('BEGIN');

    const horekaTenantId = '11111111-1111-4111-8111-111111111111';
    const gapoktanTenantId = '22222222-2222-4222-8222-222222222222';
    const hubTenantId = '33333333-3333-4333-8333-333333333333';
    const adminTenantId = '44444444-4444-4444-8444-444444444444';

    await client.query(
      `INSERT INTO tenants (id, business_name, tenant_type, regency, kyb_status)
       VALUES
         ($1, 'Kopi Klotok Heritage', 'HOREKA_BUYER', 'SLEMAN', 'VERIFIED'),
         ($2, 'Gapoktan Srikayangan', 'GAPOKTAN_SUPPLIER', 'KULON_PROGO', 'VERIFIED'),
         ($3, 'Hub Transit Bantul Logistik', 'GAPOKTAN_SUPPLIER', 'BANTUL', 'VERIFIED'),
         ($4, 'Konsorsium PasokMataram', 'HOREKA_BUYER', 'KOTA_YOGYAKARTA', 'VERIFIED')
       ON CONFLICT (id) DO NOTHING;`,
      [horekaTenantId, gapoktanTenantId, hubTenantId, adminTenantId]
    );

    const dummyPasswordHash = '$argon2id$v=19$m=65536,t=3,p=4$sandboxdummyhash$sandboxdummyhash';
    const operatorUserId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, phone_number, role)
       VALUES
         ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', $1, 'chef.klotok@pasokmataram.id', $5, 'Chef Bambang Sutrisno', '+6281234567890', 'KITCHEN_STAFF'),
         ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', $2, 'ketua.subardi@srikayangan.id', $5, 'H. Subardi Sentolo', '+6281234567891', 'OWNER'),
         ($6, $3, 'operator.bantul@pasokmataram.id', $5, 'Ahmad Dahlan QC', '+6281234567892', 'PROCUREMENT_MANAGER'),
         ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', $4, 'admin@pasokmataram.id', $5, 'Super Admin PasokMataram', '+6281234567893', 'SUPER_ADMIN')
       ON CONFLICT (email) DO NOTHING;`,
      [horekaTenantId, gapoktanTenantId, hubTenantId, adminTenantId, dummyPasswordHash, operatorUserId]
    );

    await client.query(
      `INSERT INTO business_outlets (id, tenant_id, outlet_name, street_address, regency, district, latitude, longitude, contact_person, contact_phone, is_main_outlet)
       VALUES
         ('55555555-5555-4555-8555-555555555555', $1, 'Dapur Pusat Kopi Klotok Pakem', 'Jl. Kaliurang KM 16', 'SLEMAN', 'Pakem', -7.6543210, 110.4321000, 'Chef Bambang', '+6281234567890', true),
         ('66666666-6666-4666-8666-666666666666', $1, 'Kopi Klotok Heritage Prawirotaman', 'Jl. Prawirotaman No. 12', 'KOTA_YOGYAKARTA', 'Mergangsan', -7.8185000, 110.3685000, 'Siti Kasir', '+6281234567894', false)
       ON CONFLICT (id) DO NOTHING;`,
      [horekaTenantId]
    );

    const commodityBawangId = '77777777-7777-4777-8777-777777777777';
    const commodityCabaiId = '88888888-8888-4888-8888-888888888888';

    await client.query(
      `INSERT INTO commodities (id, code, name, category, origin_region, unit)
       VALUES
         ($1, 'BMR-SRIKAYANGAN', 'Bawang Merah Srikayangan Grade A', 'Hortikultura', 'Sentra Srikayangan Kulon Progo', 'kg'),
         ($2, 'CRM-SLEMAN', 'Cabai Rawit Merah Sleman', 'Hortikultura', 'Lereng Merapi Sleman', 'kg')
       ON CONFLICT (code) DO NOTHING;`,
      [commodityBawangId, commodityCabaiId]
    );

    const campaignId = '99999999-9999-4999-8999-999999999999';
    await client.query(
      `INSERT INTO pooling_campaigns (id, supplier_tenant_id, commodity_name, commodity_category, temperature_zone, target_quota_kg, allocated_quota_kg, price_per_kg, min_order_kg, status, starts_at, ends_at)
       VALUES
         ($1, $2, 'Bawang Merah Srikayangan Grade A', 'Hortikultura', 'AMBIENT_VENTILATED', 1000.00, 100.00, 24500.00, 25.00, 'OPEN', NOW(), NOW() + INTERVAL '3 days')
       ON CONFLICT (id) DO NOTHING;`,
      [campaignId, gapoktanTenantId]
    );

    const reservationId = 'aaaaaaaa-1111-4aaa-8aaa-111111111111';
    await client.query(
      `INSERT INTO pool_reservations (id, campaign_id, buyer_tenant_id, quantity_kg, price_per_kg, total_amount_rp, status, delivery_address)
       VALUES
         ($1, $2, $3, 100.00, 24500.00, 2450000.00, 'PAID', 'Jl. Kaliurang KM 16, Pakem, Sleman')
       ON CONFLICT (id) DO NOTHING;`,
      [reservationId, campaignId, horekaTenantId]
    );

    await client.query(
      `INSERT INTO weighing_verifications (
         reservation_id, hub_id, operator_id, commodity_category, temperature_zone,
         measured_temp_celsius, manifest_weight_kg, actual_weight_kg, weight_difference_kg,
         shrinkage_percentage, tolerance_status, is_temperature_compliant, scale_device_id, notes
       )
       VALUES
         ($1, 'HUB-BANTUL-01', $2, 'Hortikultura', 'AMBIENT_VENTILATED', 26.50, 100.00, 99.20, -0.80, 0.80, 'WITHIN_TOLERANCE', true, 'TERA-BANTUL-DIGITAL-04', 'Penimbangan tera digital akurat SNI');`,
      [reservationId, operatorUserId]
    );

    await client.query('COMMIT');
    console.log('[SANDBOX-RESET] Berhasil: Database sandbox bersih telah terpasang dan siap digunakan!');
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('[SANDBOX-RESET] Gagal melakukan reset basis data:', err);
    throw err;
  } finally {
    if (client) {
      await client.query('SELECT pg_advisory_unlock($1)', [advisoryLockId]).catch(() => {});
      client.release();
    }
    await pool.end();
  }
}

resetSandboxDatabase().catch((err) => {
  console.error('[SANDBOX-RESET] Error fatal:', err.message);
  process.exit(1);
});
