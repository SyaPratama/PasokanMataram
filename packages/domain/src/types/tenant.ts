/**
 * Branded Types, domain enums, and entity invariants for authentication, multi-tenancy, and KYB onboarding.
 * Complies with Constitution Principle II, III, and XIII (Strict Branded Types, zero any, formal JSDoc only).
 */

export type TenantId = string & { readonly __brand: unique symbol };
export type UserId = string & { readonly __brand: unique symbol };
export type KybDocumentId = string & { readonly __brand: unique symbol };
export type OutletId = string & { readonly __brand: unique symbol };
export type HubId = string & { readonly __brand: unique symbol };
export type OperatorId = string & { readonly __brand: unique symbol };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HUB_ID_REGEX = /^[a-z0-9_-]{3,50}$/i;

/**
 * Validates and casts an unknown string to a TenantId branded type.
 * @param value The candidate UUID string.
 * @returns Validated TenantId.
 * @throws TypeError when format is invalid.
 */
export function asTenantId(value: string): TenantId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk TenantId`);
  }
  return value as TenantId;
}

/**
 * Validates and casts an unknown string to a UserId branded type.
 * @param value The candidate UUID string.
 * @returns Validated UserId.
 * @throws TypeError when format is invalid.
 */
export function asUserId(value: string): UserId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk UserId`);
  }
  return value as UserId;
}

/**
 * Validates and casts an unknown string to a KybDocumentId branded type.
 * @param value The candidate UUID string.
 * @returns Validated KybDocumentId.
 * @throws TypeError when format is invalid.
 */
export function asKybDocumentId(value: string): KybDocumentId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk KybDocumentId`);
  }
  return value as KybDocumentId;
}

/**
 * Validates and casts an unknown string to an OutletId branded type.
 * @param value The candidate UUID string.
 * @returns Validated OutletId.
 * @throws TypeError when format is invalid.
 */
export function asOutletId(value: string): OutletId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk OutletId`);
  }
  return value as OutletId;
}

/**
 * Validates and casts a facility string identifier to a HubId branded type.
 * @param value The candidate identifier string (e.g. hub-bantul-01).
 * @returns Validated HubId.
 * @throws TypeError when format is invalid.
 */
export function asHubId(value: string): HubId {
  if (!HUB_ID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format ID fasilitas logistik yang valid untuk HubId`);
  }
  return value as HubId;
}

/**
 * Validates and casts an unknown string to an OperatorId branded type.
 * @param value The candidate UUID string.
 * @returns Validated OperatorId.
 * @throws TypeError when format is invalid.
 */
export function asOperatorId(value: string): OperatorId {
  if (!UUID_REGEX.test(value)) {
    throw new TypeError(`Nilai "${value}" bukan format UUID yang valid untuk OperatorId`);
  }
  return value as OperatorId;
}

/**
 * Macro-Role entitas bisnis (Tipe Tenant Utama).
 */
export type MacroRole = 'HOREKA' | 'GAPOKTAN' | 'HUB_OPERATOR' | 'SUPER_ADMIN';

/**
 * Micro-Role pengguna individual (Wewenang RBAC).
 */
export type MicroRole =
  | 'OWNER'
  | 'FINANCE'
  | 'HEAD_CHEF'
  | 'PURCHASING'
  | 'CHAIRPERSON'
  | 'FIELD_OPERATOR'
  | 'OPERATOR_QC'
  | 'SUPERVISOR_HUB'
  | 'SUPER_ADMIN';

/**
 * Kompatibilitas mundur tipe tenant legacy.
 */
export type TenantType = 'HOREKA_BUYER' | 'GAPOKTAN_SUPPLIER' | 'HOREKA' | 'GAPOKTAN' | 'HUB_OPERATOR' | 'SUPER_ADMIN';
export type KybStatus = 'UNVERIFIED' | 'KYB_PENDING' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'PROCUREMENT_MANAGER' | 'KITCHEN_STAFF' | MicroRole;
export type DocumentType = 'NIB' | 'KTP' | 'SURAT_KETERANGAN_TANI' | 'NPWP';
export type DIYRegency = 'SLEMAN' | 'BANTUL' | 'KULON_PROGO' | 'GUNUNGKIDUL' | 'KOTA_YOGYAKARTA';
export type OperatorStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'REVOKED';

/**
 * Type guard untuk memeriksa apakah nilai tertentu merupakan MacroRole sah.
 * @param value Nilai candidate yang diperiksa.
 * @returns True jika merupakan MacroRole valid.
 */
export function isMacroRole(value: unknown): value is MacroRole {
  return typeof value === 'string' && ['HOREKA', 'GAPOKTAN', 'HUB_OPERATOR', 'SUPER_ADMIN'].includes(value);
}

/**
 * Type guard untuk memeriksa apakah nilai tertentu merupakan MicroRole sah.
 * @param value Nilai candidate yang diperiksa.
 * @returns True jika merupakan MicroRole valid.
 */
export function isMicroRole(value: unknown): value is MicroRole {
  return (
    typeof value === 'string' &&
    [
      'OWNER',
      'FINANCE',
      'HEAD_CHEF',
      'PURCHASING',
      'CHAIRPERSON',
      'FIELD_OPERATOR',
      'OPERATOR_QC',
      'SUPERVISOR_HUB',
      'SUPER_ADMIN',
    ].includes(value)
  );
}

export interface Tenant {
  readonly id: TenantId;
  readonly businessName: string;
  readonly tenantType: TenantType;
  readonly macroRole?: MacroRole;
  readonly regency: DIYRegency;
  readonly kybStatus: KybStatus;
  readonly rejectionReason: string | null;
  readonly verifiedAt: Date | null;
  readonly verifiedBy: UserId | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface User {
  readonly id: UserId;
  readonly tenantId: TenantId;
  readonly email: string;
  readonly passwordHash: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly role: UserRole;
  readonly microRole?: MicroRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
}

export interface KybDocument {
  readonly id: KybDocumentId;
  readonly tenantId: TenantId;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
  readonly fileStorageKey: string;
  readonly fileMimeType: string;
  readonly fileSizeBytes: number;
  readonly status: KybStatus;
  readonly rejectionNote: string | null;
  readonly uploadedAt: Date;
}

export interface BusinessOutlet {
  readonly id: OutletId;
  readonly tenantId: TenantId;
  readonly outletName: string;
  readonly streetAddress: string;
  readonly regency: DIYRegency;
  readonly district: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly contactPerson: string;
  readonly contactPhone: string;
  readonly isMainOutlet: boolean;
  readonly createdAt: Date;
}

export interface CrossDockHub {
  readonly id: HubId;
  readonly name: string;
  readonly regency: DIYRegency;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly isActive: boolean;
}

export interface HubOperator {
  readonly id: OperatorId;
  readonly userId: UserId;
  readonly assignedHubId: HubId;
  readonly microRole: 'OPERATOR_QC' | 'SUPERVISOR_HUB';
  readonly status: OperatorStatus;
  readonly activationTokenHash: string | null;
  readonly tokenExpiresAt: Date | null;
  readonly issuedByAdminId: UserId;
  readonly createdAt: Date;
}

export interface RolePermission {
  readonly microRole: MicroRole;
  readonly canAccessFinancials: boolean;
  readonly canManageTeam: boolean;
  readonly canAccessKitchenCOGS: boolean;
  readonly canRequestPoolAllocation: boolean;
  readonly canOperateQcHub: boolean;
  readonly canAuthorizeVariance: boolean;
}
