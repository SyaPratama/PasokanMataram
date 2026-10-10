import * as React from 'react';
import type { DIYRegency } from '../../types/tenant';
import { MapPin } from 'lucide-react';

interface GeoRegencyTagProps {
  regency: DIYRegency;
  className?: string;
}

const REGENCY_LABELS: Record<DIYRegency, string> = {
  SLEMAN: 'Kab. Sleman',
  BANTUL: 'Kab. Bantul',
  KULON_PROGO: 'Kab. Kulon Progo',
  GUNUNGKIDUL: 'Kab. Gunungkidul',
  KOTA_YOGYAKARTA: 'Kota Yogyakarta',
};

export function GeoRegencyTag({ regency, className = '' }: GeoRegencyTagProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium text-gelap/80 bg-netral/30 px-2 py-0.5 rounded border border-netral-border/50 ${className}`}
    >
      <MapPin className="w-3 h-3 mr-1 text-sekunder" aria-hidden="true" />
      {REGENCY_LABELS[regency] || regency}
    </span>
  );
}
