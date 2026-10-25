/**
 * @file apps/web/src/app/buyer/legalitas/page.tsx
 * @description In-dashboard self-serve legal compliance & KYB verification hub for HoReKa buyers.
 * Enables kitchens to upload NIB and KTP, monitor verification status, and resolve remediation within dashboard shell.
 * Complies with strict design tokens, zero arbitrary hex, zero emoji, and WCAG 2.1 AA touch targets.
 */

'use client';

import * as React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  HelpCircle,
  Store,
  ArrowRight,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';
import { DocumentUploader } from '../../(auth)/onboarding-kyb/_components/document-uploader';
import { RemediationPanel } from '../../(auth)/onboarding-kyb/_components/remediation-panel';
import type { KybStatus } from '@pasok/domain';

/**
 * Halaman Verifikasi Legalitas & Kepatuhan Usaha (KYB) Pembeli HoReKa di dalam Dashboard.
 */
export default function BuyerLegalitasPage(): React.JSX.Element {
  const [kybStatus, setKybStatus] = React.useState<KybStatus>('PENDING_VERIFICATION');

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/pasok_kyb_status=([^;]+)/);
      if (match && match[1]) {
        const val = match[1] as KybStatus;
        if (['VERIFIED', 'REJECTED', 'PENDING_VERIFICATION', 'KYB_PENDING'].includes(val)) {
          setKybStatus(val);
        }
      }
    }
  }, []);

  const handleUploadSuccess = () => {
    setKybStatus('PENDING_VERIFICATION');
    if (typeof document !== 'undefined') {
      document.cookie = `pasok_kyb_status=PENDING_VERIFICATION; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-primer-deep via-primer to-primer-hover rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span>Kepatuhan Legalitas Usaha Dapur</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            Verifikasi Kepatuhan Usaha (KYB)
          </h1>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl font-body">
            Validasi legalitas resmi entitas restoran, kafe, dan hotel untuk membuka kuota pesanan tanpa batas, kliring escrow otomatis Bank BPD DIY, dan faktur terpadu se-D.I. Yogyakarta.
          </p>
        </div>
      </div>

      <div className="bg-white border-2 border-netral-border/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-gelap uppercase tracking-wider">
            Status Kepatuhan Hukum Akun:
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <StatusBadge status={kybStatus} />
            <span className="text-xs text-gelap font-medium">
              {kybStatus === 'VERIFIED'
                ? 'Akun telah terverifikasi penuh untuk seluruh transaksi pasokan grosir.'
                : kybStatus === 'REJECTED'
                ? 'Berkas memerlukan perbaikan sesuai catatan kurator audit.'
                : 'Menunggu peninjauan kurator verifikasi legalitas (estimasi 1x24 jam kerja).'}
            </span>
          </div>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-netral-canvas text-primer border border-netral-border self-start sm:self-auto">
          SLUG: KYB-HOREKA-DIY
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-primer-light/60 border-2 border-primer/25 text-xs text-gelap space-y-3">
        <div className="flex items-center font-bold text-primer text-sm font-heading">
          <ShieldCheck className="w-5 h-5 mr-2 text-primer shrink-0" aria-hidden="true" />
          <span>Kriteria Dokumen Sah Usaha Kuliner Wilayah D.I. Yogyakarta</span>
        </div>
        <ul className="space-y-2.5 text-gelap leading-relaxed font-body">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-gelap font-bold">Nomor Induk Berusaha (NIB OSS RI):</strong> Salinan digital NIB aktif berbasis risiko untuk bidang restoran, katering, atau perhotelan.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-gelap font-bold">KTP Penanggung Jawab:</strong> Salinan identitas resmi pemilik usaha (Owner) atau penanggung jawab operasional dapur (Head Chef).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-gelap font-bold">Format Dokumen:</strong> Berkas PDF utuh atau foto WebP/JPEG tajam beresolusi tinggi (maksimal 5 MB per berkas).
            </span>
          </li>
        </ul>
      </div>

      {kybStatus === 'REJECTED' ? (
        <RemediationPanel
          rejectionReason="Salinan NIB atau KTP buram dan nomor induk tidak terbaca jelas. Mohon unggah ulang salinan pindaian beresolusi tajam dalam format PDF atau WebP."
          rejectedDocumentType="Salinan NIB OSS & KTP Penanggung Jawab"
          onResubmitSuccess={() => handleUploadSuccess()}
        />
      ) : (
        <div className="bg-white rounded-3xl border-2 border-netral-border shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-netral-border/70 pb-4">
            <h2 className="text-lg font-bold font-heading text-gelap flex items-center gap-2">
              <FileText className="w-5 h-5 text-primer" />
              <span>Unggah Berkas Legalitas Dapur</span>
            </h2>
            <p className="text-xs text-gelap font-medium mt-1">
              Seluruh berkas terenkripsi dengan proteksi data rahasia dan dynamic watermarking.
            </p>
          </div>

          <DocumentUploader onSuccess={handleUploadSuccess} />
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white border border-netral-border shadow-xs flex items-start gap-3.5">
        <Info className="w-5 h-5 text-aksen mt-0.5 shrink-0" />
        <div className="text-xs text-gelap leading-relaxed space-y-1">
          <div className="font-bold text-gelap">Ketentuan Transaksi & Gating Progresif:</div>
          <p className="text-gelap">
            Anda tetap dapat mengeksplorasi katalog komoditas lokal, memantau prakiraan tren harga panen, dan mengelola profil cabang dapur. Verifikasi legalitas ini hanya disyaratkan saat Anda menerbitkan alokasi kuota pooling, standing order, dan transaksi pembayaran perbankan escrow.
          </p>
        </div>
      </div>
    </div>
  );
}
