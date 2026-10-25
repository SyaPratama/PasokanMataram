/**
 * @file apps/web/src/app/supplier/legalitas/page.tsx
 * @description In-dashboard self-serve legal compliance & KYB verification hub for Gapoktan suppliers.
 * Enables farmer groups to upload legal certificates, bank accounts, and monitor compliance inside dashboard shell.
 * Complies with strict design tokens, zero arbitrary hex, zero emoji, and WCAG 2.1 AA touch targets.
 */

'use client';

import * as React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';
import { DocumentUploader } from '../../(auth)/onboarding-kyb/_components/document-uploader';
import { RemediationPanel } from '../../(auth)/onboarding-kyb/_components/remediation-panel';
import type { KybStatus } from '@pasok/domain';

/**
 * Halaman Verifikasi Legalitas Gapoktan & Mitra Pemasok Pangan di dalam Dashboard.
 */
export default function SupplierLegalitasPage(): React.JSX.Element {
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
      <div className="bg-gradient-to-r from-gelap-surface via-gelap to-sekunder rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span>Kepatuhan Hukum Kelompok Tani</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            Legalitas &amp; Sertifikasi Gapoktan
          </h1>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl font-body">
            Validasi kepatuhan hukum kelompok tani dan sentra komoditas pangan untuk pencairan otomatis hasil panen ke rekening BPD DIY serta akses pengiriman rutin ke Hub Logistik Bantul &amp; Sleman.
          </p>
        </div>
      </div>

      <div className="bg-white border-2 border-netral-border/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-gelap uppercase tracking-wider">
            Status Legalitas Kemitraan:
          </div>
          <div className="mt-1 flex items-center gap-2.5">
            <StatusBadge status={kybStatus} />
            <span className="text-xs text-gelap font-medium">
              {kybStatus === 'VERIFIED'
                ? 'Kelompok tani terverifikasi penuh untuk alokasi pasokan pangan dan pencairan dana H+1.'
                : kybStatus === 'REJECTED'
                ? 'Dokumen legalitas membutuhkan perbaikan sesuai catatan kurator audit.'
                : 'Menunggu proses penelaahan dokumen oleh tim audit administrasi pertanian DIY.'}
            </span>
          </div>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-netral-canvas text-sekunder border border-netral-border self-start sm:self-auto">
          SLUG: KYB-GAPOKTAN-DIY
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-sekunder-light/60 border-2 border-sekunder/25 text-xs text-gelap space-y-3">
        <div className="flex items-center font-bold text-sekunder text-sm font-heading">
          <Building2 className="w-5 h-5 mr-2 text-sekunder shrink-0" aria-hidden="true" />
          <span>Kriteria Dokumen Mitra Pemasok Pangan Wilayah D.I. Yogyakarta</span>
        </div>
        <ul className="space-y-2.5 text-gelap leading-relaxed font-body">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sekunder mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-gelap font-bold">Surat Pengukuhan / SK Gapoktan:</strong> Surat keputusan pengukuhan dari Dinas Pertanian / Kelurahan setempat di DIY.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sekunder mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-gelap font-bold">KTP Ketua / Pengurus Gapoktan:</strong> Salinan tanda pengenal resmi ketua kelompok tani atau pengurus logistik panen.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sekunder mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="text-gelap font-bold">Rekening Bank BPD DIY:</strong> Buku tabungan / rekening resmi kelompok tani untuk penerimaan dana pencairan panen.
            </span>
          </li>
        </ul>
      </div>

      {kybStatus === 'REJECTED' ? (
        <RemediationPanel
          rejectionReason="SK Gapoktan kedaluwarsa atau cap stempel tidak jelas. Silakan unggah salinan SK pembaruan kepengurusan terbaru."
          rejectedDocumentType="SK Pengukuhan Gapoktan & Rekening Penampung"
          onResubmitSuccess={() => handleUploadSuccess()}
        />
      ) : (
        <div className="bg-white rounded-3xl border-2 border-netral-border shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-netral-border/70 pb-4">
            <h2 className="text-lg font-bold font-heading text-gelap flex items-center gap-2">
              <FileText className="w-5 h-5 text-sekunder" />
              <span>Unggah Berkas Legalitas Kelompok Tani</span>
            </h2>
            <p className="text-xs text-gelap font-medium mt-1">
              Dokumen diverifikasi oleh tim legal pangan untuk jaminan kepatuhan dan pencairan dana escrow.
            </p>
          </div>

          <DocumentUploader onSuccess={handleUploadSuccess} />
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white border border-netral-border shadow-xs flex items-start gap-3.5">
        <Info className="w-5 h-5 text-aksen mt-0.5 shrink-0" />
        <div className="text-xs text-gelap leading-relaxed space-y-1">
          <div className="font-bold text-gelap">Gating Progresif Pengiriman Panen:</div>
          <p className="text-gelap">
            Petani dapat melihat harga komoditas dan jadwal alokasi hub kapan saja. Verifikasi legalitas dibutuhkan saat serah-terima fisik panen di hub dan pencairan saldo penjualan.
          </p>
        </div>
      </div>
    </div>
  );
}
