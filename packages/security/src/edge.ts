import * as jose from 'jose';
import { asHubId, asTenantId, asUserId, isMacroRole, isMicroRole, type MacroRole, type MicroRole, type TenantId, type UserId, type HubId } from '@pasok/domain';

type SessionClaimsCandidate = Record<string, unknown>;

/**
 * Validated session claims candidate.
 */
export interface UserSessionClaims {
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly macroRole: MacroRole;
  readonly microRole: MicroRole;
  readonly assignedHubId?: HubId;
  readonly isSuperAdmin: boolean;
  readonly email: string;
}

/**
 * Verifies a signed session token and validates every required claim.
 * @param token Signed JWT.
 * @param secret Required HMAC secret.
 * @returns Validated session claims or null.
 */
export async function verifySessionToken(token: string, secret: string): Promise<UserSessionClaims | null> {
  if (!secret) return null;
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey, { algorithms: ['HS256'] });
    const candidate = payload as SessionClaimsCandidate;
    if (
      typeof candidate.userId !== 'string' ||
      typeof candidate.tenantId !== 'string' ||
      !isMacroRole(candidate.macroRole) ||
      !isMicroRole(candidate.microRole) ||
      typeof candidate.isSuperAdmin !== 'boolean' ||
      typeof candidate.email !== 'string'
    ) {
      return null;
    }
    return {
      userId: asUserId(candidate.userId),
      tenantId: asTenantId(candidate.tenantId),
      macroRole: candidate.macroRole,
      microRole: candidate.microRole,
      assignedHubId: typeof candidate.assignedHubId === 'string' ? asHubId(candidate.assignedHubId) : undefined,
      isSuperAdmin: candidate.isSuperAdmin,
      email: candidate.email,
    };
  } catch {
    return null;
  }
}


/**
 * Memeriksa apakah suatu Micro-Role diizinkan melihat saldo escrow, mutasi bank, dan transaksi finansial.
 * Head Chef dan staf dapur DILARANG mengakses metrik keuangan.
 * @param microRole Peran mikro pengguna.
 */
export function canAccessFinancials(microRole: MicroRole): boolean {
  return microRole === 'OWNER' || microRole === 'FINANCE' || microRole === 'CHAIRPERSON' || microRole === 'SUPER_ADMIN';
}

/**
 * Memeriksa apakah pengguna berwenang mengelola resep dan kalkulator COGS dapur.
 * @param microRole Peran mikro pengguna.
 */
export function canAccessKitchenCOGS(microRole: MicroRole): boolean {
  return (
    microRole === 'HEAD_CHEF' ||
    microRole === 'PURCHASING' ||
    microRole === 'OWNER' ||
    microRole === 'FINANCE'
  );
}

/**
 * Memeriksa apakah pengguna berwenang mengajukan alokasi kuota pool pengadaan komoditas.
 * @param microRole Peran mikro pengguna.
 */
export function canRequestPoolAllocation(microRole: MicroRole): boolean {
  return (
    microRole === 'HEAD_CHEF' ||
    microRole === 'PURCHASING' ||
    microRole === 'OWNER' ||
    microRole === 'FINANCE'
  );
}

/**
 * Memeriksa apakah pengguna berwenang melakukan inspeksi QC fisik dan timbangan di hub logistik.
 * @param microRole Peran mikro pengguna.
 */
export function canOperateQcHub(microRole: MicroRole): boolean {
  return microRole === 'OPERATOR_QC' || microRole === 'SUPERVISOR_HUB' || microRole === 'SUPER_ADMIN';
}

/**
 * Memeriksa apakah pengguna berwenang mengotorisasi selisih timbangan >5% atau reject truk panen.
 * @param microRole Peran mikro pengguna.
 */
export function canAuthorizeVariance(microRole: MicroRole): boolean {
  return microRole === 'SUPERVISOR_HUB' || microRole === 'SUPER_ADMIN';
}

/**
 * Menentukan rute beranda bawaan berdasarkan Macro-Role entitas bisnis.
 * @param macroRole Peran makro entitas bisnis.
 */
export function resolveUserHomeRoute(macroRole: MacroRole): string {
  switch (macroRole) {
    case 'HOREKA':
      return '/buyer/dashboard';
    case 'GAPOKTAN':
      return '/supplier/dashboard';
    case 'HUB_OPERATOR':
      return '/hub/inbound';
    case 'SUPER_ADMIN':
      return '/admin/tenants';
    default:
      return '/login';
  }
}

/**
 * Memverifikasi apakah rute tertentu diizinkan untuk diakses oleh Macro-Role dan Micro-Role pengguna.
 * @param pathname Jalur rute web Next.js.
 * @param macroRole Peran makro entitas tenant.
 * @param microRole Peran mikro pengguna.
 */
export function isRouteAllowedForRole(pathname: string, macroRole: MacroRole, microRole: MicroRole): boolean {
  if (macroRole === 'SUPER_ADMIN' || microRole === 'SUPER_ADMIN') {
    return true;
  }

  if (pathname.startsWith('/admin')) {
    return false;
  }

  if (pathname.startsWith('/hub') && macroRole !== 'HUB_OPERATOR') {
    return false;
  }

  if ((pathname.startsWith('/farmer') || pathname.startsWith('/supplier')) && macroRole !== 'GAPOKTAN') {
    return false;
  }

  if ((pathname.startsWith('/horeka') || pathname.startsWith('/buyer')) && macroRole !== 'HOREKA') {
    return false;
  }

  if (pathname.startsWith('/horeka/finance') && !canAccessFinancials(microRole)) {
    return false;
  }

  return true;
}
