import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, CheckCircle2 } from 'lucide-react';
import { FacilityDetail } from './types';

export interface FacilityDetailModalProps {
  facility: FacilityDetail | null;
  onClose: () => void;
}

export function FacilityDetailModal({ facility, onClose }: FacilityDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (facility) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [facility, onClose]);

  if (!facility) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-gelap/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-netral-border p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup jendela SOP"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-netral-canvas hover:bg-netral-surface text-gelap flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primer-light text-primer">
            {facility.badge}
          </span>
          <span className="text-xs text-gelap/60 font-medium">Standar Operasional Prosedur</span>
        </div>

        <h2
          id="facility-modal-title"
          className="text-xl sm:text-2xl font-extrabold text-gelap font-heading tracking-tight pr-10"
        >
          {facility.title}
        </h2>

        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden my-4 border border-netral-border/80">
          <Image
            src={facility.image}
            alt={facility.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>

        <p className="text-xs sm:text-sm text-gelap/85 font-body leading-relaxed mb-6">
          {facility.summary}
        </p>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-gelap uppercase tracking-wider mb-3">
            Tahapan SOP Pengawasan Fisik
          </h3>
          <div className="space-y-2.5">
            {facility.sopSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-netral-canvas border border-netral-border/70 flex items-start gap-2.5 text-xs text-gelap/90 leading-relaxed font-body"
              >
                <CheckCircle2 className="w-4 h-4 text-primer shrink-0 mt-0.5" aria-hidden="true" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gelap uppercase tracking-wider mb-3">
            Spesifikasi Teknis Fasilitas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {facility.specs.map((spec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-netral-border text-center"
              >
                <div className="text-[10px] text-gelap/60 font-bold uppercase tracking-wider">
                  {spec.label}
                </div>
                <div className="text-xs font-extrabold text-primer mt-1 font-heading">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-netral-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-primer text-white hover:bg-primer-hover font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer focus-visible:ring-offset-2 min-h-[44px]"
          >
            Selesai Memeriksa
          </button>
        </div>
      </div>
    </div>
  );
}
