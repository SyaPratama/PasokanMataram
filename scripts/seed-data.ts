/**
 * Seed Data Script untuk PasokMataram
 * Menyediakan data awal real untuk development/testing tanpa sandbox mode.
 */

import { config } from 'dotenv';
import { Client } from 'pg';
import { hash } from 'argon2';

config({ path: '.env.local' });

interface SeedTenant {
  businessName: string;
  tenantType: 'HOREKA_BUYER' | 'GAPOKTAN_SUPPLIER';
  regency: 'SLEMAN' | 'BANTUL' | 'GUNUNGKIDUL' | 'KULON_PROGO' | 'KOTA_YOGYAKARTA';
  kybStatus: 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED';
  ownerName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const SEED_DATA: SeedTenant[] = [
  {
    businessName: 'Bale Raos Resto & Cafe',
    tenantType: 'HOREKA_BUYER',
    regency: 'SLEMAN',
    kybStatus: 'VERIFIED',
    ownerName: 'Budi Santoso',
    email: 'budi.santoso@baleraos.id',
    phoneNumber: '081234567890',
    password: 'password123',
  },
  {
    businessName: 'Gadang Coffee House',
    tenantType: 'HOREKA_BUYER',
    regency: 'KOTA_YOGYAKARTA',
    kybStatus: 'PENDING_VERIFICATION',
    ownerName: 'Ani Wijayanti',
    email: 'ani.wijayanti@gadangcoffee.id',
    phoneNumber: '081234567891',
    password: 'password123',
  },
  {
    businessName: 'Gapoktan Srikayangan Sentolo',
    tenantType: 'GAPOKTAN_SUPPLIER',
    regency: 'BANTUL',
    kybStatus: 'VERIFIED',
    ownerName: 'Sutoyo',
    email: 'sutoyo@srikayangan.id',
    phoneNumber: '081234567892',
    password: 'password123',
  },
  {
    businessName: 'Koperasi Susu Sleman',
    tenantType: 'GAPOKTAN_SUPPLIER',
    regency: 'SLEMAN',
    kybStatus: 'VERIFIED',
    ownerName: 'Dewi Lestari',
    email: 'dewi.lestari@susu-sleman.id',
    phoneNumber: '081234567893',
    password: 'password123',
  },
];

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Tama123',
    database: process.env.DB_NAME || 'pasokmataram_db',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    for (const data of SEED_DATA) {
      const passwordHash = await hash(data.password);

      const tenantResult = await client.query(
        `INSERT INTO tenants (business_name, tenant_type, regency, kyb_status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [data.businessName, data.tenantType, data.regency, data.kybStatus]
      );

      const tenantId = tenantResult.rows[0].id;

      await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, phone_number, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [tenantId, data.email, passwordHash, data.ownerName, data.phoneNumber, 'OWNER', true]
      );

      console.log(`✓ Created tenant: ${data.businessName} (${data.tenantType})`);
    }

    console.log('\nSeed data created successfully!');
    console.log('\nDemo accounts:');
    SEED_DATA.forEach((d) => {
      console.log(`  - ${d.email} / ${d.password}`);
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

main();
