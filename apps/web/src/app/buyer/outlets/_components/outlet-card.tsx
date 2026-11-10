import * as React from 'react';
import { Building2, Phone, UserCheck, Package, ExternalLink } from 'lucide-react';
import { GeoRegencyTag } from '../../../../components/shared/geo-regency-tag';
import type { Outlet as MockOutlet } from '../../../../types/models';
import type { DIYRegency } from '../../../../types/tenant';
const DIY_REGENCIES: readonly DIYRegency[] = ['SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA'];
function isDIYRegency(value: string): value is DIYRegency {
  return DIY_REGENCIES.some((regency) => regency === value);
}

interface OutletCardProps {
  outlet: MockOutlet;
  onSelect?: (outlet: MockOutlet) => void;
}

/**
 * Komponen kartu gerai cabang fisik HoReKa.
 * Menampilkan rincian gerai, penanda gerai utama, alamat, dan narahubung dapur.
 */
export function OutletCard({ outlet, onSelect }: OutletCardProps) {
  return (
    <div className="bg-white rounded-xl border border-netral-border/70 p-5 space-y-3.5 shadow-2xs hover:shadow-md transition-shadow relative flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className={`p-2 rounded-lg ${outlet.isMain ? 'bg-primer text-white' : 'bg-netral-canvas text-gelap/80 border border-netral-border'}`}>
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gelap truncate font-heading">
                {outlet.name}
              </h3>
              <div className="mt-1">
                {isDIYRegency(outlet.regency) ? <GeoRegencyTag regency={outlet.regency} /> : <span className="text-xs text-gelap/80">{outlet.regency}</span>}
              </div>
            </div>
          </div>
          {outlet.isMain && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer border border-primer/20 uppercase tracking-wider flex-shrink-0">
              Pusat
            </span>
          )}
        </div>

        <p className="text-xs text-gelap/70 line-clamp-2 pt-1">
          {outlet.streetAddress}
        </p>

        {(outlet.contactPerson || outlet.phone || (typeof outlet.latitude === 'number' && typeof outlet.longitude === 'number')) ? (
          <div className="pt-2.5 space-y-1.5 text-xs text-gelap/80 border-t border-netral-border/40">
            {outlet.contactPerson && (
              <div className="flex items-center text-[11px]">
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-sekunder flex-shrink-0" />
                <span className="font-semibold text-gelap truncate">{outlet.contactPerson}</span>
              </div>
            )}
            {outlet.phone && (
              <div className="flex items-center text-[11px] text-gelap/70">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-primer flex-shrink-0" />
                <span>{outlet.phone}</span>
              </div>
            )}
            {typeof outlet.latitude === 'number' && typeof outlet.longitude === 'number' && (
              <div className="text-[10px] text-gelap/50 pt-0.5 font-mono">
                Koordinat: {outlet.latitude.toFixed(4)}, {outlet.longitude.toFixed(4)}
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2.5 text-[11px] text-gelap/60 border-t border-netral-border/40">
            Detail narahubung belum tercatat
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-netral-border/60 flex items-center justify-between text-xs">
        <div className="flex items-center text-[11px] text-gelap/70">
          <Package className="w-3.5 h-3.5 mr-1 text-sekunder" />
          <span>{typeof outlet.activeOrdersCount === 'number' ? `${outlet.activeOrdersCount} PO tercatat` : 'Status PO belum tercatat'}</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect && onSelect(outlet)}
          className="inline-flex items-center font-semibold text-primer hover:text-primer-hover hover:underline text-xs"
        >
          Kelola Gerai <ExternalLink className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
}
