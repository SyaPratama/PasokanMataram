/**
 * @file src/config/migrations.ts
 * @description Konfigurasi eksekusi migrasi database PostgreSQL.
 * Mematuhi Prinsip VII dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import path from 'path';

export const migrationsConfig = {
  migrationsDir: path.resolve(process.cwd(), 'docker/postgres/migrations'),
  trackingTable: '_migrations',
  schema: 'public',
  statementTimeoutMs: 30000,
  lockId: 424242,
  migrationFiles: [
    '001_create_extensions_and_enums.sql',
    '002_create_tenants_table.sql',
    '003_create_users_table.sql',
    '004_create_kyb_documents_table.sql',
    '005_create_business_outlets_table.sql',
    '006_create_indexes.sql',
    '007_create_rls_policies.sql',
  ] as const,
} as const;

export type MigrationsConfig = typeof migrationsConfig;
