'use client';

import * as React from 'react';
import { AlertTriangle, UploadCloud, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

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

    // Simulasi pengiriman data perbaikan ke server
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
      <div className="bg-primer-light/40 border border-primer/30 rounded-xl p-6 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primer text-white mx-auto shadow-sm">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-gelap font-heading">
          Berkas Perbaikan Berhasil Dikirimkan
        </h3>
        <p className="text-xs text-gelap/80 max-w-md mx-auto">
          Status kepatuhan entitas usaha Anda telah beralih kembali ke <strong>PENDING_VERIFICATION</strong>. Dokumen telah masuk kembali ke antrean teratas meja kerja audit tim PasokMataram.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center text-xs font-semibold text-primer bg-white px-3 py-1.5 rounded-md border border-primer/20 shadow-xs">
            Estimasi Tinjauan Ulang: Maksimal 1x24 Jam Kerja
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-sekunder/40 shadow-sm overflow-hidden">
      {/* Banner Peringatan Penolakan */}
      <div className="bg-sekunder-light/50 border-b border-sekunder/30 p-4 sm:p-5 flex items-start gap-3">
        <div className="p-2 bg-sekunder text-white rounded-lg flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-sm text-sekunder font-heading">
            Permohonan Verifikasi Membutuhkan Perbaikan
          </div>
          <p className="text-gelap/80">
            Tim kepatuhan PasokMataram menandai dokumen <strong>{rejectedDocumentType}</strong> memerlukan perbaikan dengan catatan resmi sebagai berikut:
          </p>
          <div className="bg-white/80 p-3 rounded-md border border-sekunder/20 text-gelap font-medium mt-2 italic">
            &ldquo;{rejectionReason}&rdquo;
          </div>
        </div>
      </div>

      {/* Formulir Unggah Pengganti */}
      <form onSubmit={handleResubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gelap mb-1">
            Unggah Berkas Perbaikan Dokumen Resmi (PDF/WebP maks 5 MB)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-netral-border hover:border-primer rounded-lg p-6 text-center cursor-pointer bg-netral-canvas transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.webp,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-primer-light flex items-center justify-center text-primer">
                <UploadCloud className="w-5 h-5" aria-hidden="true" />
              </div>
              {selectedFile ? (
                <div className="text-xs">
                  <span className="font-semibold text-gelap flex items-center justify-center gap-1">
                    <FileText className="w-4 h-4 text-primer" />
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-gelap/60 block mt-0.5">
                    ({(selectedFile.size / 1024).toFixed(1)} KB) - Klik untuk ganti berkas
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gelap/70">
                  <span className="font-semibold text-primer">Klik untuk memilih berkas pengganti</span> atau seret dokumen ke sini
                  <p className="text-[11px] text-gelap/50 mt-1">
                    Pastikan lembar tanda tangan dan stempel instansi terlihat utuh serta tidak buram.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="remediation-notes" className="block text-xs font-bold text-gelap mb-1">
            Catatan Perbaikan Tambahan (Opsional)
          </label>
          <textarea
            id="remediation-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan keterangan jika ada halaman tambahan atau konfirmasi nomor surat pengesahan..."
            className="w-full text-xs p-2.5 rounded-md border border-netral-border focus:ring-2 focus:ring-primer focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Mengirimkan Berkas Perbaikan..."
            className="text-xs font-semibold px-5 shadow-sm"
          >
            <span>Kirim Ulang Dokumen Perbaikan</span>
            <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}
