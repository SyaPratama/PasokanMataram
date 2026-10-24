'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Store,
  Calendar,
  Lock,
  Wallet,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/shared/status-badge';
import { MOCK_HARVEST_COMMITMENTS, type MockHarvestCommitment } from '../../../lib/mock-data';

/**
 * Halaman Meja Kerja Dashboard Gapoktan / Pemasok Hasil Panen.
 * Menampilkan komitmen panen, alokasi pasok ke sentra hub, dan saldo escrow panen.
 */
export default function SupplierDashboardPage() {
  const [commitments] = React.useState<MockHarvestCommitment[]>(MOCK_HARVEST_COMMITMENTS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-netral-border/60 pb-4">
        <div>
          <h1 className="text-xl font-bold font-heading text-gelap">
            Meja Kerja Suplai Bahan Pangan &amp; Etalase
          </h1>
          <p className="text-xs text-gelap/60 mt-1">
            Pantau pasokan harian, alokasi kuota dapur HoReKa, dan jaminan dana escrow supplier.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/supplier/qc-handoff">
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap shrink-0">
              <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
              Serah QC
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert('Formulir Pendaftaran Pasokan Baru (Sentra Produsen DIY)')}
            className="text-xs font-semibold shadow-sm whitespace-nowrap shrink-0"
          >
            <Store className="w-3.5 h-3.5 mr-1" />
            Pasok Bahan
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-netral-border/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gelap/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pasokan Siap Kirim</span>
            <div className="p-2 bg-primer-light rounded-lg text-primer">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gelap font-heading">
            4.15 <span className="text-xs font-normal text-gelap/60">Ton</span>
          </div>
          <div className="text-[11px] text-gelap/70">
            Unggas, Daging, Susu, Bumbu &amp; Sayur DIY
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-netral-border/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gelap/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Terkunci Kontrak HoReKa</span>
            <div className="p-2 bg-sekunder-light rounded-lg text-sekunder">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sekunder font-heading">
            2.50 <span className="text-xs font-normal text-gelap/60">Ton (60.2%)</span>
          </div>
          <div className="text-[11px] text-gelap/70">
            Terikat PO Restoran & Hotel DIY
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-netral-border/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gelap/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Jadwal Drop Terdekat</span>
            <div className="p-2 bg-netral-canvas rounded-lg text-primer border border-netral-border">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-gelap font-heading">
            12 Okt 2026
          </div>
          <div className="text-[11px] text-gelap/70">
            Sentra Hub Sentolo (1.2 Ton Bawang)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-netral-border/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gelap/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Dana Escrow Tertampung</span>
            <div className="p-2 bg-primer-light rounded-lg text-primer">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primer font-heading">
            Rp 65.000.000
          </div>
          <div className="text-[11px] text-gelap/70">
            Pencairan Otomatis Pasca QC Digital
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-primer-light/80 to-white rounded-xl border border-primer/30 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-sm text-primer">
              Etalase Pangan &amp; Reputasi Pembeli Terverifikasi
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primer text-white font-bold">
              One-Stop Supplier
            </span>
          </div>
          <p className="text-xs text-gelap/80">
            Pajang produk unggas, daging sapi, susu, bumbu, atau hasil panen Anda di etalase katalog HoReKa, dan pantau ulasan kualitas dari para kepala dapur.
          </p>
        </div>
        <Link
          href="/supplier/market"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover shrink-0 min-h-[40px] shadow-xs"
        >
          <span>Buka Etalase & Ulasan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-primer/30 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gelap font-heading">
              Legalitas Kelompok Tani Terverifikasi Penuh
            </span>
            <StatusBadge status="VERIFIED" />
          </div>
          <p className="text-xs text-gelap/70 flex flex-wrap items-center gap-1.5">
            <span>SK Pengukuhan: <strong>520/SK-DISTAN/KP/2024</strong></span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>Diterbitkan oleh: Dinas Pertanian &amp; Ketahanan Pangan Kab. Kulon Progo.</span>
          </p>
        </div>
        <div className="text-xs text-primer font-semibold bg-primer-light px-3 py-1.5 rounded-lg border border-primer/20">
          Status Kemitraan: Aktif & Terlindungi Garansi Pembayaran
        </div>
      </div>

      <div id="komitmen" className="bg-white rounded-xl border border-netral-border/70 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-netral-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gelap font-heading">
              Komitmen Jadwal Panen & Alokasi Pasok Sentra Hub
            </h2>
            <p className="text-xs text-gelap/60 mt-0.5">
              Daftar komoditas siap panen yang telah dipesan oleh konsorsium dapur HoReKa PasokMataram.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-netral-canvas text-gelap/70 font-semibold border-b border-netral-border uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode Panen</th>
                <th className="py-3 px-4">Komoditas & Varietas</th>
                <th className="py-3 px-4">Estimasi Panen</th>
                <th className="py-3 px-4 text-right">Hasil Taksasi</th>
                <th className="py-3 px-4 text-right">Alokasi Pasok</th>
                <th className="py-3 px-4">Sentra Hub Tujuan</th>
                <th className="py-3 px-4 text-center">Status Alokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/50 text-gelap">
              {commitments.map((item) => (
                <tr key={item.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-primer">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gelap">{item.commodityName}</div>
                    <div className="text-[11px] text-gelap/60">{item.variety}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gelap/80 font-medium">
                    {item.estimatedHarvestDate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-gelap/70">
                    {item.totalYieldKg.toLocaleString('id-ID')} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-primer">
                    {item.allocatedQuotaKg.toLocaleString('id-ID')} kg
                  </td>
                  <td className="py-3.5 px-4 text-gelap/70">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-sekunder flex-shrink-0" />
                      <span>{item.dropPointHub}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'TERKUNCI'
                          ? 'bg-sekunder-light text-sekunder border border-sekunder/20'
                          : item.status === 'SIAP_SERAH'
                          ? 'bg-primer-light text-primer border border-primer/20'
                          : 'bg-netral-canvas text-gelap/70 border border-netral-border'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-netral-canvas rounded-xl border border-netral-border/60 p-5 space-y-3">
        <h3 className="text-xs font-bold text-primer uppercase tracking-wider flex items-center">
          <ClipboardCheck className="w-4 h-4 mr-1.5" />
          Prosedur Serah Terima Tanpa Perantara di Sentra Hub Pengumpulan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gelap/80">
          <div className="bg-white p-3.5 rounded-lg border border-netral-border/50 space-y-1">
            <div className="font-bold text-gelap">1. Drop Subuh di Sentra Hub</div>
            <p className="text-[11px] text-gelap/60">
              Petani membawa hasil panen ke sentra hub terdekat (Sentolo, Srandakan, atau Prambanan) maksimal jam 20:00 WIB setelah panen sore.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-netral-border/50 space-y-1">
            <div className="font-bold text-gelap">2. Validasi Timbangan Digital</div>
            <p className="text-[11px] text-gelap/60">
              Petugas hub bersama perwakilan kelompok tani menimbang bobot bersih dan mengisi formulir digital QC langsung pada tablet hub.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-netral-border/50 space-y-1">
            <div className="font-bold text-gelap">3. Pencairan Escrow Otomatis</div>
            <p className="text-[11px] text-gelap/60">
              Begitu tanda terima digital disetujui, dana escrow yang ditahan oleh pembeli otomatis dilepas ke rekening kas kelompok tani.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
