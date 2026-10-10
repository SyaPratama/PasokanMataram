'use client';

/**
 * @file apps/web/src/app/_components/alur-pengadaan.tsx
 * @description Visualisasi 4-Langkah Alur Pengadaan Dapur ke Supplier Langsung Petani.
 * Mematuhi Prinsip VIII, IX Konstitusi PasokMataram v1.6.0 & WCAG 2.1 AA.
 */

import React from 'react';
import { CalendarClock, FileSpreadsheet, Truck, CheckSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StepItem {
  step: string;
  title: string;
  summary: string;
  points: string[];
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  {
    step: '01',
    title: 'Pilih Komoditas & Jadwal Pasokan',
    summary: 'Atur pasokan rutin (Standing Order) atau ikuti pooling belanja tonase untuk harga grosir termurah.',
    points: [
      'Pilih jadwal kirim rutin (misal: Senin & Kamis subuh)',
      'Opsi pesanan mandiri atau patungan kuota (pooling)',
      'Spesifikasi mutu standar kuliner (Grade A/B)',
    ],
    icon: CalendarClock,
  },
  {
    step: '02',
    title: 'Terbitkan Digital PO & Kunci Escrow',
    summary: 'Purchase Order resmi berbadan hukum langsung terbit, dana diamankan di rekening bersama escrow.',
    points: [
      'Dokumen PO otomatis dengan nomor NIB & NPWP',
      'Dana tersimpan aman di rekening penampung resmi',
      'Petani mendapat kepastian bayar sebelum panen dipetik',
    ],
    icon: FileSpreadsheet,
  },
  {
    step: '03',
    title: 'Pengantaran Terjadwal 24 Jam ke Pintu Gerai',
    summary: 'Hasil panen segar diantar armada rantai dingin ke gerai cabang sesuai jendela slot fleksibel 24 jam pilihan Anda.',
    points: [
      '4 Slot Distribusi Fleksibel (Pagi, Siang, Sore/Malam, Dini Hari)',
      'Opsi Armada Siaga On-Demand untuk Lonjakan Pesanan Dapur',
      'Armada Rantai Dingin (Cold-Chain) dengan Karantina Higienitas Pangan',
    ],
    icon: Truck,
  },
  {
    step: '04',
    title: 'QC Digital di PWA & Pencairan Dana',
    summary: 'Verifikasi timbangan dan fisik bahan via aplikasi PWA di tablet koki tanpa memerlukan sensor hardware rumit.',
    points: [
      'Ceklis serah-terima digital 3 langkah di tablet koki',
      'Foto bukti langsung jika terjadi deviasi timbangan',
      'Dana escrow cair ke rekening petani pasca koki konfirmasi',
    ],
    icon: CheckSquare,
  },
];

export function AlurPengadaan() {
  return (
    <section id="alur-pengadaan" className="py-16 px-4 sm:px-6 lg:px-8 bg-netral-surface/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primer-surface/10 text-primer-deep border border-primer-pendukung/30 mb-3">
            Alur Operasional Dapur ke Supplier
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gelap font-heading tracking-tight">
            Bagaimana PasokMataram Mengamankan Dapur Anda
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gelap-muted font-body">
            Empat langkah terintegrasi menghubungkan pesanan dapur HoReKa langsung ke kebun Gapoktan lokal D.I. Yogyakarta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-netral-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div aria-hidden="true" className="absolute top-4 right-4 text-3xl font-extrabold text-netral-border/60 font-mono group-hover:text-primer-pendukung/40 transition-colors">
                  {item.step}
                </div>

                <div>
                  <div className="w-11 h-11 rounded-xl bg-primer-surface/10 text-primer-deep flex items-center justify-center mb-5">
                    <IconComp className="w-5 h-5 text-primer-deep" aria-hidden="true" />
                  </div>

                  <h3 className="text-base font-bold text-gelap font-heading mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gelap-muted leading-relaxed mb-4">
                    {item.summary}
                  </p>

                  <ul className="space-y-2 border-t border-netral-border/60 pt-3">
                    {item.points.map((pt, idx) => (
                      <li key={idx} className="text-[11px] text-gelap/85 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primer-deep mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-primer-deep text-white p-6 rounded-2xl shadow-md border border-primer-pendukung/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-aksen-light shrink-0">
              <ShieldCheck className="w-5 h-5 text-aksen-light" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Garansi Penggantian Mutu 100%</h4>
              <p className="text-xs text-netral-light/90 font-body">
                Bahan rusak saat pengiriman diganti seketika atau dana escrow dikembalikan tanpa potongan.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sekunder hover:bg-sekunder-hover text-white text-xs font-bold font-heading transition-all shadow-sm shrink-0 min-h-[44px]"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
