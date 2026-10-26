'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { Calculator, TrendingDown, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export function KalkulatorPenghematan() {
  const [dailyExpense, setDailyExpense] = useState<number>(3500000);
  const [outletCount, setOutletCount] = useState<number>(1);
  const [businessType, setBusinessType] = useState<'KAFE' | 'RESTO' | 'HOTEL'>('RESTO');
  const sliderId = useId();

  const monthlyTraditional = dailyExpense * 30 * outletCount;
  const estimatedSavingsPercent = businessType === 'HOTEL' ? 0.23 : businessType === 'RESTO' ? 0.21 : 0.18;
  const monthlySavings = Math.round(monthlyTraditional * estimatedSavingsPercent);
  const yearlySavings = monthlySavings * 12;

  const formatRupiah = (val: number) => {
    return 'Rp\u00A0' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <section id="kalkulator" className="py-16 px-4 sm:px-6 lg:px-8 bg-netral-surface/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primer-surface/10 text-primer-deep border border-primer-pendukung/30 mb-3">
            <Calculator className="w-3.5 h-3.5 text-primer-deep" aria-hidden="true" />
            Simulasi Efisiensi Pengadaan Dapur
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Hitung Potensi Penghematan Dapur Usaha Anda
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap/80 font-body">
            Bandingkan pengeluaran belanja eceran pasar harian dengan pengadaan terpadu dari ekosistem supplier pangan lokal D.I. Yogyakarta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-netral-border flex flex-col justify-between">
            <div className="space-y-6">
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
                      className={`px-1 sm:px-3 py-2.5 text-[10.5px] sm:text-xs font-semibold rounded-xl border transition-all text-center whitespace-nowrap min-h-[44px] flex items-center justify-center ${
                        businessType === type
                          ? 'bg-primer-deep text-white border-primer-deep shadow-xs'
                          : 'bg-netral-canvas text-gelap border-netral-border hover:bg-netral-surface'
                      }`}
                    >
                      {type === 'KAFE' ? (
                        <span>Kafe / Kedai</span>
                      ) : type === 'RESTO' ? (
                        <span>Restoran</span>
                      ) : (
                        <span>Hotel / Katering</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gelap uppercase tracking-wider mb-2">
                  Jumlah Gerai Cabang di DIY
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setOutletCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center ${
                        outletCount === num
                          ? 'bg-primer text-white border-primer shadow-xs'
                          : 'bg-netral-canvas text-gelap border-netral-border hover:bg-netral-surface'
                      }`}
                    >
                      {num} {num === 10 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={sliderId} className="text-xs font-bold text-gelap uppercase tracking-wider">
                    Estimasi Belanja Dapur / Hari per Gerai
                  </label>
                  <span className="text-sm font-extrabold text-primer font-heading font-mono tabular-nums">
                    {formatRupiah(dailyExpense)}
                  </span>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min={500000}
                  max={15000000}
                  step={250000}
                  value={dailyExpense}
                  onChange={(e) => setDailyExpense(Number(e.target.value))}
                  className="w-full accent-primer cursor-pointer h-2 bg-netral-border rounded-lg"
                  aria-label="Estimasi belanja dapur per hari"
                />
                <div className="flex justify-between text-[10px] text-gelap/60 mt-1 font-mono">
                  <span>Rp 500 rb</span>
                  <span>Rp 7.5 jt</span>
                  <span>Rp 15 jt</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center gap-2 text-xs text-gelap/70">
              <ShieldCheck className="w-4 h-4 text-primer shrink-0" />
              <span>Simulasi berdasarkan deviasi harga pasar eceran vs kontrak supplier pangan DIY 2026</span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-primer text-white p-6 sm:p-8 rounded-3xl shadow-xl ring-1 ring-white/20 flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-aksen-light mb-4">
                Estimasi Efisiensi Belanja
              </span>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/70">Potensi Hemat per Bulan</div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-0.5 font-mono tabular-nums">
                    {formatRupiah(monthlySavings)}
                  </div>
                  <div className="text-[11px] text-aksen-light mt-0.5">
                    Efisiensi sekitar {Math.round(estimatedSavingsPercent * 100)}% dari belanja tradisional
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-xs text-white/70">Potensi Hemat per Tahun</div>
                  <div className="text-xl sm:text-2xl font-extrabold font-heading text-white mt-0.5 font-mono tabular-nums">
                    {formatRupiah(yearlySavings)}
                  </div>
                </div>

                <ul className="space-y-2 pt-3 text-xs text-white/90">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-aksen shrink-0" />
                    <span>Bebas biaya mark-up tengkulak</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-aksen shrink-0" />
                    <span>Garansi timbangan digital 100% pas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-aksen shrink-0" />
                    <span>Pengiriman subuh tepat waktu</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/register"
                className="w-full py-3.5 px-6 rounded-full bg-sekunder text-white font-bold font-heading text-xs sm:text-sm text-center hover:bg-sekunder-hover transition-all flex items-center justify-center gap-2 shadow-md min-h-[44px]"
              >
                <span>Kunci Kuota Panen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
