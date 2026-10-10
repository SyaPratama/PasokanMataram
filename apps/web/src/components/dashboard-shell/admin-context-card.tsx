import * as React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';

/**
 * Properti untuk kartu konteks otoritas konsorsium pengawas platform.
 */
export interface AdminContextCardProps {
  /** Nama otoritas pengawas platform */
  readonly authorityName?: string;
  /** Wilayah yurisdiksi pengawasan */
  readonly jurisdiction?: string;
  /** Label status tata kelola aktif */
  readonly governanceMode?: string;
}

/**
 * Komponen modular kartu konteks konsorsium pengawas untuk portal admin.
 * Menampilkan nama konsorsium, wilayah pengawasan 5 kabupaten/kota, dan status audit RLS.
 */
export function AdminContextCard({
  authorityName = 'Konsorsium PasokMataram',
  jurisdiction = '5 Kabupaten/Kota DIY',
  governanceMode = 'Audit KYB & Kliring Aktif',
}: AdminContextCardProps) {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-semibold text-gelap/85 uppercase tracking-wider px-1">
        Otoritas Tata Kelola:
      </div>
      <div className="bg-white p-3 rounded-xl border border-netral-border/80 shadow-2xs space-y-1.5">
        <div className="text-xs font-bold text-gelap leading-snug font-heading truncate" title={authorityName}>
          {authorityName}
        </div>
        <div className="text-[11px] text-gelap/85 flex items-center font-medium">
          <Scale className="w-3.5 h-3.5 mr-1 text-sekunder flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{jurisdiction}</span>
        </div>
        <div className="pt-1.5 border-t border-netral-border/60 flex items-center justify-between gap-2">
          <span className="text-[10px] text-gelap/85 font-medium">Pengawasan:</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primer px-2 py-0.5 rounded-full bg-primer-light border border-primer/20">
            <ShieldCheck className="w-3 h-3 text-primer shrink-0" aria-hidden="true" />
            <span>{governanceMode}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
