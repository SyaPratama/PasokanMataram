'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DocumentUploader } from './_components/document-uploader';
import { RemediationPanel } from './_components/remediation-panel';
import { StatusBadge } from '../../../components/shared/status-badge';
import { ShieldCheck, FileCheck, Clock, ArrowRight, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

/**
 * Halaman Alur Onboarding Legalitas KYB & Remediasi.
 * Mendukung simulasi peninjauan status PENDING_VERIFICATION maupun remediasi REJECTED.
 */
export default function OnboardingKybPage() {
  const [kybStatus, setKybStatus] = React.useState<'PENDING_VERIFICATION' | 'REJECTED'>('PENDING_VERIFICATION');

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-md border border-netral-border/80 overflow-hidden p-6 sm:p-8 space-y-6">
      <div className="bg-gradient-to-b from-primer-deep to-primer rounded-2xl p-5 sm:p-6 text-white text-center shadow-xs relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white mb-3 shadow-xs p-2">
          <Image
            src="/icons/icon.svg"
            alt="Logo PasokMataram"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        </div>
        <div className="flex items-center justify-center mb-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 border border-white/25 text-white shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Tahap 2 dari 2: Verifikasi Resmi
            </span>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-white">
          Verifikasi Kepatuhan Usaha (KYB)
        </h1>
        <p className="text-xs sm:text-sm text-white/90 mt-1.5 max-w-lg mx-auto leading-relaxed font-body">
          Validasi legalitas resmi entitas usaha untuk akses penuh perdagangan grosir dan proteksi rekening bersama (escrow) se-D.I. Yogyakarta.
        </p>
      </div>

      <div className="bg-netral-canvas border border-netral-border/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-gelap font-heading">Status Pengajuan:</span>
          <StatusBadge status={kybStatus} />
        </div>
        <button
          type="button"
          onClick={() =>
            setKybStatus((prev) =>
              prev === 'PENDING_VERIFICATION' ? 'REJECTED' : 'PENDING_VERIFICATION'
            )
          }
          className="inline-flex items-center gap-2 text-xs font-semibold text-gelap bg-white border border-netral-border hover:border-primer hover:bg-netral-canvas/40 px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all min-h-[44px]"
          title="Klik untuk mensimulasikan tampilan status Ditolak (Remediasi) vs Menunggu Verifikasi"
        >
          {kybStatus === 'REJECTED' ? (
            <>
              <ToggleRight className="w-5 h-5 text-status-danger shrink-0" aria-hidden="true" />
              <span>Simulasi: Mode Remediasi (Ditolak)</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-primer shrink-0" aria-hidden="true" />
              <span>Simulasi: Mode Pendaftaran Baru</span>
            </>
          )}
        </button>
      </div>

      {kybStatus === 'REJECTED' ? (
        <RemediationPanel
          rejectionReason="Salinan dokumen legalitas usaha terpotong pada lembar tanda tangan pengesahan dan stempel tidak terbaca jelas. Mohon unggah ulang salinan utuh halaman 1 s.d. 3 dalam format PDF atau WebP jernih."
          rejectedDocumentType="Dokumen Legalitas Usaha Pemasok"
          onResubmitSuccess={() => setKybStatus('PENDING_VERIFICATION')}
        />
      ) : (
        <>
          <div className="bg-primer-light/60 p-5 rounded-2xl border border-primer/25 text-xs text-gelap space-y-3">
            <div className="flex items-center font-bold text-primer text-sm font-heading">
              <ShieldCheck className="w-5 h-5 mr-2 text-primer shrink-0" aria-hidden="true" />
              <span>Kriteria Dokumen Sah Wilayah D.I. Yogyakarta</span>
            </div>
            <ul className="space-y-2.5 text-gelap/90 leading-relaxed font-body">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-gelap font-bold">Restoran / Kafe / Hotel (HoReKa):</strong> Salinan Nomor Induk Berusaha (NIB OSS RI) aktif dan KTP penanggung jawab operasional dapur.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-gelap font-bold">Mitra Pemasok / Supplier:</strong> NIB OSS aktif, Surat Pengukuhan Usaha, atau Sertifikat Mutu Resmi (Halal / NKV / SKP BPOM) dari instansi terkait wilayah DIY.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-gelap font-bold">Format Berkas Diterima:</strong> PDF dokumen utuh atau foto WebP/JPEG tajam beresolusi tinggi (maksimal 5 MB per berkas).
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-netral-border/80 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-gelap mb-4 flex items-center font-heading">
              <FileCheck className="w-5 h-5 mr-2 text-primer shrink-0" aria-hidden="true" />
              Formulir Unggah Berkas Kepatuhan Hukum
            </h3>
            <DocumentUploader />
          </div>

          <div className="bg-netral-canvas border border-netral-border/80 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-xs text-gelap">
            <div className="w-9 h-9 rounded-xl bg-primer-light text-primer border border-primer/20 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-primer" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-sm text-gelap font-heading block">
                Standar Waktu Verifikasi (SLA Maksimal 1x24 Jam)
              </span>
              <p className="text-xs text-gelap/80 leading-relaxed font-body">
                Tim audit kepatuhan PasokMataram akan memverifikasi keabsahan dokumen Anda dengan dinas terkait di D.I. Yogyakarta. Pemberitahuan resmi hasil audit dikirimkan langsung ke email penanggung jawab.
              </p>
            </div>
          </div>
        </>
      )}

      <div className="pt-4 border-t border-netral-border/70 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm">
        <Link
          href="/buyer/dashboard"
          className="font-bold text-sekunder hover:text-sekunder-dark hover:underline inline-flex items-center min-h-[44px] transition-colors"
        >
          <span>Lihat Simulasi Dashboard Pembeli</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center font-bold text-primer hover:text-primer-hover hover:underline min-h-[44px] transition-colors"
        >
          <span>Kembali ke Beranda Pasar</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
