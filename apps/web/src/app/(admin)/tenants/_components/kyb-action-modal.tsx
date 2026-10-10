'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

interface KybActionModalProps {
  isOpen: boolean;
  businessName: string;
  decision: 'APPROVED' | 'REJECTED';
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}

export function KybActionModal({
  isOpen,
  businessName,
  decision,
  onClose,
  onConfirm,
  isLoading,
}: KybActionModalProps) {
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setRejectionReason('');
      setError(null);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'REJECTED' && rejectionReason.trim().length < 5) {
      setError('Alasan penolakan minimal 5 karakter agar mitra dapat memperbaiki dokumen.');
      return;
    }
    setError(null);
    await onConfirm(decision === 'REJECTED' ? rejectionReason.trim() : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gelap/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-netral-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-netral-border bg-netral-canvas">
          <div className="flex items-center space-x-2">
            {decision === 'APPROVED' ? (
              <CheckCircle2 className="w-5 h-5 text-primer" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 id="modal-title" className="font-heading font-bold text-sm text-gelap">
              {decision === 'APPROVED' ? 'Persetujuan Kemitraan KYB' : 'Penolakan Berkas KYB'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-md text-gelap/50 hover:text-gelap hover:bg-netral-border/40 focus:outline-none focus:ring-2 focus:ring-primer"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-gelap/70">
            {decision === 'APPROVED' ? (
              <>
                Konfirmasi persetujuan legalitas untuk{' '}
                <strong className="text-gelap font-semibold">{businessName}</strong>. Status entitas akan
                beralih menjadi <span className="text-primer font-bold">VERIFIED</span>.
              </>
            ) : (
              <>
                Tolak berkas kepatuhan untuk{' '}
                <strong className="text-gelap font-semibold">{businessName}</strong>. Berikan catatan
                penolakan resmi agar mitra dapat mengunggah perbaikan.
              </>
            )}
          </p>

          {decision === 'REJECTED' && (
            <div>
              <label htmlFor="rejection-reason" className="block text-xs font-semibold text-gelap mb-1">
                Alasan Penolakan Resmi (Wajib)
              </label>
              <textarea
                id="rejection-reason"
                name="rejection-reason"
                rows={3}
                required
                disabled={isLoading}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="misal: Halaman NIB buram, tanggal masa berlaku terpotong..."
                className="w-full px-3 py-2 text-xs bg-white border border-netral-border rounded-md text-gelap focus:outline-none focus:ring-2 focus:ring-primer"
              />
              {error && (
                <div className="mt-1 flex items-center space-x-1 text-[11px] text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-netral-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isLoading}
              className={
                decision === 'APPROVED'
                  ? 'bg-primer hover:bg-primer-deep text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {decision === 'APPROVED' ? 'Setujui Kemitraan' : 'Kirim Penolakan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
