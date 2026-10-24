'use client';

import React from 'react';
import { ShieldCheck, Truck, ArrowRight, CalendarClock, Scale, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function MekanismePoolingSection() {
  return (
    <section id="mekanisme" className="py-16 md:py-24 bg-netral-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-sekunder-dark">
            Transparansi Rantai Pasok
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Mekanisme Pooling: Harga Grosir untuk Dapur Mandiri
          </h2>
          <p className="mt-3 text-sm md:text-base text-gelap/85 font-body">
            Kafe dan resto independen sering membayar premi 35% lebih mahal di pasar eceran karena volume harian di bawah muatan truk. PasokMataram menggabungkan alokasi dapur Anda dalam satu kontrak panen kolektif.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-netral-border/70 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-primer text-white flex items-center justify-center font-heading font-extrabold text-sm mb-4 shadow-xs">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Buka Kuota Pasokan</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Supplier pangan dan Gapoktan mitra mengumumkan ketersediaan pasokan dengan batas minimum tonase muatan truk (25 kg hingga 2 ton).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-netral-border/50 text-[11px] font-semibold text-primer flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Jadwal Terbuka Transparan</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-netral-border/70 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-primer text-white flex items-center justify-center font-heading font-extrabold text-sm mb-4 shadow-xs">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Kunci Alokasi & Escrow</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Dapur memesan porsi (25 sampai 100 kg). Saldo pesanan dikunci dengan aman di rekening penampung escrow terproteksi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-netral-border/50 text-[11px] font-semibold text-sekunder-dark flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dana Terproteksi 100%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-netral-border/70 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-primer text-white flex items-center justify-center font-heading font-extrabold text-sm mb-4 shadow-xs">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">QC Hub Transit Bantul</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Panen tiba sore hari di Hub Transit untuk kalibrasi timbangan digital presisi dan penyortiran fisik grade A.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-netral-border/50 text-[11px] font-semibold text-aksen-dark flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Zero Selisih Timbangan</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-netral-border/70 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-primer text-white flex items-center justify-center font-heading font-extrabold text-sm mb-4 shadow-xs">
                4
              </div>
              <h3 className="font-heading font-bold text-base text-gelap">Drop Subuh & Rilis Dana</h3>
              <p className="mt-2 text-xs text-gelap/85 font-medium leading-relaxed font-body">
                Armada mengantar komoditas pukul 04:30 WIB. Koki memvalidasi kualitas via QC digital sebelum dana escrow dilepas ke supplier.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-netral-border/50 text-[11px] font-semibold text-primer flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Drop Pukul 04:30 Subuh</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-netral-border p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-netral-border/60">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primer-light/40 text-primer mb-1.5">
                <span className="w-2 h-2 rounded-full bg-primer" />
                <span>Batch Aktif Pekan Ini</span>
              </div>
              <h3 className="text-lg md:text-xl font-heading font-bold text-gelap">
                Pooling Panen: Bawang Merah Srikayangan Grade A
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-gelap/85 font-medium block">Target Tonase Batch</span>
              <span className="text-base font-extrabold text-primer font-mono tabular-nums">850 kg / 1.000 kg (85%)</span>
            </div>
          </div>

          <div className="my-5">
            <div className="w-full bg-netral-canvas rounded-full h-3.5 p-0.5 overflow-hidden border border-netral-border">
              <div
                className="bg-primer h-full rounded-full transition-all duration-500"
                style={{ width: '85%' }}
                role="progressbar"
                aria-valuenow={85}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress kuota pooling bawang merah"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gelap/85 mt-2 font-body">
              <span>Sisa kuota: 150 kg (Tutup pemesanan hari ini 16:00 WIB)</span>
              <span className="font-bold text-sekunder-dark">Harga Langsung Produsen: Rp 24.500/kg</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-netral-canvas/40 border border-netral-border/60">
              <CheckCircle2 className="w-4 h-4 text-primer mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gelap block">Garansi Bebas Risiko Retur</span>
                <span className="text-gelap/85 font-medium">Jika komoditas rusak saat pengiriman, dana escrow dikembalikan secara otomatis.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-netral-canvas/40 border border-netral-border/60">
              <ShieldCheck className="w-4 h-4 text-sekunder mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gelap block">Standar Timbangan Akurat</span>
                <span className="text-gelap/85 font-medium">Kompensasi 100% jika timbangan fisik dapur berbeda dari timbangan digital hub.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-netral-border/60">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs font-bold rounded-full bg-primer text-white hover:bg-primer-hover shadow-xs transition-all hover:scale-[1.02] min-h-[44px]"
            >
              Ikuti Batch
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
