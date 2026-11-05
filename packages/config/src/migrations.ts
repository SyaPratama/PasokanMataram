/**
 * @file src/config/migrations.ts
 * @description Konfigurasi eksekusi migrasi database PostgreSQL.
 * Mematuhi Prinsip VII dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import path from 'path';

export const migrationsConfig = {
  migrationsDir: path.resolve(process.cwd(), 'docker/mysql/init'),
  trackingTable: '_migrations',
  schema: 'pasokmataram_db',
  statementTimeoutMs: 30000,
  lockId: 424242,
  migrationFiles: [
    '01-schema.sql',
    '02-seed-taxonomy.sql',
    '03-seed-data.sql',
  ] as const,
} as const;

export type MigrationsConfig = typeof migrationsConfig;
