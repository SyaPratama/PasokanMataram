import { describe, it, expect } from 'vitest';
import {
  appConfig,
  databaseConfig,
  storageConfig,
  cacheConfig,
  authConfig,
  paginationConfig,
  diyRegenciesConfig,
  geoBoundsDiyConfig,
  kybRulesConfig,
  migrationsConfig,
  themeColors,
} from '@pasok/config';

describe('Centralized Configuration Architecture (Prinsip IX Konstitusi)', () => {
  it('memvalidasi app configuration default', () => {
    expect(appConfig.appName).toBe('PasokMataram');
    expect(appConfig.version).toBe('1.5.0');
    expect(appConfig.port).toBeGreaterThan(0);
  });

  it('memvalidasi database configuration invariants', () => {
    expect(databaseConfig.connectionString).toBeDefined();
    expect(databaseConfig.pool.maxConnections).toBe(20);
    expect(databaseConfig.pool.idleTimeoutMillis).toBe(30000);
    expect(databaseConfig.pool.connectionTimeoutMillis).toBe(5000);
    expect(databaseConfig.slowQueryThresholdMs).toBe(200);
  });

  it('memvalidasi storage configuration (MinIO S3)', () => {
    expect(storageConfig.endpoint).toBeDefined();
    expect(storageConfig.bucketPrivate).toBeDefined();
    expect(storageConfig.maxFileSizeBytes).toBe(5242880);
    expect(storageConfig.allowedMimeTypes).toContain('application/pdf');
    expect(storageConfig.allowedMimeTypes).toContain('image/webp');
  });

  it('memvalidasi cache configuration (Redis lock TTL)', () => {
    expect(cacheConfig.url).toMatch(/^redis:\/\//);
    expect(cacheConfig.defaultLockTtlSeconds).toBe(10);
    expect(cacheConfig.keyPrefix).toBe('pasokmataram:');
  });

  it('memvalidasi auth configuration (JWT & Cookies)', () => {
    expect(authConfig.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(authConfig.cookieName).toBe('pasok_session');
    expect(authConfig.cookieHttpOnly).toBe(true);
    expect(authConfig.sessionExpiryDays).toBe(7);
  });

  it('memvalidasi domain rules & business constants', () => {
    expect(paginationConfig.defaultLimit).toBe(25);
    expect(paginationConfig.maxLimit).toBe(100);
    expect(diyRegenciesConfig).toHaveLength(5);
    expect(geoBoundsDiyConfig.minLatitude).toBeLessThan(geoBoundsDiyConfig.maxLatitude);
    expect(kybRulesConfig.maxFileSizeBytes).toBe(5 * 1024 * 1024);
  });

  it('memvalidasi migrations configuration', () => {
    expect(migrationsConfig.trackingTable).toBe('_migrations');
    expect(migrationsConfig.migrationFiles.length).toBeGreaterThan(0);
    expect(migrationsConfig.lockId).toBe(424242);
  });

  it('memvalidasi theme colors tokens', () => {
    expect(themeColors.primer.DEFAULT).toBe('#2E5339');
    expect(themeColors.primer.deep).toBe('#1B3622');
    expect(themeColors.primer.darkest).toBe('#142819');
    expect(themeColors.primer.surface).toBe('#122416');
    expect(themeColors.cta.DEFAULT).toBe('#2E5339');
    expect(themeColors.cta.hover).toBe('#24422D');
    expect(themeColors.cta.accent).toBe('#B85324');
    expect(themeColors.cta.gold).toBe('#D48028');
    expect(themeColors.netral.canvas).toBe('#F7F4EE');
    expect(themeColors.netral['deep-border']).toBe('#1C3A24');
  });
});
