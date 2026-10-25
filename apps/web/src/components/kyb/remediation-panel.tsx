'use client';

import * as React from 'react';
import { AlertTriangle, UploadCloud, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RemediationPanelProps {
  rejectionReason: string;
  rejectedDocumentType?: string;
  onResubmitSuccess?: () => void;
}

/**
 * Komponen panel remediasi penolakan berkas KYB.
 * Menampilkan catatan evaluasi penolakan dari admin audit dan antarmuka unggah berkas perbaikan.
 */
export function RemediationPanel({
  rejectionReason,
  rejectedDocumentType = 'Surat Keputusan Kelompok Tani / NIB',
  onResubmitSuccess,
}: RemediationPanelProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Menangani pemilihan berkas digital pengganti.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validMimes = ['application/pdf', 'image/webp', 'image/jpeg', 'image/png'];
      if (!validMimes.includes(file.type)) {
        setErrorMessage('Format berkas tidak valid. Hanya berkas PDF, WebP, JPEG, atau PNG yang diterima.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran berkas melebihi batas 5 MB. Silakan kompresi berkas terlebih dahulu.');
        return;
      }
      setSelectedFile(file);
    }
  };

  /**
   * Menangani pengiriman berkas perbaikan.
   */
  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Silakan pilih berkas dokumen perbaikan yang baru sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onResubmitSuccess) {
        onResubmitSuccess();
      }
    }, 700);
  };

  if (isSuccess) {
    return (
      <div className="bg-primer-light/50 border border-primer/30 rounded-2xl p-6 sm:p-8 text-center space-y-3.5 shadow-xs">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primer text-white mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7 text-white" aria-hidden="true" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gelap font-heading">
          Berkas Perbaikan Berhasil Dikirimkan
        </h3>
        <p className="text-xs sm:text-sm text-gelap/90 max-w-md mx-auto leading-relaxed font-body">
          Status kepatuhan entitas usaha Anda telah beralih kembali ke <strong className="text-gelap font-bold">PENDING_VERIFICATION</strong>. Dokumen telah masuk kembali ke antrean teratas meja kerja audit tim PasokMataram.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center text-xs font-bold text-primer bg-white px-3.5 py-2 rounded-xl border border-primer/20 shadow-2xs">
            Estimasi Tinjauan Ulang: Maksimal 1x24 Jam Kerja
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-sekunder/40 shadow-xs overflow-hidden">
      <div className="bg-sekunder-light/80 border-b border-sekunder/30 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-sekunder text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="text-xs space-y-1.5 flex-1">
          <h3 className="font-bold text-sm sm:text-base text-sekunder-dark font-heading">
            Permohonan Verifikasi Membutuhkan Perbaikan
          </h3>
          <p className="text-gelap/90 leading-relaxed font-body">
            Tim kepatuhan PasokMataram menandai dokumen <strong className="text-gelap font-bold">{rejectedDocumentType}</strong> memerlukan perbaikan dengan catatan resmi sebagai berikut:
          </p>
          <div className="bg-white p-3.5 rounded-xl border border-sekunder/30 text-gelap font-medium mt-2 italic text-xs leading-relaxed shadow-2xs">
            &ldquo;{rejectionReason}&rdquo;
          </div>
        </div>
      </div>

      <form onSubmit={handleResubmit} className="p-5 sm:p-6 space-y-5">
        <div>
          <label htmlFor="remediation-file" className="block text-xs font-bold text-gelap mb-1.5">
            Unggah Berkas Perbaikan Dokumen Resmi (PDF/WebP maks. 5 MB)
          </label>
          <div
            tabIndex={0}
            role="button"
            aria-label="Pilih Berkas Perbaikan Dokumen"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className="border-2 border-dashed border-netral-border hover:border-primer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer rounded-2xl p-6 sm:p-7 text-center cursor-pointer bg-netral-canvas/60 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              id="remediation-file"
              name="remediation-file"
              aria-label="Pilih Berkas Perbaikan Dokumen"
              accept=".pdf,.webp,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primer-light text-primer border border-primer/20 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-primer" aria-hidden="true" />
              </div>
              {selectedFile ? (
                <div className="text-xs">
                  <span className="font-bold text-gelap flex items-center justify-center gap-1.5">
                    <FileText className="w-4 h-4 text-primer shrink-0" aria-hidden="true" />
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gelap/75 flex items-center justify-center gap-1.5 mt-1 font-body">
                    <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
                    <span>Klik untuk mengganti berkas</span>
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gelap/80 space-y-1 font-body">
                  <span className="font-bold text-primer text-sm block">Klik untuk memilih berkas pengganti</span>
                  <p className="text-xs text-gelap/75">
                    Pastikan lembar tanda tangan dan stempel instansi terlihat utuh serta tidak buram (Format: PDF/WebP maks. 5 MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 bg-status-danger-light text-status-danger text-xs font-semibold rounded-xl border border-status-danger/30"
          >
            {errorMessage}
          </div>
        ) : null}

        <div>
          <label htmlFor="remediation-notes" className="block text-xs font-bold text-gelap mb-1.5">
            Catatan Perbaikan Tambahan (Opsional)
          </label>
          <textarea
            id="remediation-notes"
            name="remediation-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan keterangan jika ada halaman tambahan atau konfirmasi nomor surat pengesahan…"
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-netral-border focus-visible:ring-2 focus-visible:ring-primer focus-visible:outline-none bg-white text-gelap placeholder:text-gelap/50"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Mengirimkan Berkas Perbaikan…"
            className="w-full sm:w-auto min-h-[48px] text-xs sm:text-sm font-bold px-6 shadow-sm"
          >
            <span>Kirim Ulang Dokumen Perbaikan</span>
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}
