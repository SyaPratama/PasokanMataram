'use client';

import React from 'react';
import { CalendarClock, FileSpreadsheet, Truck, CheckSquare, ArrowRight } from 'lucide-react';
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
      'Supplier dan produsen mendapat kepastian bayar sebelum barang dikirim',
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
      'Dana escrow cair ke rekening supplier pasca koki konfirmasi',
    ],
    icon: CheckSquare,
  },
];

interface AlurPengadaanProps {
  hideHeader?: boolean;
}

export function AlurPengadaan({ hideHeader = false }: AlurPengadaanProps = {}) {
  return (
    <section id="alur-pengadaan" className={`${hideHeader ? 'pt-0 pb-12' : 'pt-4 sm:pt-6 pb-16'} px-4 sm:px-6 lg:px-8 bg-transparent`}>
      <div className="max-w-7xl mx-auto">
        {!hideHeader && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primer-surface/10 text-primer-deep border border-primer-pendukung/30 mb-3">
              Alur Operasional Dapur ke Supplier
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gelap font-heading tracking-tight">
              Bagaimana PasokMataram Mengamankan Dapur Anda
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gelap/85 font-body">
              Empat langkah terintegrasi menghubungkan pesanan dapur HoReKa langsung ke ekosistem supplier pangan lokal D.I. Yogyakarta.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.step}
                className="bg-white rounded-3xl p-6 border border-netral-border/80 hover:border-primer/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-2xl bg-netral-canvas border border-netral-border flex items-center justify-center font-heading font-extrabold text-primer text-sm">
                      {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-primer-light flex items-center justify-center text-primer">
                      <IconComp className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-base text-gelap tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-gelap/80 leading-relaxed font-body">
                    {item.summary}
                  </p>

                  <ul className="mt-4 space-y-1.5 text-[11px] text-gelap/75 font-body">
                    {item.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primer shrink-0 mt-1" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3 text-[11px] font-bold text-primer flex items-center justify-between">
                  <span>Tahap {item.step}</span>
                  <span className="text-gelap/40 font-normal">Selesai Terverifikasi</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-primer text-white hover:bg-primer-hover font-bold font-heading text-xs sm:text-sm shadow-xs transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primer min-h-[44px]"
          >
            <span>Registrasi Kemitraan Sourcing</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
