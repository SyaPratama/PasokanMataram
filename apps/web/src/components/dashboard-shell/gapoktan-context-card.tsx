import * as React from 'react';
import { MapPin } from 'lucide-react';
import { StatusBadge } from '../shared/status-badge';
import type { KybStatus } from '../../types/tenant';

/**
 * Properti untuk kartu konteks informasi kelompok tani mitra Gapoktan.
 */
export interface GapoktanContextCardProps {
  /** Nama badan kelompok tani mitra */
  readonly gapoktanName?: string;
  /** Lokasi kapanewon dan kabupaten */
  readonly location?: string;
  /** Status legalitas kyb resmi */
  readonly status?: KybStatus;
}

/**
 * Komponen modular kartu konteks kemitraan Gapoktan untuk portal supplier.
 * Menampilkan nama kelompok tani, lokasi sentra binaan, dan status legalitas.
 */
export function GapoktanContextCard({
  gapoktanName = 'Gapoktan Srikayangan Makmur',
  location = 'Panjatan, Kulon Progo',
  status = 'VERIFIED',
}: GapoktanContextCardProps) {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-semibold text-gelap/85 uppercase tracking-wider px-1">
        Kelompok Tani Mitra:
      </div>
      <div className="bg-white p-3 rounded-xl border border-netral-border/80 shadow-2xs space-y-1.5">
        <div className="text-xs font-bold text-gelap leading-snug font-heading truncate" title={gapoktanName}>
          {gapoktanName}
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
