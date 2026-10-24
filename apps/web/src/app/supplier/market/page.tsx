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
  Layers,
} from 'lucide-react';
import {
  MOCK_ECOSYSTEM_PRODUCTS,
  MOCK_B2B_REVIEWS,
} from '../../../lib/supplier-ecosystem-mock';
import type { SupplierProduct } from '@pasok/domain';

const BUYER_PROFILES = [
  {
    id: 'buyer-01',
    name: 'Kopi Klotok Heritage Pakem',
    businessType: 'Restoran Tradisional & Kafe',
    regency: 'Sleman',
    kybStatus: 'VERIFIED',
    ratingAvg: 4.96,
    completedPoCount: 142,
    punctualityRate: '99.2%',
    reputationNote: 'Pelanggan skala besar, timbangan tara-nol disiplin, pencairan escrow instan.',
  },
  {
    id: 'buyer-02',
    name: 'Filosofi Kopi Merapi Resto',
    businessType: 'Kafe Spesialis & Resto',
    regency: 'Sleman',
    kybStatus: 'VERIFIED',
    ratingAvg: 4.90,
    completedPoCount: 88,
    punctualityRate: '98.5%',
    reputationNote: 'Mitra cold-chain tertib, jadwal drop-off pagi konsisten, komunikasi cepat.',
  },
  {
    id: 'buyer-03',
    name: 'Gudeg Yu Djum Wijilan 167',
    businessType: 'Restoran Ikonik Nusantara',
    regency: 'Kota Yogyakarta',
    kybStatus: 'VERIFIED',
    ratingAvg: 4.88,
    completedPoCount: 210,
    punctualityRate: '99.5%',
    reputationNote: 'Volume pasokan daging & telur sangat stabil tiap pekan, mitra terpercaya.',
  },
];

