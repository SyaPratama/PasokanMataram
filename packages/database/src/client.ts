import pg from 'pg';
import { databaseConfig, isDevelopment } from '@pasok/config';
import type { SecurityContext } from '@pasok/domain';

const { Pool } = pg;

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

export const pool = new Pool({
  connectionString: databaseConfig.connectionString,
  ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : undefined,
  max: databaseConfig.pool.maxConnections,
  idleTimeoutMillis: databaseConfig.pool.idleTimeoutMillis,
  connectionTimeoutMillis: databaseConfig.pool.connectionTimeoutMillis,
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
export async function query<R extends pg.QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: readonly unknown[]
): Promise<pg.QueryResult<R>> {
  const start = Date.now();
  const res = await pool.query<R>(text, params as unknown[] | undefined);
  const duration = Date.now() - start;
  if (isDevelopment && duration > databaseConfig.slowQueryThresholdMs) {
    console.warn(`[SLOW QUERY] ${duration}ms: ${text.slice(0, 80)}...`);
  }
  return res;
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
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  if (!context || !context.tenantId) {
    throw new SecurityException('Konteks keamanan wajib memiliki tenantId yang valid', 'INVALID_SECURITY_CONTEXT');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.current_tenant_id', $1::text, true)", [context.tenantId]);
    await client.query("SELECT set_config('app.is_super_admin', $1::text, true)", [
      context.isSuperAdmin ? 'true' : 'false',
    ]);

    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (error instanceof SecurityException) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes('rls') || errorMessage.toLowerCase().includes('security')) {
      throw new SecurityException(`Pelanggaran isolasi tenant: ${errorMessage}`, 'RLS_SECURITY_VIOLATION', context.tenantId);
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
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
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
