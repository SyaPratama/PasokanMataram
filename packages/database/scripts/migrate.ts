#!/usr/bin/env node

/**
 * @file packages/database/scripts/migrate.ts
 * @description Applies the authoritative MySQL schema without destructive legacy alignment or fixture data.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';
interface MigrationConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
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

const config: MigrationConfig = {
  host: requiredEnvironment('DB_HOST'),
  port: parsePort(),
  user: requiredEnvironment('DB_USER'),
  password: requiredEnvironment('DB_PASSWORD'),
  database: parseDatabaseName(),
};

async function runMigrations(): Promise<void> {
  console.log(`Applying authoritative schema to ${config.host}:${config.port}/${config.database}.`);
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: 30000,
      multipleStatements: true,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${config.database}\``);

    const candidateDirs = [
      join(process.cwd(), 'packages/database/src/schema'),
      join(process.cwd(), 'docker/mysql/init'),
    ];
    const schemaDir = candidateDirs.find((directory) => existsSync(directory));
    if (!schemaDir) throw new Error(`Schema directory not found. Checked: ${candidateDirs.join(', ')}`);

    const schemaFiles = readdirSync(schemaDir)
      .filter((filename) => /^001_.*\.sql$/i.test(filename))
      .sort();
    if (schemaFiles.length !== 1) throw new Error(`Expected exactly one authoritative schema file in ${schemaDir}.`);

    for (const filename of schemaFiles) {
      const sql = readFileSync(join(schemaDir, filename), 'utf-8').trim();
      if (!sql) throw new Error(`Authoritative schema file is empty: ${filename}`);
      await connection.query(sql);
      console.log(`Applied ${filename}.`);
    }
    console.log('Migration completed successfully.');
  } finally {
    if (connection) await connection.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error('Migration failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
