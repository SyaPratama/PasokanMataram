#!/usr/bin/env node

/**
 * @file packages/database/scripts/seed.ts
 * @description Database seeding script for local development
 * Seeds test users, suppliers, buyers, operators, campaigns, and notifications
 */

import { createHash } from 'crypto';
import mysql from 'mysql2/promise';

interface SeedConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const config: SeedConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password_here',
  database: process.env.DB_NAME || 'pasokmataram_local',
};

/**
 * Hash password with SHA-256 (simple for seeding, use argon2 in production)
 */
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log(`📍 Target: ${config.host}:${config.port}/${config.database}\n`);

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(config);
    console.log('✓ Connected to MySQL\n');

    // Clear existing test data (optional)
    console.log('🧹 Clearing existing test data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('TRUNCATE TABLE tenants');
    await connection.query('TRUNCATE TABLE suppliers');
    await connection.query('TRUNCATE TABLE buyers');
    await connection.query('TRUNCATE TABLE hub_operators');
    await connection.query('TRUNCATE TABLE pooling_campaigns');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Test data cleared\n');

    // Seed Super Admin
    console.log('👤 Seeding Super Admin...');
    const adminId = generateUUID();
    const adminTenantId = generateUUID();

    await connection.query(
      `INSERT INTO tenants (id, business_name, type, kyb_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [adminTenantId, 'PasokMataram System Admin', 'ADMIN', 'VERIFIED']
    );

    await connection.query(
      `INSERT INTO users (id, tenant_id, email, phone, password_hash, micro_role, full_name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        adminId,
        adminTenantId,
        'admin@pasokmataram.com',
        '+6281234567890',
        hashPassword('Admin123!'),
        'SUPER_ADMIN',
        'Super Administrator',
        true,
      ]
    );
    console.log('  ✓ admin@pasokmataram.com / Admin123!\n');

    // Seed Suppliers (3)
    console.log('🌾 Seeding Suppliers...');
    const suppliers = [
      {
        email: 'supplier.sayur@test.com',
        businessName: 'Kebun Sayur Merapi',
        fullName: 'Bapak Sutrisno',
        phone: '+6281234567891',
        commodity: 'VEGETABLES',
        regency: 'SLEMAN',
      },
      {
        email: 'supplier.buah@test.com',
        businessName: 'Tani Buah Sleman',
        fullName: 'Ibu Suryani',
        phone: '+6281234567892',
        commodity: 'FRUITS',
        regency: 'SLEMAN',
      },
      {
        email: 'supplier.protein@test.com',
        businessName: 'Peternakan Bantul',
        fullName: 'Bapak Haryanto',
        phone: '+6281234567893',
        commodity: 'PROTEIN',
        regency: 'BANTUL',
      },
    ];

    for (const supplier of suppliers) {
      const userId = generateUUID();
      const tenantId = generateUUID();

      await connection.query(
        `INSERT INTO tenants (id, business_name, type, kyb_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [tenantId, supplier.businessName, 'SUPPLIER', 'VERIFIED']
      );

      await connection.query(
        `INSERT INTO users (id, tenant_id, email, phone, password_hash, micro_role, full_name, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          tenantId,
          supplier.email,
          supplier.phone,
          hashPassword('Supplier123!'),
          'SUPPLIER_OWNER',
          supplier.fullName,
          true,
        ]
      );

      await connection.query(
        `INSERT INTO suppliers (id, tenant_id, business_name, commodity_focus, regency, kyb_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [generateUUID(), tenantId, supplier.businessName, supplier.commodity, supplier.regency, 'VERIFIED']
      );

      console.log(`  ✓ ${supplier.email} / Supplier123!`);
    }
    console.log();

    // Seed Buyers (2)
    console.log('🍽️  Seeding Buyers...');
    const buyers = [
      {
        email: 'buyer.hotel@test.com',
        businessName: 'Hotel Mataram Yogyakarta',
        fullName: 'Ibu Ratna',
        phone: '+6281234567894',
        type: 'HOTEL',
        regency: 'YOGYAKARTA',
      },
      {
        email: 'buyer.resto@test.com',
        businessName: 'Restoran Gudeg Yu Djum',
        fullName: 'Bapak Djumadi',
        phone: '+6281234567895',
        type: 'RESTAURANT',
        regency: 'YOGYAKARTA',
      },
    ];

    for (const buyer of buyers) {
      const userId = generateUUID();
      const tenantId = generateUUID();

      await connection.query(
        `INSERT INTO tenants (id, business_name, type, kyb_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [tenantId, buyer.businessName, 'BUYER', 'VERIFIED']
      );

      await connection.query(
        `INSERT INTO users (id, tenant_id, email, phone, password_hash, micro_role, full_name, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          tenantId,
          buyer.email,
          buyer.phone,
          hashPassword('Buyer123!'),
          'HEAD_CHEF',
          buyer.fullName,
          true,
        ]
      );

      await connection.query(
        `INSERT INTO buyers (id, tenant_id, business_name, business_type, regency, kyb_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [generateUUID(), tenantId, buyer.businessName, buyer.type, buyer.regency, 'VERIFIED']
      );

      console.log(`  ✓ ${buyer.email} / Buyer123!`);
    }
    console.log();

    // Seed Hub Operators (2)
    console.log('🚚 Seeding Hub Operators...');
    const operators = [
      {
        email: 'operator.sleman@test.com',
        fullName: 'Operator Hub Sleman',
        phone: '+6281234567896',
        assignedHubId: 'hub-sleman-01',
      },
      {
        email: 'operator.bantul@test.com',
        fullName: 'Operator Hub Bantul',
        phone: '+6281234567897',
        assignedHubId: 'hub-bantul-01',
      },
    ];

    for (const operator of operators) {
      const userId = generateUUID();
      const operatorId = generateUUID();

      await connection.query(
        `INSERT INTO users (id, tenant_id, email, phone, password_hash, micro_role, full_name, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          adminTenantId,
          operator.email,
          operator.phone,
          hashPassword('Operator123!'),
          'HUB_OPERATOR',
          operator.fullName,
          true,
        ]
      );

      await connection.query(
        `INSERT INTO hub_operators (id, user_id, assigned_hub_id, micro_role, status, issued_by_admin_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [operatorId, userId, operator.assignedHubId, 'HUB_OPERATOR', 'ACTIVE', adminId]
      );

      console.log(`  ✓ ${operator.email} / Operator123!`);
    }
    console.log();

    // Seed Pooling Campaigns (2 Active)
    console.log('📦 Seeding Pooling Campaigns...');
    const campaigns = [
      {
        commodity: 'Tomat Merah',
        targetKg: 1000,
        reservedKg: 450,
        pricePerKg: 8500,
        minReservationKg: 50,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      },
      {
        commodity: 'Kubis Putih',
        targetKg: 800,
        reservedKg: 320,
        pricePerKg: 6000,
        minReservationKg: 30,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
      },
    ];

    for (const campaign of campaigns) {
      const campaignId = generateUUID();
      await connection.query(
        `INSERT INTO pooling_campaigns (id, commodity_name, target_quota_kg, current_reserved_kg, price_per_kg_rp, min_reservation_kg, deadline_at, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          campaignId,
          campaign.commodity,
          campaign.targetKg,
          campaign.reservedKg,
          campaign.pricePerKg,
          campaign.minReservationKg,
          campaign.deadline,
          'ACTIVE',
        ]
      );
      console.log(`  ✓ ${campaign.commodity} (${campaign.reservedKg}/${campaign.targetKg} kg)`);
    }
    console.log();

    // Seed Notifications (5 sample)
    console.log('🔔 Seeding Notifications...');
    const notifications = [
      {
        tenantId: adminTenantId,
        category: 'ORDER',
        priority: 'HIGH',
        title: 'Pesanan Dapur Terverifikasi',
        body: 'Alokasi 60 kg Bawang Merah Srikayangan Super A telah dikonfirmasi untuk jadwal antar subuh.',
      },
      {
        tenantId: adminTenantId,
        category: 'POOLING',
        priority: 'NORMAL',
        title: 'Progres Kuota Pooling 87%',
        body: 'Kampanye Bawang Merah Srikayangan Super A telah mencapai 870 kg dari target 1.000 kg.',
      },
      {
        tenantId: adminTenantId,
        category: 'SYSTEM',
        priority: 'NORMAL',
        title: 'Selamat Datang di PasokMataram',
        body: 'Sistem pengadaan bahan baku pangan terintegrasi untuk HOREKA Yogyakarta.',
      },
    ];

    for (const notif of notifications) {
      await connection.query(
        `INSERT INTO notifications (id, tenant_id, category, priority, title, body, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [generateUUID(), notif.tenantId, notif.category, notif.priority, notif.title, notif.body, false]
      );
      console.log(`  ✓ ${notif.title}`);
    }
    console.log();

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📋 Seeded:');
    console.log('   - 1 Super Admin');
    console.log('   - 3 Suppliers');
    console.log('   - 2 Buyers');
    console.log('   - 2 Hub Operators');
    console.log('   - 2 Pooling Campaigns');
    console.log('   - 3 Notifications');
    console.log();
    console.log('🔐 Test Credentials:');
    console.log('   Admin:    admin@pasokmataram.com / Admin123!');
    console.log('   Supplier: supplier.sayur@test.com / Supplier123!');
    console.log('   Buyer:    buyer.hotel@test.com / Buyer123!');
    console.log('   Operator: operator.sleman@test.com / Operator123!');
    console.log();
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error('\n❌ Seeding failed:', err.message || String(error));
    if (err.code) {
      console.error('Error code:', err.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase().catch(console.error);
