/**
 * @file apps/web/src/app/api/v1/auth/logout/route.ts
 * Logout endpoint dengan explicit cookie clearing.
 * MEDIUM FIX: Pentest finding #8 - Proper logout mechanism.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: { message: 'Logout berhasil.' },
  });

  response.cookies.set('pasok_session', '', { 
    maxAge: 0, 
    path: '/',
    httpOnly: true,
  });
  
  response.cookies.set('session_token', '', { 
    maxAge: 0, 
    path: '/',
    httpOnly: true,
  });

  response.cookies.set('auth_token', '', { 
    maxAge: 0, 
    path: '/',
    httpOnly: true,
  });

  return response;
}
