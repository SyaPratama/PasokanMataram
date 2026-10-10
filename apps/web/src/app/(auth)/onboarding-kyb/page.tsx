'use client';

import * as React from 'react';
import Link from 'next/link';
import { DocumentUploader } from './_components/document-uploader';
import { RemediationPanel } from './_components/remediation-panel';
import { StatusBadge } from '../../../components/shared/status-badge';
import { ShieldCheck, FileCheck, Clock, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';

/**
 * Halaman Alur Onboarding Legalitas KYB & Remediasi.
 * Mendukung simulasi peninjauan status PENDING_VERIFICATION maupun remediasi REJECTED.
 */
export default function OnboardingKybPage() {
  const [kybStatus, setKybStatus] = React.useState<'PENDING_VERIFICATION' | 'REJECTED'>('PENDING_VERIFICATION');

  return (
    <div className="space-y-6">
      {/* Header Halaman & Simulator Status Toggle */}
      <div className="border-b border-netral-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-heading font-bold text-gelap">
              Verifikasi Kepatuhan Usaha (KYB)
            </h2>
            <p className="text-xs text-gelap/60 mt-1">
              Tahap 2 dari 2: Legalitas resmi entitas usaha untuk akses penuh perdagangan grosir dan escrow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={kybStatus} />
            <button
              type="button"
              onClick={() =>
                setKybStatus((prev) =>
                  prev === 'PENDING_VERIFICATION' ? 'REJECTED' : 'PENDING_VERIFICATION'
                )
              }
              className="inline-flex items-center text-[11px] font-medium text-gelap/70 bg-white border border-netral-border px-2.5 py-1 rounded-md shadow-2xs hover:bg-netral-canvas transition-colors"
              title="Klik untuk mensimulasikan tampilan status Ditolak (Remediasi) vs Menunggu Verifikasi"
            >
              {kybStatus === 'REJECTED' ? (
                <>
                  <ToggleRight className="w-4 h-4 mr-1 text-sekunder" aria-hidden="true" />
                  Mode Remediasi (Ditolak)
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 mr-1 text-primer" aria-hidden="true" />
                  Mode Pendaftaran Baru
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tampilan Kondisional: Mode Remediasi jika Status REJECTED */}
      {kybStatus === 'REJECTED' ? (
        <RemediationPanel
          rejectionReason="Salinan SK Kelompok Tani terpotong pada lembar tanda tangan pengesahan Dinas Pertanian dan stempel kelurahan tidak terbaca jelas. Mohon unggah ulang salinan utuh halaman 1 s.d. 3 dalam format PDF atau WebP jernih."
          rejectedDocumentType="Surat Keputusan Kelompok Tani DIY"
          onResubmitSuccess={() => setKybStatus('PENDING_VERIFICATION')}
        />
      ) : (
        <>
          {/* Petunjuk Dokumen Resmi DIY */}
          <div className="bg-netral/20 p-4 rounded-lg border border-netral-border/50 text-xs text-gelap/80 space-y-2">
            <div className="flex items-center font-semibold text-primer">
              <ShieldCheck className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Kriteria Dokumen Sah Wilayah D.I. Yogyakarta:
            </div>
            <ul className="list-disc list-inside space-y-1 text-gelap/70 pl-1">
              <li>
                <strong>Restoran / Kafe / Hotel:</strong> Salinan NIB resmi dari OSS Republik Indonesia dan KTP penanggung jawab operasional.
              </li>
              <li>
                <strong>Gapoktan / Petani:</strong> Surat Keputusan / Surat Keterangan Pengukuhan Kelompok Tani dari Dinas Pertanian kabupaten di DIY.
              </li>
              <li>Format berkas yang diterima: PDF jernih atau foto WebP/JPEG beresolusi tajam maksimal 5 MB.</li>
            </ul>
          </div>

          {/* Komponen Unggah Dokumen Awal */}
          <div className="bg-white p-5 rounded-xl border border-netral-border/60 shadow-sm">
            <h3 className="text-sm font-bold text-gelap mb-3 flex items-center font-heading">
              <FileCheck className="w-4 h-4 mr-2 text-primer" aria-hidden="true" />
              Formulir Unggah Berkas Kepatuhan Hukum
            </h3>
            <DocumentUploader />
          </div>

          {/* SLA Waktu Audit Admin */}
          <div className="bg-primer-light/40 border border-primer/20 p-4 rounded-lg flex items-start space-x-3 text-xs text-primer">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-primer" aria-hidden="true" />
            <div>
              <span className="font-bold">Standar Waktu Verifikasi (SLA Maksimal 1x24 Jam)</span>
              <p className="text-[11px] text-gelap/70 mt-0.5">
                Tim audit kepatuhan PasokMataram akan memverifikasi keabsahan dokumen Anda dengan dinas terkait di DIY. Notifikasi resmi dikirimkan langsung ke email penanggung jawab.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Navigasi Footer */}
      <div className="pt-2 flex justify-between items-center text-xs">
        <Link
          href="/buyer/dashboard"
          className="font-semibold text-sekunder hover:underline"
        >
          Lihat Simulasi Dashboard Pembeli &rarr;
        </Link>
        <Link
          href="/"
          className="inline-flex items-center font-semibold text-primer hover:text-primer-hover"
        >
          Kembali ke Beranda Pasar <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
