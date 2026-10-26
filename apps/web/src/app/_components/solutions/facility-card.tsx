import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { FacilityDetail } from './types';

export interface FacilityCardProps {
  facility: FacilityDetail;
  index: number;
  onSelect: (facility: FacilityDetail) => void;
}

export function FacilityCard({ facility, index, onSelect }: FacilityCardProps) {
  const getFacilityIcon = (id: string) => {
    switch (id) {
      case 'transit-hub':
        return <ShieldCheck className="w-5 h-5 text-primer" aria-hidden="true" />;
      case 'qc-lab':
        return <Scale className="w-5 h-5 text-primer" aria-hidden="true" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-primer" aria-hidden="true" />;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      onClick={() => onSelect(facility)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(facility);
        }
      }}
      className="group text-left p-5 sm:p-6 rounded-3xl bg-white border border-netral-border/80 hover:border-primer/40 transition-all duration-300 shadow-xs hover:shadow-lg flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer focus-visible:ring-offset-2"
    >
      <div>
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-netral-canvas border border-netral-border/60">
          <Image
            src={facility.image}
            alt={facility.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-white border border-netral-border/80 px-2.5 py-1 rounded-full text-[11px] font-bold text-primer flex items-center gap-1.5 shadow-xs">
            {getFacilityIcon(facility.id)}
            <span>{facility.badge}</span>
          </div>
        </div>

        <h3 className="font-heading font-extrabold text-base sm:text-lg text-gelap group-hover:text-primer transition-colors tracking-tight leading-snug">
          {facility.title}
        </h3>

        <p className="mt-2 text-xs text-gelap/85 font-body leading-relaxed line-clamp-3">
          {facility.summary}
        </p>
      </div>
      <div className="mt-5 pt-2 flex items-center justify-between text-xs font-semibold text-primer group-hover:text-primer-hover transition-colors">
        <span>Periksa SOP Inspeksi</span>
        <div className="w-7 h-7 rounded-full bg-primer-light/80 group-hover:bg-primer group-hover:text-white flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
