'use client';

import * as React from 'react';
import { X, Building2, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { DIYRegency } from '@pasok/domain';

interface AddOutletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Komponen modal dialog formulir pendaftaran gerai cabang baru HoReKa.
 * Memvalidasi batas wilayah dan titik koordinat pengantaran logistik di D.I. Yogyakarta.
 */
export function AddOutletDialog({ isOpen, onClose, onSuccess }: AddOutletDialogProps) {
  const [name, setName] = React.useState('');
  const [regency, setRegency] = React.useState<DIYRegency>('SLEMAN');
  const [streetAddress, setStreetAddress] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!name.trim() || streetAddress.trim().length < 1) {
      setErrorMessage('Nama gerai dan alamat wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/outlets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), regency, address: streetAddress.trim(), isPrimary: false }) });
      const result: unknown = await response.json();
      if (!response.ok || typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) throw new Error('Gerai tidak dapat disimpan.');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Gerai tidak dapat disimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegencyChange = (selected: DIYRegency) => setRegency(selected);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-netral-border overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-primer-deep p-4 px-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-netral" />
            <h2 className="text-base font-bold font-heading">Tambah Gerai Cabang Fisik Baru</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-start p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/30">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-status-danger mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="outlet-name" className="block text-xs font-bold text-gelap mb-1">
              Nama Gerai / Cabang Dapur *
            </label>
            <Input
              id="outlet-name"
              name="outlet-name"
              type="text"
              placeholder="Contoh: Bale Raos Cabang Sleman Barat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div>
            <label htmlFor="outlet-regency" className="block text-xs font-bold text-gelap mb-1">
              Kabupaten / Kota di DIY *
            </label>
            <div className="relative">
              <select
                id="outlet-regency"
                name="outlet-regency"
                value={regency}
                onChange={(e) => handleRegencyChange(e.target.value as DIYRegency)}
                className="w-full text-xs p-2.5 pr-8 rounded-xl border border-netral-border bg-white text-gelap focus:ring-2 focus:ring-primer focus:outline-none appearance-none cursor-pointer min-h-[44px]"
              >
                <option value="SLEMAN">Kab. Sleman</option>
                <option value="BANTUL">Kab. Bantul</option>
                <option value="KULON_PROGO">Kab. Kulon Progo</option>
                <option value="GUNUNGKIDUL">Kab. Gunungkidul</option>
                <option value="KOTA_YOGYAKARTA">Kota Yogyakarta</option>
              </select>
              <ChevronDown
                className="w-4 h-4 text-gelap/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <label htmlFor="outlet-address" className="block text-xs font-bold text-gelap mb-1">
              Alamat Lengkap Pengantaran Subuh *
            </label>
            <textarea
              id="outlet-address"
              name="outlet-address"
              rows={2}
              placeholder="Sebutkan jalan, nomor, kelurahan, dan patokan agar kurir pangan mudah menemukan dapur..."
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-netral-border focus:ring-2 focus:ring-primer focus:outline-none"
              required
            />
          </div>


          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="text-xs"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              loadingText="Mendaftarkan Gerai..."
              className="text-xs font-semibold px-4"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Simpan & Daftarkan Gerai
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
