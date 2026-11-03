import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  decodeSessionClaimsEdge,
  resolveUserHomeRoute,
  isRouteAllowedForRole,
} from '@pasok/security/edge';
import type { MacroRole, MicroRole, UserId, TenantId } from '@pasok/domain';

/**
 * Next.js Edge Middleware untuk Smart Edge Resolver, Proteksi Lintas Portal, dan Mode Pemeliharaan.
 * Memvalidasi kredensial pengguna, mencegah akses silang tenant, dan mengontrol maintenance mode.
 * Kepatuhan: Konstitusi Prinsip XIII, FR-017, FR-018, dan SC-006.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  const isMaintenanceMode =
    process.env.MAINTENANCE_MODE === 'true' ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  const bypassParam = request.nextUrl.searchParams.get('bypass');
  const bypassCookie = request.cookies.get('pasok_maintenance_bypass')?.value;
  const configuredBypass = process.env.MAINTENANCE_BYPASS_TOKEN || 'pasok_dev_preview';
  const isBypassed =
    (Boolean(bypassParam) && bypassParam === configuredBypass) ||
    (Boolean(bypassCookie) && bypassCookie === configuredBypass);

  if (isMaintenanceMode) {
    if (isBypassed) {
      const response = NextResponse.next();
      if (bypassParam) {
        response.cookies.set('pasok_maintenance_bypass', bypassParam, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
      }
      return response;
    }

    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        {
          success: false,
          status: 503,
          code: 'MAINTENANCE_MODE',
          message:
            process.env.MAINTENANCE_MESSAGE ||
            'Sistem PasokMataram sedang dalam proses pemeliharaan infrastruktur berkala.',
          environment: process.env.NODE_ENV || 'production',
        },
        {
          status: 503,
          headers: {
            'Retry-After': '3600',
          },
        }
      );
    }

    if (pathname === '/maintenance') {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/maintenance', request.nextUrl));
  } else {
    if (pathname === '/maintenance') {
      return NextResponse.redirect(new URL('/', request.nextUrl));
    }
  }

  if (pathname.startsWith('/api')) {
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
    '/((?!_next|icons|images|favicon.ico|favicon.svg|manifest.webmanifest|sw.js).*)',
  ],
};
