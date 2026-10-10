import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import { MOCK_COMMODITIES } from '../../../lib/mock-data';

export const metadata: Metadata = {
  title: 'Katalog Komoditas Mitra Gapoktan | Portal HoReKa PasokMataram',
  description: 'Daftar komoditas pertanian siap panen dari sentra Kulon Progo, Bantul, dan Sleman dengan spesifikasi grade A.',
};

/**
 * Halaman Katalog Komoditas untuk Pembeli HoReKa.
 */
export default function BuyerKatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Katalog Komoditas Pangan Segar DIY
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Pilihan komoditas langsung dari kelompok tani mitra bersertifikasi dengan harga transparan tingkat petani.
          </p>
        </div>
        <Link
          href="/buyer/forecast"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aksen-light border border-aksen/30 text-aksen-dark text-xs font-bold hover:bg-aksen/20 min-h-[44px] transition-colors"
        >
          <TrendingUp className="w-4 h-4 text-aksen-dark" />
          <span>Lihat Prediksi Tren Harga AI</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_COMMODITIES.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between hover:border-primer transition-all hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer uppercase">
                  Grade A Super
                </span>
                <span className="text-[11px] font-mono font-semibold text-gelap/60">
                  {item.grade}
                </span>
              </div>

              <h2 className="text-base font-heading font-bold text-gelap">
                {item.name}
              </h2>

              <p className="text-xs text-gelap/70 mt-1.5 leading-relaxed line-clamp-2">
                {item.description}
              </p>

              <div className="mt-3 text-xs text-gelap/70 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sekunder" />
                <span>{item.originDistrict}, {item.originRegency.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-netral-border/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gelap/60 uppercase tracking-wider">
                  Harga Patokan:
                </div>
                <div className="text-lg font-heading font-extrabold text-primer font-mono tabular-nums">
                  Rp {item.basePricePerKg.toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-gelap/60"> / kg</span>
                </div>
              </div>

              <Link
                href="/buyer/orders"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px]"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Pesan</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
