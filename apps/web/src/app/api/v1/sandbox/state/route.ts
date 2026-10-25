/**
 * @file apps/web/src/app/api/v1/sandbox/state/route.ts
 * @description BFF Route returning initialized Sandbox mock fixtures without mutating PostgreSQL.
 */

import { NextResponse } from 'next/server';
import { INITIAL_SANDBOX_STATE } from '@/components/sandbox/sandbox-context';

/**
 * Menghasilkan data fixtures sandbox untuk 4 persona pengujian.
 * @returns JSON fixtures awal sandbox.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: INITIAL_SANDBOX_STATE,
    message: 'Data fixtures mode sandbox berhasil dimuat (Zero DB Mutation).',
  });
}
