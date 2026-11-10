/**
 * @file apps/web/src/types/models.ts
 * @description Domain model interfaces for UI components without mock dependencies.
 */

import type { DIYRegency } from '@pasok/domain';

export interface Outlet {
  id: string;
  name: string;
  isMain?: boolean;
  isPrimary?: boolean;
  regency: DIYRegency | string;
  streetAddress: string;
  contactPerson?: string;
  phone?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  activeOrdersCount?: number;
}
export type MockOutlet = Outlet;

export interface TenantKyb {
  id: string;
  businessName: string;
  tenantType: 'HOREKA' | 'GAPOKTAN' | string;
  regency: string;
  address: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  picName: string;
  picPhone: string;
  picEmail: string;
  nibNumber?: string;
  groupCertificateNumber?: string;
  documents: {
    type: string;
    filename: string;
    uploadedAt: string;
  }[];
}
export type MockTenantKyb = TenantKyb;

export interface StandingOrder {
  id: string;
  commodityName: string;
  outletName: string;
  quantityKg: number;
  unitPriceRp: number;
  totalRp?: number;
  deliveryWindow: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'SIAP_KIRIM' | string;
  driverName?: string;
}
export type MockStandingOrder = StandingOrder;

export interface HarvestCommitment {
  id: string;
  commodityName: string;
  variety?: string;
  estimatedHarvestDate?: string;
  totalYieldKg: number;
  allocatedQuotaKg: number;
  dropPointHub?: string;
  status: 'TERKUNCI' | 'SIAP_SERAH' | 'ALLOCATED' | 'VERIFIED' | 'PENDING' | string;
}
export type MockHarvestCommitment = HarvestCommitment;

export interface CommodityItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly pricePerKg: number;
  readonly originRegion: string;
  readonly harvestSeason: string;
  readonly stockAvailableKg: number;
}
export type MockCommodity = CommodityItem;
