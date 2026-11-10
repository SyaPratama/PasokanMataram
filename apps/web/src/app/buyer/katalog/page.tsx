'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, TrendingUp } from 'lucide-react';
import { KybBlockerModal } from '../../../components/shared/kyb-blocker-modal';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  supplierTenantId: z.string(),
  supplierName: z.string(),
  regency: z.string(),
  name: z.string(),
  pricePerKg: z.coerce.number(),
  stockKg: z.coerce.number(),
  isAvailable: z.boolean(),
  createdAt: z.string(),
});
const ProductResponseSchema = z.object({ success: z.boolean(), data: z.array(ProductSchema) });
const TenantResponseSchema = z.object({ success: z.boolean(), data: z.object({ kybStatus: z.string() }).optional() });

export default function BuyerKatalogPage() {
  const [products, setProducts] = React.useState<z.infer<typeof ProductSchema>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isKybVerified, setIsKybVerified] = React.useState(false);
  const [isKybModalOpen, setIsKybModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/v1/supplier/products')
      .then(async (response) => {
        if (!response.ok) throw new Error('Katalog supplier tidak tersedia.');
        const parsed = ProductResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons katalog tidak valid.');
        setProducts(parsed.data.data.filter((product) => product.isAvailable));
      })
      .catch((error: unknown) => setErrorMessage(error instanceof Error ? error.message : 'Katalog supplier tidak tersedia.'))
      .finally(() => setIsLoading(false));
    fetch('/api/v1/tenant/current')
      .then(async (response) => {
        if (!response.ok) return;
        const parsed = TenantResponseSchema.safeParse(await response.json());
        setIsKybVerified(parsed.success && parsed.data.data?.kybStatus === 'VERIFIED');
      })
      .catch(() => setIsKybVerified(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return product.name.toLowerCase().includes(query) || product.supplierName.toLowerCase().includes(query) || product.regency.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">Pusat Pasokan Bahan Pangan Yogyakarta</h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">Katalog komoditas supplier berdasarkan data yang tersimpan.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link href="/buyer/forecast" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-aksen-light border border-aksen/30 text-aksen-dark text-xs font-bold min-h-[44px]"><TrendingUp className="w-4 h-4" /><span>Prakiraan Harga</span></Link>
          <Link href="/buyer/orders" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primer text-white text-xs font-bold min-h-[44px]"><ShoppingBag className="w-4 h-4" /><span>Reservasi</span></Link>
        </div>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 text-gelap/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <label htmlFor="catalog-search" className="sr-only">Cari komoditas atau supplier</label>
        <input id="catalog-search" name="catalog-search" type="search" placeholder="Cari komoditas, supplier, atau kabupaten..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-netral-border/80 text-xs sm:text-sm text-gelap min-h-[44px]" />
      </div>
      {errorMessage && <div className="p-4 rounded-xl bg-status-danger/10 text-status-danger text-sm">{errorMessage}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? <div className="col-span-full p-8 text-center text-sm text-gelap/60">Memuat katalog...</div> : filteredProducts.length === 0 ? <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-netral-border/80">Belum ada data komoditas.</div> : filteredProducts.map((product) => (
          <article key={product.id} className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between gap-5">
            <div><div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer uppercase font-mono inline-block">{product.regency}</div><h2 className="text-base font-heading font-bold text-gelap leading-snug mt-2">{product.name}</h2><p className="text-xs text-gelap/70 mt-1.5">Supplier: {product.supplierName}</p><p className="text-xs text-gelap/60 mt-1">Stok tercatat: {product.stockKg.toLocaleString('id-ID')} kg</p></div>
            <div className="pt-3 border-t border-netral-border/60 flex items-center justify-between gap-3"><div><div className="text-[10px] text-gelap/60 uppercase tracking-wider">Harga tercatat</div><div className="text-lg font-heading font-extrabold text-primer font-mono tabular-nums">Rp {product.pricePerKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-gelap/60">/ kg</span></div></div><button type="button" disabled={isKybVerified} onClick={() => setIsKybModalOpen(true)} aria-label="Pemesanan belum tersedia" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-netral-border text-gelap/60 text-xs font-bold min-h-[44px] cursor-not-allowed"><ShoppingBag className="w-3.5 h-3.5" /><span>{isKybVerified ? 'Pemesanan API belum tersedia' : 'Verifikasi KYB diperlukan'}</span></button></div>
          </article>
        ))}
      </div>
      <KybBlockerModal isOpen={isKybModalOpen} onClose={() => setIsKybModalOpen(false)} actionAttempted="Pemesanan komoditas" />
    </div>
  );
}
