#!/usr/bin/env node

/**
 * @file packages/database/scripts/seed.ts
 * @description Applies reference taxonomy in production and fixture SQL only to disposable databases.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
interface SeedConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface SeedLockRow extends RowDataPacket {
  acquired: number;
}

const requiredEnvironment = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} wajib dikonfigurasi.`);
  return value;
};

const parsePort = (): number => {
  const value = Number(process.env.DB_PORT || '3306');
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error('DB_PORT harus berupa bilangan bulat 1-65535.');
  return value;
};

const parseDatabaseName = (): string => {
  const value = requiredEnvironment('DB_NAME');
  if (!/^[A-Za-z0-9_]{1,64}$/.test(value)) throw new Error('DB_NAME hanya boleh berisi huruf, angka, dan underscore.');
  return value;
};

const config: SeedConfig = {
  host: requiredEnvironment('DB_HOST'),
  port: parsePort(),
  user: requiredEnvironment('DB_USER'),
  password: requiredEnvironment('DB_PASSWORD'),
  database: parseDatabaseName(),
};
const seedMode = process.env.DB_SEED_MODE || 'reference';
if (seedMode !== 'reference' && seedMode !== 'fixture') {
  throw new Error('DB_SEED_MODE harus reference atau fixture.');
}

function assertFixtureDatabase(): void {
  if (process.env.NODE_ENV === 'production' || process.env.DB_DISPOSABLE !== 'true' || !/(^|_)(test|sandbox|disposable)(_|$)/i.test(config.database)) {
    throw new Error('DB_SEED_MODE=fixture hanya boleh digunakan pada database disposable non-production.');
  }
}

async function applySeedFile(connection: mysql.Connection, filename: string): Promise<void> {
  const seedPath = join(process.cwd(), 'packages/database/src/schema', filename);
  if (!existsSync(seedPath)) throw new Error(`Seed file tidak ditemukan: ${seedPath}`);
  const sql = readFileSync(seedPath, 'utf-8').trim();
  if (sql) await connection.query(sql);
  console.log(`Applied ${filename}.`);
}

async function seedDatabase(): Promise<void> {
  if (seedMode === 'fixture') assertFixtureDatabase();
  console.log(`Seeding ${seedMode} data for ${config.database}.`);

  let connection: mysql.Connection | null = null;
  let seedLockAcquired = false;
  try {
    connection = await mysql.createConnection({ ...config, connectTimeout: 30000, multipleStatements: true });
    const [lockRows] = await connection.query<SeedLockRow[]>('SELECT GET_LOCK(?, 30) AS acquired', ['pasokmataram_seed']);
    seedLockAcquired = Number(lockRows[0]?.acquired) === 1;
    if (!seedLockAcquired) throw new Error('Tidak dapat memperoleh database seed lock.');

    await applySeedFile(connection, '02-seed-taxonomy.sql');
    if (seedMode === 'fixture') {
      await applySeedFile(connection, '03-seed-data.sql');
      console.log('Disposable fixture seed completed.');
    } else {
      console.log('Reference seed completed; fixture and synthetic data were not applied.');
    }
  } finally {
    if (connection && seedLockAcquired) await connection.query('SELECT RELEASE_LOCK(?)', ['pasokmataram_seed']);
    if (connection) await connection.end();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Seed failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
