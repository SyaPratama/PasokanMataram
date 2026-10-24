'use client';

import * as React from 'react';
import { Plus, Search, MapPin, Store, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { OutletCard } from './_components/outlet-card';
import { OutletSkeleton } from './_components/outlet-skeleton';
import { AddOutletDialog } from './_components/add-outlet-dialog';
import { MOCK_OUTLETS, type MockOutlet } from '../../../lib/mock-data';
import type { DIYRegency } from '@pasok/domain';

type RegencyFilter = 'ALL' | DIYRegency;

/**
 * Halaman Meja Kerja Manajemen Multi-Outlet HoReKa.
 * Memungkinkan pemilik atau manajer pengadaan mendaftarkan dan memantau gerai cabang di D.I. Yogyakarta.
 */
export default function OutletsPage() {
  const [outlets, setOutlets] = React.useState<MockOutlet[]>(MOCK_OUTLETS);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [regencyFilter, setRegencyFilter] = React.useState<RegencyFilter>('ALL');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  /**
   * Menangani penambahan outlet baru dari dialog modal.
   */
  const handleAddOutletSuccess = (newOutlet: MockOutlet) => {
    setOutlets((prev) => [newOutlet, ...prev]);
    setSuccessToast(`Gerai "${newOutlet.name}" berhasil didaftarkan ke sistem.`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  /**
   * Filter daftar outlet berdasarkan kata kunci dan kabupaten.
   */
  const filteredOutlets = React.useMemo(() => {
    return outlets.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.streetAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegency = regencyFilter === 'ALL' || item.regency === regencyFilter;
      return matchSearch && matchRegency;
    });
  }, [outlets, searchTerm, regencyFilter]);

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="p-3.5 bg-primer-light border border-primer/30 text-primer text-xs rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-primer flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-primer/70 hover:text-primer text-xs font-bold ml-3"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-netral-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primer-light text-primer">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold font-heading text-gelap">
              Manajemen Gerai & Cabang Dapur
            </h1>
          </div>
          <p className="text-xs text-gelap/60 mt-1">
            Kelola titik cabang restoran, alamat pengantaran subuh, dan staf penanggung jawab dapur di wilayah DIY.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsDialogOpen(true)}
          className="text-xs font-semibold shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Gerai Cabang
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-netral-border/60 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <label htmlFor="buyer-outlet-search" className="sr-only">
              Cari nama gerai, alamat, atau narahubung
            </label>
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gelap/40" aria-hidden="true" />
            <Input
              id="buyer-outlet-search"
              name="buyer-outlet-search"
              type="text"
              placeholder="Cari nama gerai, alamat, narahubung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-[11px] font-semibold text-gelap/50 uppercase mr-1 hidden lg:inline">
              Wilayah:
            </span>
            <button
              type="button"
              onClick={() => setRegencyFilter('ALL')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                regencyFilter === 'ALL'
                  ? 'bg-primer text-white font-semibold'
                  : 'bg-netral-canvas text-gelap/70 hover:bg-netral/40'
              }`}
            >
              Semua ({outlets.length})
            </button>
            <button
              type="button"
              onClick={() => setRegencyFilter('SLEMAN')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                regencyFilter === 'SLEMAN'
                  ? 'bg-primer text-white font-semibold'
                  : 'bg-netral-canvas text-gelap/70 hover:bg-netral/40'
              }`}
            >
              Sleman
            </button>
            <button
              type="button"
              onClick={() => setRegencyFilter('BANTUL')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                regencyFilter === 'BANTUL'
                  ? 'bg-primer text-white font-semibold'
                  : 'bg-netral-canvas text-gelap/70 hover:bg-netral/40'
              }`}
            >
              Bantul
            </button>
            <button
              type="button"
              onClick={() => setRegencyFilter('KULON_PROGO')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                regencyFilter === 'KULON_PROGO'
                  ? 'bg-primer text-white font-semibold'
                  : 'bg-netral-canvas text-gelap/70 hover:bg-netral/40'
              }`}
            >
              Kulon Progo
            </button>
            <button
              type="button"
              onClick={() => setRegencyFilter('GUNUNGKIDUL')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                regencyFilter === 'GUNUNGKIDUL'
                  ? 'bg-primer text-white font-semibold'
                  : 'bg-netral-canvas text-gelap/70 hover:bg-netral/40'
              }`}
            >
              Gunungkidul
            </button>
            <button
              type="button"
              onClick={() => setRegencyFilter('KOTA_YOGYAKARTA')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                regencyFilter === 'KOTA_YOGYAKARTA'
                  ? 'bg-primer text-white font-semibold'
                  : 'bg-netral-canvas text-gelap/70 hover:bg-netral/40'
              }`}
            >
              Kota Yogya
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <OutletSkeleton />
      ) : filteredOutlets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutlets.map((outlet) => (
            <OutletCard
              key={outlet.id}
              outlet={outlet}
              onSelect={(selected) => {
                alert(`Pengaturan Gerai: ${selected.name} (${selected.regency})`);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-netral-border/60 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-netral-canvas flex items-center justify-center text-gelap/40 mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gelap">Tidak Ada Gerai Ditemukan</h3>
          <p className="text-xs text-gelap/60 max-w-sm mx-auto">
            Tidak ada gerai cabang yang cocok dengan kata kunci pencarian atau filter wilayah terpilih.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setRegencyFilter('ALL');
            }}
            className="text-xs mt-2"
          >
            Reset Filter Pencarian
          </Button>
        </div>
      )}

      <div className="bg-white p-3.5 rounded-xl border border-netral-border/60 flex items-center justify-between text-xs text-gelap/70">
        <div>
          Menampilkan <strong>{filteredOutlets.length}</strong> dari <strong>{outlets.length}</strong> gerai terdaftar
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="px-2.5 py-1 rounded border border-netral-border bg-netral-canvas opacity-50 cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <span className="px-2.5 py-1 font-bold text-primer bg-primer-light rounded">
            1
          </span>
          <button
            type="button"
            disabled
            className="px-2.5 py-1 rounded border border-netral-border bg-netral-canvas opacity-50 cursor-not-allowed"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      <AddOutletDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleAddOutletSuccess}
      />
    </div>
  );
}