export default function SupplierMarketPage() {
  const [activeTab, setActiveTab] = React.useState<'etalase' | 'ulasan_saya' | 'profil_pembeli'>('etalase');
  const [products, setProducts] = React.useState<SupplierProduct[]>(
    MOCK_ECOSYSTEM_PRODUCTS.filter((p) => p.supplierName.includes('Turi') || p.supplierName.includes('Panjatan'))
  );
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newProductName, setNewProductName] = React.useState('');
  const [newProductCategory, setNewProductCategory] = React.useState('Unggas & Telur');
  const [newProductPrice, setNewProductPrice] = React.useState('');
  const [newProductUnit, setNewProductUnit] = React.useState('kg');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const newProd: SupplierProduct = {
      id: `prod-custom-${Date.now()}`,
      supplierTenantId: '11111111-1111-4111-a111-111111111111',
      supplierName: 'Peternakan Unggas Berkah Turi',
      name: newProductName,
      category: newProductCategory,
      skuCode: `SKU-${Date.now().toString().slice(-4)}`,
      unit: newProductUnit,
      price: Number(newProductPrice),
      minOrderQty: 5,
      stockAvailable: 150,
      leadTimeHours: 12,
      isReadyStock: true,
      fulfillmentType: 'DIRECT_DISPATCH',
      description: 'Produk pangan lokal segar langsung dari sentra peternakan/kebun berakreditasi.',
      hasColdChainRequirement: newProductCategory.includes('Unggas') || newProductCategory.includes('Daging'),
      certificationsSummary: ['NKV-1', 'Halal'],
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setNewProductName('');
    setNewProductPrice('');
    setToastMessage(`SKU "${newProd.name}" berhasil dipajang di Etalase Toko!`);
    setTimeout(() => setToastMessage(null), 3500);
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
          {products.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between hover:border-primer transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer font-mono uppercase">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-gelap/60 flex items-center gap-1">
                    {item.isReadyStock ? (
                      <span className="text-status-success font-semibold flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Ready Chiller
                      </span>
                    ) : (
                      <span className="text-aksen-dark font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Pool Panen
                      </span>
                    )}
                  </span>
                </div>

                <h2 className="text-base font-heading font-bold text-gelap">
                  {item.name}
                </h2>
                <p className="text-xs text-gelap/70 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-3 text-xs text-gelap/60 flex items-center gap-2">
                  <span className="font-mono">Stok: <strong>{item.stockAvailable} {item.unit}</strong></span>
                  <span>•</span>
                  <span>Min. Order: <strong>{item.minOrderQty} {item.unit}</strong></span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-netral-border/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gelap/60 uppercase">Harga Jual Grosir:</div>
                  <div className="text-lg font-heading font-extrabold text-primer font-mono tabular-nums">
                    Rp {item.price.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-gelap/60"> / {item.unit}</span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-status-success bg-status-success/10 px-2.5 py-1 rounded-lg">
                  Tayang di Katalog
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ulasan_saya' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gelap uppercase tracking-wider">
                Rating Kepuasan Mitra HoReKa
              </div>
              <div className="text-2xl font-black font-heading text-primer flex items-center gap-1.5 mt-0.5">
                <Star className="w-5 h-5 fill-aksen text-aksen" />
                <span>4.95</span>
                <span className="text-xs font-normal text-gelap/60">/ 5.0 (38 ulasan terverifikasi)</span>
              </div>
            </div>
            <div className="text-right text-xs text-gelap/70">
              <span className="font-semibold text-status-success">100% Pesanan Lolos QC</span>
              <div className="text-[11px] text-gelap/50">Timbangan Tara-Nol Hub Terverifikasi</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_B2B_REVIEWS.filter((r) => r.direction === 'BUYER_TO_SUPPLIER').map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-gelap">{rev.fromBusinessName}</div>
                  <div className="flex items-center text-aksen font-bold text-xs">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-aksen" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gelap/80 italic">&ldquo;{rev.comment}&rdquo;</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rev.tags.map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primer-light text-primer">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profil_pembeli' && (
        <div className="space-y-4">
          <p className="text-xs text-gelap/70">
            Transparansi reputasi pembeli terverifikasi di D.I. Yogyakarta untuk membantu supplier menilai kelancaran pembayaran dan ketertiban dapur penerimaan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BUYER_PROFILES.map((buyer) => (
              <div key={buyer.id} className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gelap font-heading">{buyer.name}</h3>
                    <div className="text-xs text-gelap/60">{buyer.businessType} • {buyer.regency}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20">
                    {buyer.kybStatus}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-netral-canvas/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gelap/70">Rating Reputasi:</span>
                    <strong className="text-primer flex items-center">
                      <Star className="w-3 h-3 fill-aksen text-aksen mr-1" />
                      {buyer.ratingAvg}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gelap/70">Transaksi Berhasil:</span>
                    <strong className="font-mono">{buyer.completedPoCount} PO</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gelap/70">Kecepatan Verifikasi:</span>
                    <strong className="text-status-success font-mono">{buyer.punctualityRate}</strong>
                  </div>
                </div>

                <p className="text-xs text-gelap/70 italic">
                  &ldquo;{buyer.reputationNote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
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
                <label className="block text-xs font-bold text-gelap mb-1">Kategori Pangan</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-netral-border text-xs text-gelap focus:outline-none focus:ring-2 focus:ring-primer min-h-[40px]"
                >
                  <option value="Unggas & Telur">Unggas & Telur (Sleman & Kulon Progo)</option>
                  <option value="Daging Sapi Segar">Daging Sapi Segar (RPH Segoroyoso & Giwangan)</option>
                  <option value="Susu Segar & Olahan">Susu Segar & Olahan (Kaliurang & Pakem)</option>
                  <option value="Bumbu & Olahan">Bumbu & Olahan Tradisional (Krapyak)</option>
                  <option value="Hasil Tani Segar">Hasil Tani Segar (Gapoktan DIY)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gelap mb-1">Harga Grosir (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 36000"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-netral-border text-xs text-gelap focus:outline-none focus:ring-2 focus:ring-primer min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gelap mb-1">Satuan</label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-netral-border text-xs text-gelap focus:outline-none focus:ring-2 focus:ring-primer min-h-[40px]"
                  >
                    <option value="kg">kg</option>
                    <option value="ekor">ekor</option>
                    <option value="tray">tray (30 butir)</option>
                    <option value="jerigen">jerigen (5L)</option>
                    <option value="karung">karung (25kg)</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
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
