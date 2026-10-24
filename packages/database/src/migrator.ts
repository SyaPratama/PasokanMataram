/**
 * Declarative PostgreSQL migration runner using advisory locks and tracking table.
 * Complies with Constitution VII and IX.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { databaseConfig, migrationsConfig } from '@pasok/config';

const { Pool } = pg;

export interface MigrationResult {
  file: string;
  status: 'applied' | 'skipped' | 'failed';
  error?: string;
}

/**
 * Runs pending database migrations idempotently under an advisory lock.
 */
export async function runMigrations(): Promise<MigrationResult[]> {
  const pool = new Pool({
    connectionString: databaseConfig.connectionString,
    ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: databaseConfig.pool.connectionTimeoutMillis,
  });

  const client = await pool.connect();
  const results: MigrationResult[] = [];

  try {
    await client.query(`SELECT pg_advisory_lock($1)`, [migrationsConfig.lockId]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${migrationsConfig.trackingTable} (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const appliedRows = await client.query<{ filename: string }>(
      `SELECT filename FROM ${migrationsConfig.trackingTable}`
    );
    const appliedFiles = new Set(appliedRows.rows.map((r) => r.filename));

    for (const file of migrationsConfig.migrationFiles) {
      if (appliedFiles.has(file)) {
        results.push({ file, status: 'skipped' });
        continue;
      }

      const filePath = path.join(migrationsConfig.migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File migrasi tidak ditemukan di konfigurasi: ${filePath}`);
      }

      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query(
          `INSERT INTO ${migrationsConfig.trackingTable} (filename) VALUES ($1)`,
          [file]
        );
        await client.query('COMMIT');
        results.push({ file, status: 'applied' });
      } catch (err) {
        await client.query('ROLLBACK');
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({ file, status: 'failed', error: errorMessage });
        throw new Error(`Gagal mengeksekusi migrasi ${file}: ${errorMessage}`);
      }
    }

    return results;
  } finally {
    try {
      await client.query(`SELECT pg_advisory_unlock($1)`, [migrationsConfig.lockId]);
    } catch {
    }
    client.release();
    await pool.end();
  }
}
