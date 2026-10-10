import type { Metadata } from 'next';
import { Layers, Users, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Simulasi Pooling Kuota Panen Kolektif | Portal HoReKa PasokMataram',
  description: 'Penggabungan kuota pesanan restoran untuk mencapai batas minimum panen Gapoktan dengan diskon volume.',
};

/**
 * Halaman Pooling Kuota Panen Kolektif untuk HoReKa.
 */
export default function BuyerPoolingPage() {
  const pools = [
    {
      id: 'POOL-BWR-SRI-09',
      commodity: 'Bawang Merah Srikayangan Super A',
      targetQuotaKg: 1000,
      currentCollectedKg: 850,
      participantsCount: 38,
      closingHoursLeft: 4,
      normalPricePerKg: 36000,
      pooledPricePerKg: 31000,
      savingPercent: 13.8,
      status: 'OPEN',
    },
    {
      id: 'POOL-CBI-PAN-05',
      commodity: 'Cabai Rawit Merah Panjatan Segar',
      targetQuotaKg: 500,
      currentCollectedKg: 490,
      participantsCount: 22,
      closingHoursLeft: 2,
      normalPricePerKg: 54000,
      pooledPricePerKg: 46500,
      savingPercent: 13.9,
      status: 'NEARING_TARGET',
    },
    {
      id: 'POOL-BRS-SEY-12',
      commodity: 'Beras Premium Pandan Wangi Seyegan',
      targetQuotaKg: 2000,
      currentCollectedKg: 2000,
      participantsCount: 45,
      closingHoursLeft: 0,
      normalPricePerKg: 17000,
      pooledPricePerKg: 14800,
      savingPercent: 12.9,
      status: 'LOCKED',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Pooling Kuota Panen Bersama Dapur Se-DIY
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Gabungkan volume belanja dapur Anda dengan kafe dan restoran lain untuk membuka kuota panen massal dengan harga petani.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {pools.map((pool) => {
          const progressPercent = Math.min(100, Math.round((pool.currentCollectedKg / pool.targetQuotaKg) * 100));
          return (
            <div
              key={pool.id}
              className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primer-light text-primer uppercase font-mono">
                      {pool.id}
                    </span>
                    <span className="text-xs text-gelap/60 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primer" />
                      <span>{pool.participantsCount} Dapur Bergabung</span>
                    </span>
                  </div>
                  <h2 className="text-base font-heading font-bold text-gelap mt-1">
                    {pool.commodity}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-gelap/60 uppercase">Harga Pooling:</div>
                    <div className="text-base font-heading font-extrabold text-primer font-mono tabular-nums">
                      Rp {pool.pooledPricePerKg.toLocaleString('id-ID')} / kg
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-status-success/10 text-status-success text-xs font-bold font-mono">
                    Hemat {pool.savingPercent}%
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gelap/70">
                    Terkumpul: <strong className="text-gelap font-mono tabular-nums">{pool.currentCollectedKg} kg</strong> dari target {pool.targetQuotaKg} kg
                  </span>
                  <span className="text-primer font-mono font-bold tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-netral-canvas overflow-hidden">
                  <div
                    className="h-full bg-primer rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-netral-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <span className="text-gelap/60">
                  {pool.closingHoursLeft > 0
                    ? `Batas waktu penggabungan kuota: ${pool.closingHoursLeft} jam lagi`
                    : 'Kuota telah terpenuhi & terkunci untuk panen'}
                </span>
                <button
                  type="button"
                  disabled={pool.status === 'LOCKED'}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold min-h-[44px] transition-colors ${
                    pool.status === 'LOCKED'
                      ? 'bg-netral-canvas text-gelap/40 cursor-not-allowed'
                      : 'bg-primer text-white hover:bg-primer-hover'
                  }`}
                >
                  <span>Ikut Alokasi Kuota</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
