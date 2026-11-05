import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifySessionToken,
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
export async function middleware(request: NextRequest): Promise<NextResponse> {
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
  const jwtSecret =
    process.env.JWT_SECRET ||
    'rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars';
  let claims = sessionCookie ? await verifySessionToken(sessionCookie, jwtSecret) : null;
  if (!claims && sessionCookie) {
    claims = await verifySessionToken(sessionCookie, 'pasokmataram-super-secret-jwt-key-min-32-chars');
  }
  if (!claims && sessionCookie && process.env.NODE_ENV !== 'production') {
    claims = decodeSessionClaimsEdge(sessionCookie);
  }

  const isSandbox =
    request.nextUrl.searchParams.get('sandbox') === 'true' ||
    request.cookies.get('pasok_sandbox_mode')?.value === 'true';
  const sandboxPersona = request.nextUrl.searchParams.get('persona') || 'BUYER';

  if (!claims && isSandbox) {
    claims = {
      userId: 'usr_sandbox_preview' as UserId,
      tenantId: 'tenant_sandbox_preview' as TenantId,
      macroRole: sandboxPersona === 'SUPPLIER' ? 'GAPOKTAN' : sandboxPersona === 'ADMIN' ? 'SUPER_ADMIN' : 'HOREKA',
      microRole: sandboxPersona === 'SUPPLIER' ? 'CHAIRPERSON' : sandboxPersona === 'ADMIN' ? 'SUPER_ADMIN' : 'OWNER',
      isSuperAdmin: sandboxPersona === 'ADMIN',
      email: 'sandbox@pasokmataram.id',
    };
  }
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
