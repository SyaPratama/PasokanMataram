'use client';

import * as React from 'react';
import { X, MapPin, Building2, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { DIYRegency } from '@pasok/domain';
import type { MockOutlet } from '../../../../lib/mock-data';

interface AddOutletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOutlet: MockOutlet) => void;
}

/**
 * Komponen modal dialog formulir pendaftaran gerai cabang baru HoReKa.
 * Memvalidasi batas wilayah dan titik koordinat pengantaran logistik di D.I. Yogyakarta.
 */
export function AddOutletDialog({ isOpen, onClose, onSuccess }: AddOutletDialogProps) {
  const [name, setName] = React.useState('');
  const [regency, setRegency] = React.useState<DIYRegency>('SLEMAN');
  const [streetAddress, setStreetAddress] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [latitude, setLatitude] = React.useState<number>(-7.75);
  const [longitude, setLongitude] = React.useState<number>(110.37);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * Menangani pengiriman data gerai baru.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama gerai cabang wajib diisi.');
      return;
    }
    if (streetAddress.trim().length < 10) {
      setErrorMessage('Alamat pengiriman harus lengkap minimal 10 karakter.');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMessage('Nama narahubung dapur wajib diisi.');
      return;
    }
    if (latitude < -9.0 || latitude > -7.0 || longitude < 110.0 || longitude > 111.0) {
      setErrorMessage('Koordinat geografis harus berada di dalam batas wilayah D.I. Yogyakarta (-9.0 s/d -7.0, 110.0 s/d 111.0).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const createdOutlet: MockOutlet = {
        id: `out-${Date.now()}`,
        name,
        isMain: false,
        regency,
        streetAddress,
        contactPerson,
        phone: phone || '0812-3456-7890',
        latitude,
        longitude,
        activeOrdersCount: 0,
      };
      onSuccess(createdOutlet);
      onClose();
    }, 600);
  };

  /**
   * Set titik acuan koordinat berdasarkan kabupaten.
   */
  const handleRegencyChange = (selected: DIYRegency) => {
    setRegency(selected);
    if (selected === 'SLEMAN') {
      setLatitude(-7.7124);
      setLongitude(110.4079);
    } else if (selected === 'BANTUL') {
      setLatitude(-7.8893);
      setLongitude(110.3298);
    } else if (selected === 'KULON_PROGO') {
      setLatitude(-7.8576);
      setLongitude(110.1584);
    } else if (selected === 'GUNUNGKIDUL') {
      setLatitude(-7.9654);
      setLongitude(110.6032);
    } else {
      setLatitude(-7.7928);
      setLongitude(110.3658);
    }
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <option value="YOGYAKARTA">Kota Yogyakarta</option>
                </select>
                <ChevronDown
                  className="w-4 h-4 text-gelap/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label htmlFor="outlet-phone" className="block text-xs font-bold text-gelap mb-1">
                No. Telepon Gerai
              </label>
              <Input
                id="outlet-phone"
                name="outlet-phone"
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs"
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

          <div>
            <label htmlFor="outlet-contact" className="block text-xs font-bold text-gelap mb-1">
              Penanggung Jawab Dapur / Kepala Masak *
            </label>
            <Input
              id="outlet-contact"
              name="outlet-contact"
              type="text"
              placeholder="Nama Chef atau Manajer Gerai"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="bg-netral/20 p-3 rounded-lg border border-netral-border/60 text-xs space-y-2">
            <div className="font-semibold text-primer flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Titik Koordinat Rute Kurir (Wilayah D.I. Yogyakarta)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="outlet-lat" className="text-[10px] text-gelap/60 block">Lintang (Latitude)</label>
                <input
                  id="outlet-lat"
                  name="outlet-lat"
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full p-1.5 text-xs rounded border border-netral-border bg-white"
                />
              </div>
              <div>
                <label htmlFor="outlet-lng" className="text-[10px] text-gelap/60 block">Bujur (Longitude)</label>
                <input
                  id="outlet-lng"
                  name="outlet-lng"
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full p-1.5 text-xs rounded border border-netral-border bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-gelap/60">
              Koordinat otomatis disesuaikan dengan acuan kabupaten terpilih. Kurir subuh menggunakan titik ini untuk navigasi rute drop bahan baku.
            </p>
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
