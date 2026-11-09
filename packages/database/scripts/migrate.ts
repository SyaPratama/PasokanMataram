#!/usr/bin/env node

/**
 * @file packages/database/scripts/migrate.ts
 * @description Auto-migration runner for MySQL database
 * Creates database if not exists and runs all SQL migrations
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { withDbRetry } from '../src/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationFile {
  filename: string;
  path: string;
  order: number;
}

/**
 * Automatically aligns legacy tables that were created prior to 4NF refactor
 * Ensures columns like reservation_id and UUID primary keys exist
 */
async function alignLegacyTables(connection: mysql.Connection) {
  try {
    const [esCols] = await connection.query<any[]>(
      "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'escrow_settlements'"
    );
    if (Array.isArray(esCols) && esCols.length > 0) {
      const colMap = new Set(esCols.map((c) => c.COLUMN_NAME));
      if (!colMap.has('reservation_id') || colMap.has('deprecated_at')) {
        console.log('  Aligning legacy escrow_settlements table to 4NF schema...');
        await connection.query('DROP TABLE IF EXISTS escrow_settlements');
      }
    }

    const [piCols] = await connection.query<any[]>(
      "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payment_invoices'"
    );
    if (Array.isArray(piCols) && piCols.length > 0) {
      const colMap = new Map(piCols.map((c) => [c.COLUMN_NAME, c]));
      if (!colMap.has('reservation_id')) {
        const [cnt] = await connection.query<any[]>('SELECT COUNT(*) as c FROM payment_invoices');
        if ((cnt[0]?.c ?? 0) <= 8) {
          console.log('  Aligning legacy payment_invoices table to 4NF schema...');
          await connection.query('DROP TABLE IF EXISTS payment_invoices');
        } else {
          console.log('  Adding missing 4NF columns to payment_invoices...');
          await connection.query('ALTER TABLE payment_invoices ADD COLUMN reservation_id CHAR(36) AFTER tenant_id');
          if (!colMap.has('external_invoice_id')) {
            await connection.query('ALTER TABLE payment_invoices ADD COLUMN external_invoice_id VARCHAR(255) UNIQUE AFTER reservation_id');
          }
          if (!colMap.has('provider')) {
            await connection.query("ALTER TABLE payment_invoices ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'solosmartpay' AFTER currency");
          }
          if (colMap.get('expires_at')?.IS_NULLABLE === 'NO') {
            await connection.query('ALTER TABLE payment_invoices MODIFY COLUMN expires_at DATETIME NULL');
          }
        }
      }
    }

    const [weCols] = await connection.query<any[]>(
      "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'webhook_events'"
    );
    if (Array.isArray(weCols) && weCols.length > 0) {
      const idCol = weCols.find((c) => c.COLUMN_NAME === 'id');
      if (idCol && idCol.DATA_TYPE !== 'char' && idCol.DATA_TYPE !== 'varchar') {
        console.log('  Aligning legacy webhook_events table to 4NF UUID schema...');
        await connection.query('DROP TABLE IF EXISTS webhook_events');
      }
    }

    const [taCols] = await connection.query<any[]>(
      "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'terms_acceptances'"
    );
    if (Array.isArray(taCols) && taCols.length > 0) {
      const idCol = taCols.find((c) => c.COLUMN_NAME === 'id');
      if (idCol && idCol.DATA_TYPE !== 'char' && idCol.DATA_TYPE !== 'varchar') {
        console.log('  Aligning legacy terms_acceptances table to 4NF UUID schema...');
        await connection.query('DROP TABLE IF EXISTS terms_acceptances');
      }
    }
  } catch (err) {
    console.warn('  Note: Legacy table alignment check:', (err as Error).message);
  }
}

async function runMigrations() {
  console.log('Starting database migration...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password_here',
    database: process.env.DB_NAME || 'pasokmataram_local',
    multipleStatements: true,
  };

  console.log(`Connecting to MySQL at ${config.host}:${config.port}...`);

  let connection: mysql.Connection | null = null;

  try {
    const rootConnection = await withDbRetry(() =>
      mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        connectTimeout: 30000,
        multipleStatements: true,
      })
    );

    console.log('Connected to MySQL server\n');
    console.log(` Creating database "${config.database}" if not exists...`);
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database "${config.database}" ready\n`);
    await rootConnection.query(`USE \`${config.database}\``);
    connection = rootConnection;
    const candidateDirs = [
      join(__dirname, '../src/schema'),
      join(process.cwd(), 'packages/database/src/schema'),
      join(process.cwd(), 'docker/mysql/init'),
      join(__dirname, '../../../docker/mysql/init'),
      join(__dirname, '../schema'),
      join(__dirname, '../migrations'),
    ];

    let migrationsDir = '';
    for (const dir of candidateDirs) {
      if (existsSync(dir) && readdirSync(dir).some((f) => f.endsWith('.sql'))) {
        migrationsDir = dir;
        break;
      }
    }

    if (!migrationsDir) {
      throw new Error(`Migration directory not found. Checked: ${candidateDirs.join(', ')}`);
    }

    console.log(`Loading migrations from: ${migrationsDir}\n`);

    await alignLegacyTables(connection);
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .map((filename) => {
        const orderMatch = filename.match(/^(\d+)/);
        const order = orderMatch ? parseInt(orderMatch[1] ?? '999', 10) : 999;
        return {
          filename,
          path: join(migrationsDir, filename),
          order,
        } as MigrationFile;
      })
      .sort((a, b) => a.order - b.order);

    if (files.length === 0) {
      console.log(`  No migration files found in ${migrationsDir}\n`);
      return;
    }

    console.log(` Found ${files.length} migration file(s):\n`);

    for (const file of files) {
      const sql = readFileSync(file.path, 'utf-8').trim();
      if (!sql) {
        console.log(`  Skipping empty file: ${file.filename}\n`);
        continue;
      }

      console.log(`  Applying migration: ${file.filename}...`);

      try {
        await withDbRetry(async () => {
          try {
            await connection!.query(sql);
          } catch (error: unknown) {
            const mysqlError = error as { code?: string; message?: string };
            const ignorableCodes = [
              'ER_TABLE_EXISTS_ERROR',
              'ER_DUP_FIELDNAME',
              'ER_DUP_KEYNAME',
              'ER_CANT_DROP_FIELD_OR_KEY',
              'ER_NO_SUCH_TABLE',
            ];
            if (mysqlError.code && ignorableCodes.includes(mysqlError.code)) {
              console.log(`  Already applied (${mysqlError.code}), skipping: ${file.filename}\n`);
              return;
            }
            throw error;
          }
        });
        console.log(`Completed: ${file.filename}\n`);
      } catch (error: unknown) {
        console.error(`\nFailed applying migration ${file.filename}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully!\n');
  } catch (error: unknown) {
    const err = error as { message?: string; sql?: string; errors?: Error[] };
    const detail = err.errors ? err.errors.map(e => e.message).join(', ') : (err.message || String(error));
    console.error('\nMigration failed:', detail);
    if (err.sql) {
      console.error('Failed SQL:', err.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations().catch(console.error);
