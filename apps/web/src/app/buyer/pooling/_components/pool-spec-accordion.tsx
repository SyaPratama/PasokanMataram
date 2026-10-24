/**
 * @file apps/web/src/app/buyer/pooling/_components/pool-spec-accordion.tsx
 * @description Accordion component for commodity quality specifications and SNI cold chain standards.
 * Complies with strict design tokens, zero arbitrary hex, zero emoji, and WCAG 2.1 AA tap targets.
 */

'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Thermometer, Scale, FileText } from 'lucide-react';

export interface CommoditySpecProps {
  commodityName: string;
  grade: string;
  moistureContent: string;
  storageZone: string;
  targetTemp: string;
  allowedShrinkage: string;
  certifications: string[];
}

/**
 * Komponen akordeon spesifikasi mutu fisik dan kepatuhan rantai dingin komoditas.
 * @param props Rincian spesifikasi komoditas.
 */
export function PoolSpecAccordion({
  commodityName,
  grade,
  moistureContent,
  storageZone,
  targetTemp,
  allowedShrinkage,
  certifications,
}: CommoditySpecProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  return (
    <div className="border-2 border-netral-border/80 rounded-2xl overflow-hidden bg-netral-canvas/40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 min-h-[48px] flex items-center justify-between text-left hover:bg-netral-border/20 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/40 focus-visible:ring-offset-2"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-primer shrink-0" />
          <span className="text-sm sm:text-base font-bold text-gelap">
            Spesifikasi Mutu &amp; Toleransi SNI: {commodityName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-gelap">
          <span>{isOpen ? 'Tutup Rincian' : 'Lihat Rincian Mutu'}</span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-primer" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gelap-muted" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 space-y-4 border-t-2 border-netral-border/60 text-sm text-gelap">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-netral-border/80 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-gelap font-bold">
                <FileText className="w-5 h-5 text-primer" />
                <span>Kualitas &amp; Mutu Fisik</span>
              </div>
              <p className="font-bold text-base text-gelap">Grade {grade}</p>
              <p className="text-xs font-medium text-gelap-muted">Kadar air maksimal: {moistureContent}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-netral-border/80 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-gelap font-bold">
                <Thermometer className="w-5 h-5 text-sekunder" />
                <span>Standar Suhu Simpan</span>
              </div>
              <p className="font-bold text-base text-gelap">{storageZone}</p>
              <p className="text-xs font-medium text-gelap-muted">Suhu aman terjaga: {targetTemp}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-netral-border/80 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-gelap font-bold">
                <Scale className="w-5 h-5 text-aksen" />
                <span>Timbangan Resmi Hub</span>
              </div>
              <p className="font-bold text-base text-gelap">Batas Susut: {allowedShrinkage}</p>
              <p className="text-xs font-medium text-gelap-muted">Kompensasi dana otomatis jika susut berlebih</p>
            </div>
          </div>

          {certifications.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-gelap">Sertifikasi Resmi:</span>
              {certifications.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-full bg-primer-light text-primer text-xs font-bold"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
