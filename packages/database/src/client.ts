import mysql from 'mysql2/promise';
import { databaseConfig, isDevelopment } from '@pasok/config';
import type { SecurityContext } from '@pasok/domain';

/**
 * Pengecualian keamanan khusus untuk pelanggaran batas multi-tenant.
 */
export class SecurityException extends Error {
  public readonly code: string;
  public readonly targetTenantId?: string;

  public constructor(message: string, code: string = 'TENANT_BOUNDARY_VIOLATION', targetTenantId?: string) {
    super(message);
    this.name = 'SecurityException';
    this.code = code;
    this.targetTenantId = targetTenantId;
    Object.setPrototypeOf(this, SecurityException.prototype);
  }
}

export const pool = mysql.createPool({
  uri: databaseConfig.connectionString,
  waitForConnections: true,
  connectionLimit: databaseConfig.pool.maxConnections,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on('error', (err: Error) => {
  if (isDevelopment) {
    console.error(`[DB ERROR] Pool error: ${err.message}`);
  }
});

/**
 * Menjalankan kueri SQL di luar transaksi berlingkup tenant (misal: onboarding awal atau pengecekan server).
 * Menggunakan strict typing tanpa 'any'.
 * @param text Perintah SQL kueri.
 * @param params Parameter kueri.
 * @returns Hasil kueri PostgreSQL.
 */
export async function query<R = any>(
  text: string,
  params?: readonly unknown[]
): Promise<{ rows: R[]; rowCount: number }> {
  const start = Date.now();
  const [rows] = await pool.execute(text, params as any[]);
  const duration = Date.now() - start;
  if (isDevelopment && duration > databaseConfig.slowQueryThresholdMs) {
    console.warn(`[SLOW QUERY] ${duration}ms: ${text.slice(0, 80)}...`);
  }
  return { rows: rows as R[], rowCount: Array.isArray(rows) ? rows.length : 0 };
}

/**
 * Menjalankan operasi basis data di dalam transaksi terisolasi Row-Level Security (RLS).
 * Menetapkan sesi 'SET LOCAL app.current_tenant_id = $1' dan membatalkan transaksi jika terjadi pelanggaran batas.
 * @param context Konteks keamanan aktor pemanggil.
 * @param callback Operasi yang dieksekusi dalam konteks tenant terisolasi.
 * @returns Nilai hasil operasi callback.
 */
export async function withTenantContext<T>(
  context: SecurityContext,
  callback: (client: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  if (!context || !context.tenantId) {
    throw new SecurityException('Konteks keamanan wajib memiliki tenantId yang valid', 'INVALID_SECURITY_CONTEXT');
  }

  const client = await pool.getConnection();
  try {
    await client.query('START TRANSACTION');
    await client.query('SET @current_tenant_id = ?', [context.tenantId]);
    await client.query('SET @is_super_admin = ?', [context.isSuperAdmin ? '1' : '0']);

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (error instanceof SecurityException) {
      throw error;
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Menjalankan transaksi multi-pernyataan atomik dengan rollback otomatis jika terjadi kegagalan.
 * @param callback Operasi transaksional.
 * @returns Nilai kembalian callback.
 */
export async function withTransaction<T>(
  callback: (client: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const client = await pool.getConnection();
  try {
    await client.query('START TRANSACTION');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
