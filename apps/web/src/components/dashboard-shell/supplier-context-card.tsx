import * as React from 'react';
import { MapPin } from 'lucide-react';
import { StatusBadge } from '../shared/status-badge';
import type { KybStatus } from '../../types/tenant';

/**
 * Properti untuk kartu konteks informasi mitra pemasok pangan.
 */
export interface SupplierContextCardProps {
  /** Nama badan usaha atau kelompok pemasok mitra */
  readonly supplierName?: string;
  readonly gapoktanName?: string;
  /** Lokasi kapanewon dan kabupaten */
  readonly location?: string;
  /** Status legalitas kyb resmi */
  readonly status?: KybStatus;
}

/**
 * Komponen modular kartu konteks kemitraan pemasok untuk portal supplier.
 * Menampilkan nama badan usaha pemasok, lokasi sentra, dan status legalitas.
 */
export function SupplierContextCard({
  supplierName,
  gapoktanName,
  location = 'Panjatan, Kulon Progo',
  status = 'VERIFIED',
}: SupplierContextCardProps) {
  const displayName = supplierName || gapoktanName || 'Sentra Supplier Sleman';

  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-semibold text-gelap/85 uppercase tracking-wider px-1">
        Mitra Pemasok Pangan:
      </div>
      <div className="bg-white p-3 rounded-xl border border-netral-border/80 shadow-2xs space-y-1.5">
        <div className="text-xs font-bold text-gelap leading-snug font-heading truncate" title={displayName}>
          {displayName}
        </div>
        <div className="text-[11px] text-gelap/85 flex items-center font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1 text-sekunder flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </div>
        <div className="pt-1.5 border-t border-netral-border/60 flex items-center justify-between gap-2">
          <span className="text-[10px] text-gelap/85 font-medium">Status Legalitas:</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

export const GapoktanContextCard = SupplierContextCard;
export type GapoktanContextCardProps = SupplierContextCardProps;
