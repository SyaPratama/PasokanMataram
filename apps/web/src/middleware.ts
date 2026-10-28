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

const isSandboxMode =
  (request.cookies.get('pasok_sandbox_mode')?.value === 'true' ||
    request.nextUrl.searchParams.get('sandbox') === 'true') &&
  process.env.NODE_ENV !== 'production';
  if (isSandboxMode) {
    const personaCookie = request.cookies.get('pasok_sandbox_persona')?.value;
    const personaParam = request.nextUrl.searchParams.get('persona');
    const activePersona = personaParam || personaCookie;

    let resolvedMacro: MacroRole = 'HOREKA';
    let resolvedMicro: MicroRole = 'HEAD_CHEF';

    if (pathname.startsWith('/hub')) {
      resolvedMacro = 'HUB_OPERATOR';
      resolvedMicro = 'OPERATOR_QC';
    } else if (pathname.startsWith('/supplier') || pathname.startsWith('/farmer')) {
      resolvedMacro = 'GAPOKTAN';
      resolvedMicro = 'CHAIRPERSON';
    } else if (pathname.startsWith('/admin')) {
      resolvedMacro = 'SUPER_ADMIN';
      resolvedMicro = 'SUPER_ADMIN';
    } else if (pathname.startsWith('/buyer') || pathname.startsWith('/horeka')) {
      resolvedMacro = 'HOREKA';
      resolvedMicro = 'HEAD_CHEF';
    } else if (activePersona === 'HUB') {
      resolvedMacro = 'HUB_OPERATOR';
      resolvedMicro = 'OPERATOR_QC';
    } else if (activePersona === 'SUPPLIER') {
      resolvedMacro = 'GAPOKTAN';
      resolvedMicro = 'CHAIRPERSON';
    } else if (activePersona === 'ADMIN') {
      resolvedMacro = 'SUPER_ADMIN';
      resolvedMicro = 'SUPER_ADMIN';
    }

    claims = {
      userId: 'usr_sandbox_tester' as UserId,
      tenantId: 'tnt_sandbox_tenant' as TenantId,
      macroRole: resolvedMacro,
      microRole: resolvedMicro,
      isSuperAdmin: resolvedMacro === 'SUPER_ADMIN',
      email: 'sandbox@pasokmataram.id',
    };
  } else if (!claims && process.env.NODE_ENV !== 'production') {
    const roleCookie = request.cookies.get('pasok_session_role')?.value;
    const macroCookie = request.cookies.get('pasok_macro_role')?.value;
    if (roleCookie || macroCookie) {
      const resolvedMacro = (macroCookie || (pathname.startsWith('/hub') ? 'HUB_OPERATOR' : pathname.startsWith('/farmer') || pathname.startsWith('/supplier') ? 'GAPOKTAN' : pathname.startsWith('/admin') ? 'SUPER_ADMIN' : 'HOREKA')) as MacroRole;
      const resolvedMicro = (roleCookie || (resolvedMacro === 'HOREKA' ? 'HEAD_CHEF' : resolvedMacro === 'GAPOKTAN' ? 'CHAIRPERSON' : resolvedMacro === 'HUB_OPERATOR' ? 'OPERATOR_QC' : 'SUPER_ADMIN')) as MicroRole;
      claims = {
        userId: 'usr_mock_demo' as UserId,
        tenantId: 'tenant_mock_demo' as TenantId,
        macroRole: resolvedMacro,
        microRole: resolvedMicro,
        isSuperAdmin: resolvedMacro === 'SUPER_ADMIN',
        email: 'demo@pasokmataram.id',
      };
    }
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

  if (isProtectedPath) {
    if (!claims) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAllowed = isRouteAllowedForRole(pathname, claims.macroRole, claims.microRole);
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
