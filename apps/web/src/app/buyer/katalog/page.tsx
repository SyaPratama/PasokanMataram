'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  X,
  Truck,
  Layers,
  Search,
  MessageSquare,
} from 'lucide-react';
import {
  MOCK_ECOSYSTEM_PRODUCTS,
  MOCK_LOCAL_SUPPLIERS,
  MOCK_B2B_REVIEWS,
} from '../../../lib/supplier-ecosystem-mock';
import { KybBlockerModal } from '../../../components/shared/kyb-blocker-modal';
import type { SupplierProduct, SupplierProfile, B2BReview } from '@pasok/domain';

const CATEGORIES = [
  'Semua',
  'Unggas & Telur',
  'Daging Sapi Segar',
  'Susu Segar & Olahan',
  'Bumbu & Olahan',
  'Hasil Tani Segar',
];

export default function BuyerKatalogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('Semua');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeSupplierModal, setActiveSupplierModal] = React.useState<SupplierProfile | null>(null);
  const [orderNotice, setOrderNotice] = React.useState<string | null>(null);
  const [isKybVerified, setIsKybVerified] = React.useState<boolean>(true);
  const [isKybModalOpen, setIsKybModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/pasok_kyb_status=([^;]+)/);
      if (match && match[1]) {
        setIsKybVerified(match[1] === 'VERIFIED');
      }
    }
  }, []);
  const filteredProducts = MOCK_ECOSYSTEM_PRODUCTS.filter((item) => {
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenSupplier = (supplierName: string) => {
    const profile = MOCK_LOCAL_SUPPLIERS.find((s) => s.businessName === supplierName) || null;
    setActiveSupplierModal(profile);
  };

  const handleQuickAdd = (productName: string) => {
    if (!isKybVerified) {
      setIsKybModalOpen(true);
      return;
    }
    setOrderNotice(`"${productName}" berhasil ditambahkan ke Faktur Terpadu Dapur!`);
    setTimeout(() => setOrderNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {orderNotice && (
        <div className="p-3.5 rounded-xl bg-primer-light border border-primer/20 text-primer font-semibold text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primer shrink-0" />
            <span>{orderNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setOrderNotice(null)}
            className="text-primer hover:opacity-70 p-1"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
              Pusat Pasokan Bahan Pangan Yogyakarta
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primer-light text-primer font-extrabold border border-primer/20">
              Multi-Supplier
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Pusat pengadaan terintegrasi seluruh supplier pangan lokal DIY: daging sapi Segoroyoso, ayam Turi, susu Kaliurang, dan hasil panen Gapoktan dalam satu faktur terpadu.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/buyer/forecast"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aksen-light border border-aksen/30 text-aksen-dark text-xs font-bold hover:bg-aksen/20 min-h-[44px] transition-colors whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 text-aksen-dark" />
            <span>Prakiraan Harga AI</span>
          </Link>
          <Link
            href="/buyer/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] transition-colors whitespace-nowrap shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span>Faktur Terpadu</span>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gelap/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ayam potong, daging sapi, susu pasteurisasi, cabai, atau nama supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-netral-border/80 text-xs sm:text-sm text-gelap placeholder:text-gelap/40 focus:outline-none focus:ring-2 focus:ring-primer min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[38px] shrink-0 ${
                  isSelected
                    ? 'bg-primer text-white shadow-xs'
                    : 'bg-white border border-netral-border/80 text-gelap/80 hover:border-primer/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between hover:border-primer transition-all hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer uppercase font-mono">
                  {prod.category}
                </span>
                <span className="text-[11px] font-semibold text-gelap/70 flex items-center gap-1 font-mono">
                  {prod.fulfillmentType === 'DIRECT_DISPATCH' ? (
                    <span className="inline-flex items-center gap-1 text-sekunder">
                      <Truck className="w-3 h-3" /> Ready Chiller
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-aksen-dark">
                      <Layers className="w-3 h-3" /> Pool Gapoktan
                    </span>
                  )}
                </span>
              </div>

              <h2 className="text-base font-heading font-bold text-gelap leading-snug">
                {prod.name}
              </h2>

              <p className="text-xs text-gelap/70 mt-1.5 leading-relaxed line-clamp-2">
                {prod.description}
              </p>
              <div className="mt-3.5 pt-3 border-t border-netral-border/50">
                <button
                  type="button"
                  onClick={() => handleOpenSupplier(prod.supplierName)}
                  className="text-left w-full group flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-gelap group-hover:text-primer transition-colors truncate">
                      {prod.supplierName}
                    </div>
                    <div className="text-[11px] text-gelap/60 flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center text-aksen font-bold">
                        <Star className="w-3 h-3 fill-aksen mr-0.5" /> 4.9
                      </span>
                      <span>•</span>
                      <span>Sertifikasi: {prod.certificationsSummary.join(', ')}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-primer font-semibold underline shrink-0 whitespace-nowrap">
                    Profil & Review
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-netral-border/60 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-gelap/60 uppercase tracking-wider">
                  Harga Grosir:
                </div>
                <div className="text-lg font-heading font-extrabold text-primer font-mono tabular-nums">
                  Rp {prod.price.toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-gelap/60"> / {prod.unit}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickAdd(prod.name)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-xs whitespace-nowrap shrink-0 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Keranjang</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {activeSupplierModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-netral-border p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-netral-border/70 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primer-light text-primer font-bold uppercase">
                    {activeSupplierModal.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gelap/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sekunder" />
                    {activeSupplierModal.regency}, D.I. Yogyakarta
                  </span>
                </div>
                <h3 className="text-lg font-heading font-extrabold text-gelap mt-1">
                  {activeSupplierModal.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSupplierModal(null)}
                className="p-1 rounded-lg text-gelap/60 hover:text-gelap hover:bg-netral-canvas"
                aria-label="Tutup jendela"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gelap/80 leading-relaxed">
              {activeSupplierModal.bio}
            </p>

            <div className="p-3.5 rounded-xl bg-netral-canvas/60 border border-netral-border/70">
              <div className="text-[11px] font-bold text-gelap uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primer" />
                Sertifikasi Legalitas & Higienitas Resmi
              </div>
              <div className="space-y-1.5">
                {activeSupplierModal.certifications.map((cert) => (
                  <div key={cert.number} className="text-xs text-gelap/80 flex items-center justify-between">
                    <span className="font-semibold">{cert.name}</span>
                    <span className="font-mono text-primer font-bold">{cert.number}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-gelap uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primer" />
                  Ulasan Pembeli Terverifikasi ({activeSupplierModal.reviewCount})
                </h4>
                <div className="text-xs font-bold text-aksen flex items-center">
                  <Star className="w-3.5 h-3.5 fill-aksen mr-1" />
                  {activeSupplierModal.ratingAvg} / 5.0
                </div>
              </div>

              <div className="space-y-3">
                {MOCK_B2B_REVIEWS.filter((r) => r.toTenantId === activeSupplierModal.tenantId || r.direction === 'BUYER_TO_SUPPLIER').map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-white border border-netral-border/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gelap">{rev.fromBusinessName}</span>
                      <div className="flex items-center text-aksen font-bold">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-aksen" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gelap/80 italic">&ldquo;{rev.comment}&rdquo;</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rev.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-netral-canvas text-gelap/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSupplierModal(null)}
                className="px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px]"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      <KybBlockerModal
        isOpen={isKybModalOpen}
        onClose={() => setIsKybModalOpen(false)}
        actionAttempted="Pemesanan Komoditas ke Faktur Dapur"
      />
    </div>
  );
}
