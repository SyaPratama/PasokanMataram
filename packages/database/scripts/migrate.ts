#!/usr/bin/env node

/**
 * @file packages/database/scripts/migrate.ts
 * @description Auto-migration runner for MySQL database
 * Creates database if not exists and runs all SQL migrations
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationFile {
  filename: string;
  path: string;
  order: number;
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
    // Connect without database first
    const rootConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      multipleStatements: true,
    });

    console.log('✓ Connected to MySQL server\n');

    // Create database if not exists
    console.log(`📦 Creating database "${config.database}" if not exists...`);
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✓ Database "${config.database}" ready\n`);

    await rootConnection.end();

    // Connect to the specific database
    connection = await mysql.createConnection(config);

    // Get migration files
    const migrationsDir = join(__dirname, '../migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .map((filename) => {
        const orderMatch = filename.match(/^(\d+)/);
        const order = orderMatch ? parseInt(orderMatch[1], 10) : 999;
        return {
          filename,
          path: join(migrationsDir, filename),
          order,
        } as MigrationFile;
      })
      .sort((a, b) => a.order - b.order);

    if (files.length === 0) {
      console.log('⚠️  No migration files found in packages/database/migrations/\n');
      return;
    }

    console.log(`📋 Found ${files.length} migration file(s):\n`);

    // Run migrations
    for (const file of files) {
      console.log(`⏳ Running: ${file.filename}...`);
      const sql = readFileSync(file.path, 'utf-8');

      try {
        await connection.query(sql);
        console.log(`✓ Completed: ${file.filename}\n`);
      } catch (error: unknown) {
        const mysqlError = error as { code?: string; message?: string };
        // Ignore duplicate table errors (migrations are not tracked)
        if (mysqlError.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Table already exists, skipping: ${file.filename}\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!\n');
  } catch (error: unknown) {
    const err = error as { message?: string; sql?: string };
    console.error('\n❌ Migration failed:', err.message || String(error));
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
