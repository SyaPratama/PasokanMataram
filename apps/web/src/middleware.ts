import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  decodeSessionClaimsEdge,
  resolveUserHomeRoute,
  isRouteAllowedForRole,
} from '@pasok/security/edge';
import type { MacroRole, MicroRole, UserId, TenantId } from '@pasok/domain';

/**
 * Next.js Edge Middleware untuk Smart Edge Resolver & Proteksi Lintas Portal.
 * Memvalidasi kredensial pengguna, mencegah akses silang tenant, dan mengarahkan ke dashboard adaptif.
 * Kepatuhan: Konstitusi Prinsip XIII, FR-017, FR-018, dan SC-006.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('pasok_session')?.value || request.cookies.get('auth_token')?.value;
  let claims = sessionCookie ? decodeSessionClaimsEdge(sessionCookie) : null;

  if (pathname === '/login') {
    return NextResponse.next();
  }

  const isProtectedPath =
    pathname.startsWith('/horeka') ||
    pathname.startsWith('/buyer') ||
    pathname.startsWith('/farmer') ||
    pathname.startsWith('/supplier') ||
    pathname.startsWith('/hub') ||
    pathname.startsWith('/admin');

  if (isProtectedPath && !claims) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (isProtectedPath && claims) {
    const isAllowed = isRouteAllowedForRole(pathname, claims.macroRole, claims.microRole);

    if (!isAllowed) {
      const homeRoute = resolveUserHomeRoute(claims.macroRole);
      return NextResponse.redirect(new URL(homeRoute, request.nextUrl));
    }

    if (pathname === '/' || pathname === '/home') {
      const homeRoute = resolveUserHomeRoute(claims.macroRole);
      return NextResponse.redirect(new URL(homeRoute, request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|icons|images|favicon.ico|favicon.svg|manifest.webmanifest|sw.js).*)',
  ],
};
