'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ScanQrCode,
  Scale,
  Truck,
  ShieldAlert,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Halaman Utama Ringkasan Operasional Cross-Dock Hub Transit Sewon Bantul.
 * Menyediakan matriks monitoring truk masuk, penimbangan, dan alur rantai dingin.
 */
export default function HubOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Stasiun Aktif 24 Jam</Badge>
            <span className="text-xs text-gelap/60">Wilayah D.I. Yogyakarta</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Meja Kerja Operasional Cross-Dock Hub Transit
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Sentra sortir fisik, stasiun timbangan tera digital, dan staging rantai dingin terpadu Sewon Bantul.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hub/inbound">
            <Button variant="primary" size="sm" className="text-xs">
              <ScanQrCode className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Scan QR Inbound
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Inbound Truk Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-primer-light flex items-center justify-center text-primer">
              <Truck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-primer mt-2">12 Truk</div>
          <p className="text-[11px] text-gelap/60 mt-1">8 terverifikasi, 4 dalam antrean</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Tonase Diterima Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-aksen-light flex items-center justify-center text-aksen-dark">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-gelap mt-2">8.450 kg</div>
          <p className="text-[11px] text-gelap/60 mt-1">Deviasi rata-rata: -0.8% (Aman)</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Lolos QC Grade A</span>
            <div className="w-8 h-8 rounded-lg bg-cta-green-light flex items-center justify-center text-primer">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-primer mt-2">98.4%</div>
          <p className="text-[11px] text-gelap/60 mt-1">Kadar air rata-rata: 13.1%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gelap/70">Karantina Deviasi</span>
            <div className="w-8 h-8 rounded-lg bg-status-danger-light flex items-center justify-center text-status-danger">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-status-danger mt-2">1 Batch</div>
          <p className="text-[11px] text-gelap/60 mt-1">Remediasi sortasi ulang</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/hub/inbound"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center group-hover:scale-105 transition-transform">
              <ScanQrCode className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Inbound &amp; QC Sortasi
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Pemindaian QR surat jalan dan uji kadar air digital</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Buka Meja Kerja</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/hub/weighing"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen-dark flex items-center justify-center group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Stasiun Timbangan Tera
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Sertifikasi timbangan digital Metrologi Legal DIY</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Kalibrasi &amp; Catat</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/hub/deliveries"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pendukung-light text-primer flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Jadwal Antar Subuh
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Manajemen 4 armada cold-chain menuju gerai HoReKa</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Lihat Rute Truk</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/hub/quarantine"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-danger-light text-status-danger flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Karantina Deviasi Mutu
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Pemisahan komoditas tidak sesuai toleransi &plusmn;5%</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Buku Log Karantina</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/hub/sop"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primer-light text-primer flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                SOP Standar Fasilitas
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Panduan penanganan suhu dingin dan uji kadar air pangan</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Baca Dokumen SOP</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/hub/help"
          className="p-5 rounded-2xl bg-white border border-netral-border/80 hover:border-primer hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aksen-light text-aksen-dark flex items-center justify-center group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gelap font-heading group-hover:text-primer transition-colors">
                Pusat Bantuan Stasiun
              </h2>
              <p className="text-xs text-gelap/65 mt-0.5">Kontak darurat kendala timbangan dan radio logistik</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-primer">
            <span>Hubungi Bantuan</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </Link>
      </div>
    </div>
  );
}
