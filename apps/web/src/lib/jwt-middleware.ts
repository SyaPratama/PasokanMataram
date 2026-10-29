/**
 * @file apps/web/src/lib/jwt-middleware.ts
 * JWT signature verification middleware untuk API routes.
 * CRITICAL FIX: Pentest finding #1 - JWT forgery prevention.
 */

import { verifySessionToken } from '@pasok/security/edge';
import type { UserSessionClaims } from '@pasok/security/edge';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars';

/**
 * Verifikasi JWT dari cookie atau Authorization header.
 * Returns null jika token invalid/expired/forged.
 */
export async function verifyRequestAuth(request: NextRequest): Promise<UserSessionClaims | null> {
  const cookieToken = request.cookies.get('pasok_session')?.value || request.cookies.get('auth_token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  const token = cookieToken || bearerToken;
  if (!token) return null;
  
  return verifySessionToken(token, JWT_SECRET);
}

/**
 * Require authenticated user - return 401 jika invalid.
 */
export async function requireAuth(request: NextRequest): Promise<{ claims: UserSessionClaims } | { error: Response }> {
  const claims = await verifyRequestAuth(request);
  if (!claims) {
    return { 
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
  return { claims };
}

/**
 * Require admin role - return 403 jika bukan admin.
 */
export async function requireAdmin(request: NextRequest): Promise<{ claims: UserSessionClaims } | { error: Response }> {
  const result = await requireAuth(request);
  if ('error' in result) return result;
  
  if (!result.claims.isSuperAdmin && result.claims.macroRole !== 'SUPER_ADMIN') {
    return {
      error: new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
  
  return result;
}
