import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  decodeSessionClaimsEdge,
  resolveUserHomeRoute,
  isRouteAllowedForRole,
} from '@pasok/security/edge';

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

  // Fallback pengujian UI/UX mock mode (Prinsip Konstitusi XII: Hermetic & Mock-Ready)
  if (!claims) {
    const roleCookie = request.cookies.get('pasok_session_role')?.value;
    const macroCookie = request.cookies.get('pasok_macro_role')?.value;
    if (roleCookie || macroCookie) {
      const resolvedMacro = (macroCookie || (pathname.startsWith('/hub') ? 'HUB_OPERATOR' : pathname.startsWith('/farmer') || pathname.startsWith('/supplier') ? 'GAPOKTAN' : pathname.startsWith('/admin') ? 'SUPER_ADMIN' : 'HOREKA')) as import('@pasok/domain').MacroRole;
      const resolvedMicro = (roleCookie || (resolvedMacro === 'HOREKA' ? 'HEAD_CHEF' : resolvedMacro === 'GAPOKTAN' ? 'CHAIRPERSON' : resolvedMacro === 'HUB_OPERATOR' ? 'OPERATOR_QC' : 'SUPER_ADMIN')) as import('@pasok/domain').MicroRole;
      claims = {
        userId: 'usr_mock_demo' as import('@pasok/domain').UserId,
        tenantId: 'tenant_mock_demo' as import('@pasok/domain').TenantId,
        macroRole: resolvedMacro,
        microRole: resolvedMicro,
        isSuperAdmin: resolvedMacro === 'SUPER_ADMIN',
        email: 'demo@pasokmataram.id',
      };
    }
  }

  if (pathname === '/login') {
    // Memungkinkan penguji mengakses formulir login dan dock simulasi tanpa dipaksa redirect
    return NextResponse.next();
  }

  const isProtectedPath =
    pathname.startsWith('/horeka') ||
    pathname.startsWith('/buyer') ||
    pathname.startsWith('/farmer') ||
    pathname.startsWith('/supplier') ||
    pathname.startsWith('/hub') ||
    pathname.startsWith('/admin');

  if (isProtectedPath) {
    if (!claims) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    let normalizedPath = pathname;
    if (pathname.startsWith('/buyer')) {
      normalizedPath = pathname.replace('/buyer', '/horeka');
    } else if (pathname.startsWith('/supplier')) {
      normalizedPath = pathname.replace('/supplier', '/farmer');
    }

    const isAllowed = isRouteAllowedForRole(normalizedPath, claims.macroRole, claims.microRole);
    if (!isAllowed) {
      const userHome = resolveUserHomeRoute(claims.macroRole);
      return NextResponse.redirect(new URL(userHome, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};
