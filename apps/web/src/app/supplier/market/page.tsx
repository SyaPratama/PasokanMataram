'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Star,
  ShieldCheck,
  CheckCircle2,
  X,
  TrendingUp,
  MessageSquare,
  Building2,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { z } from 'zod';

const SupplierProductSchema = z.object({
  id: z.string(),
  supplierTenantId: z.string(),
  supplierName: z.string(),
  name: z.string(),
  pricePerKg: z.number(),
  stockKg: z.number(),
  isAvailable: z.boolean(),
  createdAt: z.string(),
});
const SupplierProductResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SupplierProductSchema),
});
const CreatedProductResponseSchema = z.object({
  success: z.boolean(),
  data: SupplierProductSchema,
});
type SupplierProductApi = z.infer<typeof SupplierProductSchema>;

interface SupplierProductView {
  readonly id: string;
  readonly supplierTenantId: string;
  readonly supplierName: string;
  readonly name: string;
  readonly price: number;
  readonly stockAvailable: number;
  readonly isAvailable: boolean;
  readonly isReadyStock: boolean;
}

function toSupplierProductView(product: SupplierProductApi): SupplierProductView {
  return {
    id: product.id,
    supplierTenantId: product.supplierTenantId,
    supplierName: product.supplierName,
    name: product.name,
    price: product.pricePerKg,
    stockAvailable: product.stockKg,
    isAvailable: product.isAvailable,
    isReadyStock: product.isAvailable,
  };
}

export default function SupplierMarketPage() {
  const [activeTab, setActiveTab] = React.useState<'etalase' | 'ulasan_saya' | 'profil_pembeli'>('etalase');
  const [products, setProducts] = React.useState<SupplierProductView[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/supplier/products')
      .then(async (response) => {
        if (!response.ok) throw new Error('Katalog supplier tidak tersedia.');
        const parsed = SupplierProductResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons katalog tidak valid.');
        setProducts(parsed.data.data.map(toSupplierProductView));
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Katalog supplier tidak tersedia.');
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, []);
  const [newProductName, setNewProductName] = React.useState('');
  const [newProductPrice, setNewProductPrice] = React.useState('');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    try {
      const response = await fetch('/api/v1/supplier/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          price: Number(newProductPrice),
          stockAvailable: 0,
          isReadyStock: true,
        }),
      });
      const parsed = CreatedProductResponseSchema.safeParse(await response.json());
      if (!response.ok || !parsed.success || !parsed.data.success) throw new Error('Produk supplier gagal disimpan.');
      setProducts((current) => [toSupplierProductView(parsed.data.data), ...current]);
      setIsAddModalOpen(false);
      setNewProductName('');
      setNewProductPrice('');
      setToastMessage('Produk berhasil disimpan.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : 'Produk supplier gagal disimpan.');
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-primer-light border border-primer/20 text-primer font-semibold text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primer shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-primer hover:opacity-70 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
              Etalase Pangan &amp; Reputasi Pembeli
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sekunder-light text-sekunder font-extrabold border border-sekunder/20">
              Mitra Pemasok DIY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Kelola dagangan etalase Anda yang dilihat langsung oleh kepala dapur HoReKa, pantau ulasan kualitas barang, dan lihat reputasi bisnis calon pembeli.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Pasang Dagangan Baru</span>
          </button>
          <Link
            href="/supplier/forecast"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aksen-light border border-aksen/30 text-aksen-dark text-xs font-bold hover:bg-aksen/20 min-h-[44px] whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 text-aksen-dark" />
            <span>Prediksi Harga Panen</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-netral-border/70 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('etalase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
            activeTab === 'etalase'
              ? 'bg-primer text-white shadow-xs'
              : 'bg-white border border-netral-border text-gelap/75 hover:bg-netral-canvas'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Etalase Dagangan Saya ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ulasan_saya')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
            activeTab === 'ulasan_saya'
              ? 'bg-primer text-white shadow-xs'
              : 'bg-white border border-netral-border text-gelap/75 hover:bg-netral-canvas'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ulasan dari Pembeli Resto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profil_pembeli')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5 ${
            activeTab === 'profil_pembeli'
              ? 'bg-primer text-white shadow-xs'
              : 'bg-white border border-netral-border text-gelap/75 hover:bg-netral-canvas'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Reputasi Pembeli HoReKa</span>
        </button>
      </div>

      {activeTab === 'etalase' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs animate-pulse h-56" />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-netral-border/80 shadow-xs">
              <h3 className="text-base font-bold text-gelap font-heading mb-1">
                {loadError ? 'Katalog Tidak Tersedia' : 'Belum Ada Produk'}
              </h3>
              <p className="text-xs text-gelap/60">
                {loadError || 'Belum ada dagangan aktif yang terdaftar di etalase Anda.'}
              </p>
            </div>
          ) : (
            products.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between hover:border-primer transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer font-mono uppercase">
                      Komoditas
                    </span>
                    <span className="text-xs font-mono text-status-success flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {item.isReadyStock ? 'Tersedia' : 'Tidak tersedia'}
                    </span>
                  </div>
                  <h2 className="text-base font-heading font-bold text-gelap">{item.name}</h2>
                  <p className="text-xs text-gelap/70 mt-1 leading-relaxed line-clamp-2">
                    Supplier: {item.supplierName}
                  </p>
                  <div className="mt-3 text-xs text-gelap/60">
                    <span className="font-mono">Stok: <strong>{item.stockAvailable} kg</strong></span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-netral-border/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gelap/60 uppercase">Harga per kg:</div>
                    <div className="text-lg font-heading font-extrabold text-primer font-mono tabular-nums">
                      Rp {item.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-status-success bg-status-success/10 px-2.5 py-1 rounded-lg">
                    Tayang di Katalog
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {activeTab === 'ulasan_saya' && (
        <div className="p-8 text-center bg-white rounded-2xl border border-netral-border/80 shadow-xs">
          <h3 className="text-sm font-bold text-gelap font-heading mb-1">Belum Ada Data Ulasan</h3>
          <p className="text-xs text-gelap/60">Ulasan mitra tampil setelah transaksi tersimpan.</p>
        </div>
      )}

      {activeTab === 'profil_pembeli' && (
        <div className="p-8 text-center bg-white rounded-2xl border border-netral-border/80 shadow-xs">
          <h3 className="text-sm font-bold text-gelap font-heading mb-1">Belum Ada Data Pembeli</h3>
          <p className="text-xs text-gelap/60">Profil pembeli tampil setelah data reputasi tersedia.</p>
        </div>
      )}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-netral-border space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-netral-border/70 pb-3">
              <h3 className="font-heading font-extrabold text-base text-gelap">
                Pasang SKU Dagangan Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gelap/60 hover:text-gelap"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gelap mb-1">Nama Produk / Potongan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Fillet Paha Ayam, Telur Tray 30, Bawang 25kg"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-netral-border text-xs text-gelap focus:outline-none focus:ring-2 focus:ring-primer min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gelap mb-1">Harga per kg (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Contoh: 36000"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-netral-border text-xs text-gelap focus:outline-none focus:ring-2 focus:ring-primer min-h-[40px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-netral-border text-xs font-semibold text-gelap hover:bg-netral-canvas min-h-[40px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[40px] shadow-xs"
                >
                  Tayangkan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
