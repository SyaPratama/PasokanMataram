import type { MacroRole, MicroRole, TenantId, UserId, HubId } from '@pasok/domain';

/**
 * Klaim token sesi JWT pengguna terautentikasi.
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
 * Mendekode klaim token JWT secara native di Edge Middleware tanpa dependensi eksternal.
 * Mematuhi prinsip Ponytail (Native Web API first).
 * @param token String JWT.
 * @returns UserSessionClaims jika format valid, null jika rusak.
 */
export function decodeSessionClaimsEdge(token: string): UserSessionClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decodedText = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(decodedText);
    if (typeof parsed === 'object' && parsed !== null && 'userId' in parsed && 'macroRole' in parsed) {
      return parsed as UserSessionClaims;
    }
    return null;
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
