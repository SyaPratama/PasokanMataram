'use client';

import * as React from 'react';
import { FileText, CheckCircle2, ShieldCheck, Thermometer, Scale, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SopSection {
  title: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  points: string[];
}

const SOP_LIST: SopSection[] = [
  {
    title: 'SOP Penerimaan & Sortir Awal (Inbound Staging)',
    code: 'SOP-HUB-01',
    icon: CheckCircle2,
    points: [
      'Pemeriksaan kelengkapan manifes digital PasokMataram via pemindaian kode QR.',
      'Uji acak visual per karung untuk memastikan tidak ada kontaminasi hama atau pembusukan basah > 5%.',
      'Pemberian barcode label batch resmi sebelum komoditas dipindahkan ke meja timbangan.',
    ],
  },
  {
    title: 'SOP Penimbangan & Kalibrasi Tera Metrologi',
    code: 'SOP-HUB-02',
    icon: Scale,
    points: [
      'Timbangan digital wajib dikalibrasi harian pukul 02:30 WIB dengan beban uji bertingkat.',
      'Batas toleransi susut wajar dalam perjalanan darat adalah maksimal \u00B15% dari manifes supplier.',
      'Pencatatan bobot neto dicetak secara otomatis dan tercatat dalam ledger konsorsium.',
    ],
  },
  {
    title: 'SOP Manajemen Suhu Rantai Dingin (Cold-Chain Storage)',
    code: 'SOP-HUB-03',
    icon: Thermometer,
    points: [
      'Suhu ruang staging dingin dipertahankan antara 6\u00B0C hingga 10\u00B0C untuk sayuran segar & bumbu dapur.',
      'Komoditas bawang merah dan cabai ditempatkan di lorong berkelembapan terkontrol < 65% RH.',
      'Waktu maksimal transit komoditas di hub adalah 6 jam sebelum dimuat ke armada subuh.',
    ],
  },
  {
    title: 'SOP Keberangkatan Armada Pengantaran Subuh',
    code: 'SOP-HUB-04',
    icon: Clock,
    points: [
      'Armada wajib memeriksa segel kotak pendingin dan supir menandatangani serah terima sistem.',
      'Jendela keberangkatan terbagi 4 rute: Malioboro, Kaliurang, Bantul, dan Kulon Progo.',
      'Target batas akhir tiba di dapur restoran adalah pukul 06:30 WIB sebelum operasional koki dimulai.',
    ],
  },
];

/**
 * Halaman SOP Standar Fasilitas Hub Transit Sewon Bantul.
 * Rujukan resmi operasional kontrol mutu dan logistik rantai dingin pangan DIY.
 */
export default function HubSopPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Standar Operasional Prosedur Resmi</Badge>
            <span className="text-xs text-gelap/60">Versi 2.4 - Standar Mutu Pangan DIY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            SOP Standar Fasilitas Hub Transit
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Pedoman baku penanganan komoditas segar, kalibrasi timbangan, dan rantai dingin subuh se-DIY.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOP_LIST.map((sop) => {
          const Icon = sop.icon;
          return (
            <div
              key={sop.code}
              className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-netral-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primer-light text-primer flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primer">{sop.code}</span>
                    <h2 className="text-xs sm:text-sm font-bold text-gelap font-heading">
                      {sop.title}
                    </h2>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-gelap/85 leading-relaxed">
                {sop.points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primer mt-1.5 shrink-0" aria-hidden="true" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
