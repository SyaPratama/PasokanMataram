'use client';

/**
 * @file apps/web/src/app/_components/kalkulator-penghematan.tsx
 * @description Kalkulator interaktif estimasi penghematan pengadaan dapur HoReKa.
 * Mematuhi Prinsip VIII & IX Konstitusi PasokMataram v1.6.0 & WCAG 2.1 AA.
 */

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { Calculator, TrendingDown, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export function KalkulatorPenghematan() {
  const [dailyExpense, setDailyExpense] = useState<number>(3500000);
  const [outletCount, setOutletCount] = useState<number>(1);
  const [businessType, setBusinessType] = useState<'KAFE' | 'RESTO' | 'HOTEL'>('RESTO');
  const sliderId = useId();

  // Formula penghematan B2B vs pasar eceran: rata-rata 21%
  const monthlyTraditional = dailyExpense * 30 * outletCount;
  const estimatedSavingsPercent = businessType === 'HOTEL' ? 0.23 : businessType === 'RESTO' ? 0.21 : 0.18;
  const monthlySavings = Math.round(monthlyTraditional * estimatedSavingsPercent);
  const yearlySavings = monthlySavings * 12;

  const formatRupiah = (val: number) => {
    return 'Rp\u00A0' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <section id="kalkulator" className="py-16 px-4 sm:px-6 lg:px-8 bg-netral-surface/60 border-y border-netral-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primer-surface/10 text-primer-deep border border-primer-pendukung/30 mb-3">
            <Calculator className="w-3.5 h-3.5 text-primer-deep" aria-hidden="true" />
            Simulasi Efisiensi Pengadaan Dapur
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Hitung Potensi Penghematan Dapur Usaha Anda
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap-muted font-body">
            Bandingkan pengeluaran belanja eceran pasar harian dengan kontrak pasokan langsung dari Gapoktan D.I. Yogyakarta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Panel Input Interaktif */}
          <div className="lg:col-span-7 bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-netral-border flex flex-col justify-between">
            <div className="space-y-6">
              {/* Tipe Bisnis */}
              <div>
                <label className="block text-xs font-bold text-gelap uppercase tracking-wider mb-2">
                  Kategori Usaha Kuliner
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {(['KAFE', 'RESTO', 'HOTEL'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBusinessType(type)}
                      className={`px-1 sm:px-3 py-2.5 text-[10.5px] sm:text-xs font-semibold rounded-lg border transition-all text-center whitespace-nowrap min-h-[44px] flex items-center justify-center ${
                        businessType === type
                          ? 'bg-primer-deep text-white border-primer-deep shadow-sm'
                          : 'bg-netral-canvas text-gelap border-netral-border hover:bg-netral-surface'
                      }`}
                    >
                      {type === 'KAFE' ? (
                        <span>Kafe / Kedai</span>
                      ) : type === 'RESTO' ? (
                        <>
                          <span className="hidden md:inline">Restoran / Rumah Makan</span>
                          <span className="md:hidden">Restoran</span>
                        </>
                      ) : (
                        <span>Hotel / Katering</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jumlah Gerai Cabang */}
              <div>
                <label className="block text-xs font-bold text-gelap uppercase tracking-wider mb-2">
                  Jumlah Gerai Fisik (Outlet)
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setOutletCount(count)}
                      className={`px-1 sm:px-2.5 py-2 text-[10.5px] sm:text-xs font-semibold rounded-lg border transition-all text-center whitespace-nowrap min-h-[44px] flex items-center justify-center ${
                        outletCount === count
                          ? 'bg-primer-deep text-white border-primer-deep shadow-sm'
                          : 'bg-netral-canvas text-gelap border-netral-border hover:bg-netral-surface'
                      }`}
                    >
                      {count === 5 ? (
                        <>
                          <span className="hidden sm:inline">5+ Cabang</span>
                          <span className="sm:hidden">5+ Gerai</span>
                        </>
                      ) : (
                        `${count} Gerai`
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Belanja Harian */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label htmlFor={sliderId} className="text-xs font-bold text-gelap uppercase tracking-wider truncate">
                    <span className="hidden sm:inline">Estimasi Belanja Dapur per Gerai / Hari</span>
                    <span className="sm:hidden">Belanja Dapur / Hari</span>
                  </label>
                  <span className="text-sm sm:text-base font-extrabold text-primer-deep font-mono whitespace-nowrap shrink-0">
                    {formatRupiah(dailyExpense)}
                  </span>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min={1000000}
                  max={20000000}
                  step={500000}
                  value={dailyExpense}
                  onChange={(e) => setDailyExpense(Number(e.target.value))}
                  aria-label="Estimasi belanja dapur per hari"
                  className="w-full h-2 bg-netral-border rounded-lg appearance-none cursor-pointer accent-primer-deep"
                />
                <div className="flex justify-between text-[11px] text-gelap-muted mt-1 font-mono">
                  <span>Rp 1 Jt</span>
                  <span>Rp 10 Jt</span>
                  <span>Rp 20 Jt</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-netral-border text-xs text-gelap-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primer-deep shrink-0" aria-hidden="true" />
              <span>Simulasi mengacu pada disparitas harga komoditas cabai, bawang, dan beras di D.I. Yogyakarta 2026.</span>
            </div>
          </div>

          {/* Panel Hasil Estimasi */}
          <div className="lg:col-span-5 bg-primer-deep text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col justify-between border border-primer-pendukung/30">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-aksen-light border border-white/20 mb-3">
                <TrendingDown className="w-3.5 h-3.5 text-aksen-light" aria-hidden="true" />
                Estimasi Penghematan Margin
              </span>

              <p className="text-xs text-netral-light/90 uppercase tracking-wider font-semibold">
                Potensi Penghematan per Bulan
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-white font-heading mt-1 whitespace-nowrap">
                {formatRupiah(monthlySavings)}
              </div>
              <p className="text-xs text-netral-light/90 mt-1 font-body">
                Atau setara dengan <strong className="text-white font-bold whitespace-nowrap">{formatRupiah(yearlySavings)}</strong> per tahun.
              </p>

              <div className="mt-6 space-y-2.5 pt-6 border-t border-white/15 text-xs font-body">
                <div className="flex items-start gap-2 text-white">
                  <Check className="w-4 h-4 text-cta-green-light shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Harga terkunci dari petani (bebas spekulasi tengkulak).</span>
                </div>
                <div className="flex items-start gap-2 text-white">
                  <Check className="w-4 h-4 text-cta-green-light shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Kirim subuh 04:30 WIB langsung ke masing-masing cabang gerai.</span>
                </div>
                <div className="flex items-start gap-2 text-white">
                  <Check className="w-4 h-4 text-cta-green-light shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Dana escrow hanya cair setelah QC digital koki disetujui.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15">
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sekunder hover:bg-sekunder-hover text-white text-xs font-bold font-heading transition-all shadow-md hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-white min-h-[44px]"
              >
                <span>Mulai Kunci Harga Dapur Anda</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
