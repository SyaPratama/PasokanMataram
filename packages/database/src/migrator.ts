/**
 * Declarative MySQL migration runner using GET_LOCK and tracking table.
 * Complies with Constitution VII and IX.
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { databaseConfig, migrationsConfig } from '@pasok/config';

export interface MigrationResult {
  file: string;
  status: 'applied' | 'skipped' | 'failed';
  error?: string;
}

/**
 * Runs pending database migrations idempotently under an advisory lock.
 */
export async function runMigrations(): Promise<MigrationResult[]> {
  const pool = mysql.createPool({
    uri: databaseConfig.connectionString,
    waitForConnections: true,
    connectionLimit: 1,
  });

  const connection = await pool.getConnection();
  const results: MigrationResult[] = [];

  try {
    await connection.query(`SELECT GET_LOCK(?, 10)`, [migrationsConfig.lockId.toString()]);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ${migrationsConfig.trackingTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [appliedRows] = await connection.query<any[]>(
      `SELECT filename FROM ${migrationsConfig.trackingTable}`
    );
    const appliedFiles = new Set(appliedRows.map((r: any) => r.filename));

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

      await connection.query('START TRANSACTION');
      try {
        await connection.query(sqlContent);
        await connection.query(
          `INSERT INTO ${migrationsConfig.trackingTable} (filename) VALUES (?)`,
          [file]
        );
        await connection.query('COMMIT');
        results.push({ file, status: 'applied' });
      } catch (err) {
        await connection.query('ROLLBACK');
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({ file, status: 'failed', error: errorMessage });
        throw new Error(`Gagal mengeksekusi migrasi ${file}: ${errorMessage}`);
      }
    }

    return results;
  } finally {
    try {
      await connection.query(`SELECT RELEASE_LOCK(?)`, [migrationsConfig.lockId.toString()]);
    } catch {
    }
    connection.release();
    await pool.end();
  }
}
