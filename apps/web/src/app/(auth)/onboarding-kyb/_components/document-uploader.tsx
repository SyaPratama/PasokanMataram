'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <form onSubmit={handleUpload} className="space-y-4">
      {statusMessage && (
        <div
          className={`p-3 rounded-md flex items-start space-x-2 text-xs ${
            statusMessage.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-pendukung-light border border-pendukung/30 text-primer'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div>
        <label htmlFor="docType" className="block text-xs font-semibold text-gelap mb-1">
          Jenis Dokumen Legalitas Resmi
        </label>
        <select
          id="docType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="w-full px-3 py-2 text-sm bg-white border border-netral-border rounded-md text-gelap focus:outline-none focus:ring-2 focus:ring-primer"
        >
          <option value="NIB">Nomor Induk Berusaha (NIB OSS - HoReKa)</option>
          <option value="KTP">KTP Penanggung Jawab / Ketua</option>
          <option value="SURAT_KETERANGAN_TANI">Surat Keputusan Kelompok Tani (Gapoktan)</option>
          <option value="NPWP">NPWP Badan Usaha / Perorangan</option>
        </select>
      </div>

      <Input
        label="Nomor Dokumen Resmi (13 Digit NIB / 16 Digit NIK)"
        placeholder="misal: 0123456789012"
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
        required
      />

      <div>
        <label className="block text-xs font-semibold text-gelap mb-1">
          Berkas Dokumen Digital (PDF atau WebP/JPEG, Maks. 5 MB)
        </label>
        <div className="border-2 border-dashed border-netral-border rounded-lg p-6 text-center hover:border-primer transition-colors bg-netral-canvas/40">
          <input
            type="file"
            id="fileUpload"
            accept=".pdf,image/webp,image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="fileUpload" className="cursor-pointer block">
            <UploadCloud className="w-8 h-8 mx-auto text-primer/70 mb-2" />
            <span className="text-xs font-medium text-primer hover:underline">
              Pilih berkas dari perangkat
            </span>
            <span className="text-[11px] text-gelap/60 block mt-1">
              {file ? (
                <span className="inline-flex items-center text-primer font-semibold">
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              ) : (
                'Format yang didukung: PDF, WebP, JPEG (Maksimal 5 MB)'
              )}
            </span>
          </label>
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gelap/70">
            <span>Mengunggah dokumen ke penyimpanan privat...</span>
            <span className="font-mono font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        loadingText="Mengamankan & Mengunggah Dokumen..."
        disabled={!file || !documentNumber}
      >
        Unggah Dokumen Legalitas
      </Button>
    </form>
  );
}
