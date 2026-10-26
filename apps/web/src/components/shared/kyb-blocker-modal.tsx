'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, FileText, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';

export interface KybBlockerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly actionAttempted?: string;
  readonly quotaKg?: number;
}

/**
 * Modal Pemblokir Kepatuhan Legalitas Progressive KYB Gating.
 * Ditampilkan saat akun berstatus KYB_PENDING mencoba transaksi kuota >50 kg atau penahanan dana escrow.
 * Mematuhi FR-008, US7, dan Konstitusi Prinsip XIII.
 */
export function KybBlockerModal({
  isOpen,
  onClose,
  actionAttempted = 'Alokasi Kuota Pool >50 kg',
  quotaKg,
}: KybBlockerModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kyb-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-netral-border relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gelap/50 hover:text-gelap hover:bg-netral-canvas transition-colors"
          aria-label="Tutup dialog verifikasi legalitas"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-aksen/15 text-aksen-dark border border-aksen/30 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>

        <h2 id="kyb-modal-title" className="text-lg font-bold font-heading text-gelap">
          Verifikasi Legalitas Usaha Diperlukan
        </h2>

        <p className="text-xs text-gelap/85 mt-2 leading-relaxed">
          Aktivitas memesan dan membeli pasokan dapur mewajibkan akun usaha terdaftar lengkap dengan identitas resmi (KTP Penanggung Jawab &amp; NIB / Izin Usaha). Verifikasi berkas dapat dilengkapi kapan saja melalui menu <strong>Legalitas &amp; KYB</strong> di dashboard.
        </p>

        <div className="my-4 p-3.5 rounded-2xl bg-netral-canvas/60 border border-netral-border/80 text-xs">
          <div className="font-semibold text-gelap flex items-center gap-2">
            <FileText className="w-4 h-4 text-primer" aria-hidden="true" />
            <span>Syarat Memesan &amp; Membeli:</span>
          </div>
          <p className="text-[11px] text-gelap/75 mt-1 leading-relaxed">
            Tindakan <span className="font-semibold text-gelap">{actionAttempted}</span>
            {quotaKg ? ` (${quotaKg} kg)` : ''} memerlukan validasi identitas resmi KTP penanggung jawab dan Nomor Induk Berusaha (NIB) sesuai regulasi kliring perbankan escrow pangan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
          <Link
            href="/buyer/legalitas"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primer text-white hover:bg-primer-dark text-xs font-bold transition-all shadow-xs min-h-[44px]"
          >
            <span>Buka Legalitas &amp; KYB</span>
            <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 text-xs font-semibold rounded-xl border-netral-border text-gelap hover:bg-netral-canvas"
          >
            Lanjutkan Eksplorasi
          </Button>
        </div>
      </div>
    </div>
  );
}
