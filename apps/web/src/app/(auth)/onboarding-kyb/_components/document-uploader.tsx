'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import type { DocumentType } from '@pasok/domain';

interface DocumentUploaderProps {
  onSuccess?: () => void;
}

export function DocumentUploader({ onSuccess }: DocumentUploaderProps) {
  const [documentType, setDocumentType] = React.useState<DocumentType>('NIB');
  const [documentNumber, setDocumentNumber] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'Ukuran berkas melebihi batas maksimal 5 MB.' });
        return;
      }
      setFile(selected);
      setStatusMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentNumber) {
      setStatusMessage({ type: 'error', text: 'Mohon isi nomor dokumen dan pilih berkas.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setUploadProgress(15);

    try {
      // 1. Minta presigned URL dari backend
      const presignedRes = await fetch('/api/v1/kyb/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          fileName: file.name,
          fileMimeType: file.type || 'application/pdf',
          fileSizeBytes: file.size,
        }),
      });

      const presignedData = await presignedRes.json();
      if (!presignedRes.ok) {
        throw new Error(presignedData.error?.message || 'Gagal meminta URL upload.');
      }

      const { uploadUrl, fileStorageKey } = presignedData.data;
      setUploadProgress(50);

      // 2. Upload file langsung ke MinIO S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/pdf',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Gagal mengunggah berkas ke penyimpanan MinIO.');
      }

      setUploadProgress(85);

      // 3. Konfirmasi metadata dokumen ke backend
      const confirmRes = await fetch('/api/v1/kyb/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          documentNumber,
          fileStorageKey,
          fileMimeType: file.type || 'application/pdf',
          fileSizeBytes: file.size,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmData.error?.message || 'Gagal mencatat metadata dokumen.');
      }

      setUploadProgress(100);
      setStatusMessage({
        type: 'success',
        text: 'Dokumen legalitas berhasil diunggah dan masuk antrean verifikasi kepatuhan.',
      });

      setFile(null);
      setDocumentNumber('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan unggah.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-5">
      {statusMessage ? (
        <div
          role="alert"
          aria-live="polite"
          className={`p-3.5 rounded-xl flex items-start space-x-2.5 text-xs font-semibold ${
            statusMessage.type === 'error'
              ? 'bg-status-danger-light border border-status-danger/30 text-status-danger'
              : 'bg-pendukung-light border border-pendukung/30 text-primer'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      ) : null}

      <div>
        <label htmlFor="docType" className="block text-xs font-bold text-gelap mb-1.5 font-heading">
          Jenis Dokumen Legalitas Resmi
        </label>
        <select
          id="docType"
          name="docType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-netral-border rounded-xl text-gelap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer font-medium min-h-[44px] transition-colors"
        >
          <option value="NIB">Nomor Induk Berusaha (NIB OSS - HoReKa)</option>
          <option value="KTP">KTP Penanggung Jawab / Ketua</option>
          <option value="SURAT_KETERANGAN_TANI">Surat Keputusan Kelompok Tani (Gapoktan)</option>
          <option value="NPWP">NPWP Badan Usaha / Perorangan</option>
        </select>
      </div>

      <div>
        <label htmlFor="docNumber" className="block text-xs font-bold text-gelap mb-1.5 font-heading">
          Nomor Dokumen Resmi (13 Digit NIB / 16 Digit NIK)
        </label>
        <input
          id="docNumber"
          name="docNumber"
          type="text"
          inputMode="numeric"
          spellCheck={false}
          placeholder="misal: 0123456789012…"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-netral-border rounded-xl text-gelap placeholder:text-gelap/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer font-medium min-h-[44px] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gelap mb-1.5">
          Berkas Dokumen Digital (PDF atau WebP/JPEG, Maks. 5 MB)
        </label>
        <div className="border-2 border-dashed border-netral-border rounded-2xl p-6 sm:p-7 text-center hover:border-primer transition-colors bg-netral-canvas/60">
          <input
            type="file"
            id="fileUpload"
            name="fileUpload"
            aria-label="Unggah Berkas Dokumen Digital"
            accept=".pdf,image/webp,image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="fileUpload" className="cursor-pointer block">
            <div className="w-12 h-12 rounded-2xl bg-primer-light text-primer border border-primer/20 flex items-center justify-center mx-auto mb-2.5">
              <UploadCloud className="w-6 h-6 text-primer" aria-hidden="true" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-primer hover:underline block">
              Pilih berkas dari perangkat
            </span>
            <span className="text-xs text-gelap/80 block mt-1 font-body">
              {file ? (
                <span className="inline-flex items-center text-primer font-bold">
                  <FileText className="w-4 h-4 mr-1 shrink-0" aria-hidden="true" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              ) : (
                'Format berkas yang didukung: PDF, WebP, JPEG (Maksimal 5 MB)'
              )}
            </span>
          </label>
        </div>
      </div>

      {uploadProgress !== null ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gelap/80 font-medium">
            <span>Mengunggah dokumen ke penyimpanan privat…</span>
            <span className="font-mono font-bold text-primer">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full min-h-[48px] rounded-xl font-bold text-sm bg-primer hover:bg-primer-hover text-white shadow-sm"
        isLoading={isSubmitting}
        loadingText="Mengamankan & Mengunggah Dokumen…"
        disabled={!file || !documentNumber}
      >
        Unggah Dokumen Legalitas
      </Button>
    </form>
  );
}
