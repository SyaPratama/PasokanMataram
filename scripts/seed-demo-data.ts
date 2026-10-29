/**
 * @file scripts/seed-demo-data.ts
 * Demo seed data untuk testing authenticated user flows.
 */

import { query } from '../packages/database/src';
import { hashPassword } from '../apps/web/src/lib/auth';

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  const buyerTenantId = '11111111-1111-1111-1111-111111111111';
  const supplierTenantId = '33333333-3333-3333-3333-333333333333';
  const cabaiId = '55555555-5555-5555-5555-555555555555';
  const bawangId = '66666666-6666-6666-6666-666666666666';

  await query(`
    INSERT INTO tenants (id, business_name, tenant_type, regency, kyb_status, created_at)
    VALUES 
      ($1, 'Restoran Demo Jogja', 'HOREKA_BUYER', 'SLEMAN', 'VERIFIED', NOW()),
      ($2, 'Gapoktan Sleman Makmur', 'GAPOKTAN_SUPPLIER', 'SLEMAN', 'VERIFIED', NOW())
    ON CONFLICT (id) DO NOTHING
  `, [buyerTenantId, supplierTenantId]);

  const hashedPassword = await hashPassword('demo123');
  await query(`
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, phone_number, role, created_at)
    VALUES (
      '22222222-2222-2222-2222-222222222222',
      $1,
      'buyer@demo.com',
      $2,
      'Demo User',
      '081234567890',
      'OWNER',
      NOW()
    )
    ON CONFLICT (email) DO NOTHING
  `, [buyerTenantId, hashedPassword]);

  await query(`
    INSERT INTO supplier_profiles (tenant_id, category, fulfillment_model, created_at)
    VALUES ($1, 'FARMER_GROUP', 'POOL_GROUP_BUYING', NOW())
    ON CONFLICT (tenant_id) DO NOTHING
  `, [supplierTenantId]);

  await query(`
    INSERT INTO commodities (id, code, name, category, origin_region, unit)
    VALUES 
      ($1, 'CAB-MERAH-01', 'Cabai Merah Keriting', 'Hortikultura', 'Kulon Progo', 'kg'),
      ($2, 'BWG-MERAH-01', 'Bawang Merah Srikayangan', 'Hortikultura', 'Kulon Progo', 'kg')
    ON CONFLICT (id) DO NOTHING
  `, [cabaiId, bawangId]);

  await query(`
    INSERT INTO pooling_campaigns (
      id, supplier_tenant_id, commodity_name, commodity_category,
      target_quota_kg, price_per_kg, ends_at, created_at
    )
    VALUES 
      (
        '77777777-7777-7777-7777-777777777777',
        $1,
        'Cabai Merah Keriting',
        'Hortikultura',
        1000,
        35000,
        NOW() + INTERVAL '7 days',
        NOW()
      ),
      (
        '88888888-8888-8888-8888-888888888888',
        $1,
        'Bawang Merah Srikayangan',
        'Hortikultura',
        500,
        45000,
        NOW() + INTERVAL '5 days',
        NOW()
      )
    ON CONFLICT (id) DO NOTHING
  `, [supplierTenantId]);

  console.log('✅ Demo data seeded');
  console.log('📧 Email: buyer@demo.com');
  console.log('🔑 Password: demo123');
}

seedDemoData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
