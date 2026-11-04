/**
 * @file apps/web/instrumentation.ts
 * @description Next.js 14 instrumentation hook untuk auto-migration saat startup.
 * Mematuhi Prinsip IX Konstitusi (Zero Manual Configuration).
 * Referensi: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { autoMigrate } = await import('@pasok/database');
    
    console.log('[Next.js Startup] Running auto-migration...');
    const result = await autoMigrate(false);
    
    if (!result.success) {
      console.error('[Next.js Startup] Migration failed:', result.error);
      console.error('[Next.js Startup] App will continue but database may be outdated');
    } else {
      console.log(`[Next.js Startup] Migration complete (${result.migrationsRun} migrations)`);
    }
  }
}
