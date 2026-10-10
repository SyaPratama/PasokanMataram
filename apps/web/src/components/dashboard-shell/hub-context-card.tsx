import * as React from 'react';
import { MapPin, ShieldCheck, Scale } from 'lucide-react';

/**
 * Properti untuk kartu konteks stasiun hub logistik cross-docking.
 */
export interface HubContextCardProps {
  /** Nama fasilitas hub fisik */
  readonly hubName?: string;
  /** Lokasi kapanewon dan kabupaten fasilitas */
  readonly location?: string;
  /** Kode identitas fasilitas hub */
  readonly facilityCode?: string;
  /** Status operasional stasiun kontrol mutu */
  readonly qcStationStatus?: string;
}

/**
 * Komponen modular kartu konteks hub logistik untuk portal operator cross-dock.
 * Menampilkan nama hub, lokasi fasilitas, dan kesiapan stasiun sortir serta timbangan tera.
 */
export function HubContextCard({
  hubName = 'Hub Transit Sentral Bantul',
  location = 'Sewon, Bantul (hub-bantul-01)',
  facilityCode = 'HUB-BTL-01',
  qcStationStatus = 'QC & Tera Aktif',
}: HubContextCardProps) {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-semibold text-gelap/85 uppercase tracking-wider px-1">
        Fasilitas Logistik Aktif:
      </div>
      <div className="bg-white p-3 rounded-xl border border-netral-border/80 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-gelap leading-snug font-heading truncate" title={hubName}>
            {hubName}
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-netral-canvas text-gelap border border-netral-border shrink-0">
            {facilityCode}
          </span>
        </div>
        <div className="text-[11px] text-gelap/85 flex items-center font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1 text-sekunder flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </div>
        <div className="pt-1.5 border-t border-netral-border/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-gelap/85 font-medium">
            <Scale className="w-3 h-3 text-sekunder" aria-hidden="true" />
            <span>Timbangan Tera</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primer px-2 py-0.5 rounded-full bg-primer-light border border-primer/20">
            <ShieldCheck className="w-3 h-3 text-primer shrink-0" aria-hidden="true" />
            <span>{qcStationStatus}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
