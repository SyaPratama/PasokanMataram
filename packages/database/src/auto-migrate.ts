import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { databaseConfig } from '@pasok/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationFile {
  filename: string;
  path: string;
  order: number;
}

export interface AutoMigrationResult {
  success: boolean;
  migrationsRun: number;
  error?: string;
}

/**
 * Menjalankan migrasi database otomatis saat startup aplikasi.
 * Idempotent dan aman dipanggil berulang kali.
 * @param silent Mode senyap tanpa log (default: false untuk startup, true untuk test)
 * @returns Hasil migrasi
 */
export async function autoMigrate(silent = false): Promise<AutoMigrationResult> {
  const log = (msg: string) => !silent && console.log(msg);

  log('[Auto-Migration] Starting...');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pasokmataram_local',
    multipleStatements: true,
  };

  let connection: mysql.Connection | null = null;

  try {
    const rootConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      multipleStatements: true,
    });

    log(`[Auto-Migration] Creating database "${config.database}" if not exists...`);
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    await rootConnection.end();

    connection = await mysql.createConnection(config);

    const candidateDirs = [
      join(__dirname, './schema'),
      join(__dirname, '../src/schema'),
      join(__dirname, '../schema'),
      join(__dirname, '../migrations'),
      join(process.cwd(), 'packages/database/src/schema'),
      join(process.cwd(), 'packages/database/migrations'),
    ];

    let migrationsDir = '';
    for (const dir of candidateDirs) {
      if (existsSync(dir) && readdirSync(dir).some((f) => f.endsWith('.sql'))) {
        migrationsDir = dir;
        break;
      }
    }

    if (!migrationsDir) {
      log(`[Auto-Migration] No migration directory found. Checked: ${candidateDirs.join(', ')}`);
      return { success: true, migrationsRun: 0 };
    }

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .map((filename) => {
        const match = filename.match(/^(\d+)/);
        return {
          filename,
          path: join(migrationsDir, filename),
          order: match ? parseInt(match[1] ?? '999999', 10) : 999999,
        } as MigrationFile;
      })
      .sort((a, b) => a.order - b.order);

    if (files.length === 0) {
      log('[Auto-Migration] No migration files found');
      return { success: true, migrationsRun: 0 };
    }

    log(`[Auto-Migration] Running ${files.length} migration(s)...`);

    for (const file of files) {
      const sql = readFileSync(file.path, 'utf-8').trim();
      if (!sql) {
        continue;
      }
      try {
        await connection.query(sql);
        log(`[Auto-Migration] ✓ ${file.filename}`);
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
          log(`[Auto-Migration] - ${file.filename} (already applied)`);
        } else {
          throw error;
        }
      }
    }

    log('[Auto-Migration] Complete!');
    return { success: true, migrationsRun: files.length };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log(`[Auto-Migration] ERROR: ${message}`);
    return { success: false, migrationsRun: 0, error: message };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
