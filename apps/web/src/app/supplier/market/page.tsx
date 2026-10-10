import type { Metadata } from 'next';
import Link from 'next/link';
import { Store, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { MOCK_COMMODITIES } from '../../../lib/mock-data';

export const metadata: Metadata = {
  title: 'Sentra Hub Pasar Pangan DIY | Portal Gapoktan PasokMataram',
  description: 'Peluang permintaan pasokan komoditas pangan dari jaringan restoran & kafe seluruh D.I. Yogyakarta.',
};

/**
 * Halaman Sentra Hub Pasar untuk Petani / Gapoktan.
 */
export default function SupplierMarketPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Sentra Pasar & Peluang Pasok HoReKa
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Daftar komoditas dengan permintaan aktif dari jaringan restoran Yogyakarta yang siap ditampung Hub Transit.
          </p>
        </div>
        <Link
          href="/supplier/forecast"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aksen-light border border-aksen/30 text-aksen-dark text-xs font-bold hover:bg-aksen/20 min-h-[44px] transition-colors"
        >
          <TrendingUp className="w-4 h-4 text-aksen-dark" />
          <span>Lihat Prediksi Harga Panen AI</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_COMMODITIES.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between hover:border-primer transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sekunder-light text-sekunder uppercase font-mono">
                  Permintaan Tinggi
                </span>
                <span className="text-xs font-mono text-gelap/60">
                  Target: {item.grade}
                </span>
              </div>

              <h2 className="text-base font-heading font-bold text-gelap">
                {item.name}
              </h2>
              <p className="text-xs text-gelap/70 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-netral-border/60 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gelap/60 uppercase">Harga Tampung Hub:</div>
                <div className="text-lg font-heading font-extrabold text-primer font-mono tabular-nums">
                  Rp {item.basePricePerKg.toLocaleString('id-ID')}
                  <span className="text-xs font-normal text-gelap/60"> / kg</span>
                </div>
              </div>

              <Link
                href="/supplier/allocations"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px]"
              >
                <span>Setor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
