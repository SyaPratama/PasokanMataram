'use client';

import * as React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuarantineItem {
  id: string;
  manifestId: string;
  supplier: string;
  commodity: string;
  weightKg: number;
  reason: string;
  moistureActual: number;
  quarantineZone: string;
  status: 'IN_QUARANTINE' | 'RE_SORTED' | 'RETURNED';
}

const MOCK_QUARANTINE: QuarantineItem[] = [
  {
    id: 'QRN-20261010-01',
    manifestId: 'MNF-BTL-20261009-004',
    supplier: 'Kelompok Tani Panjatan Maju',
    commodity: 'Cabai Rawit Merah (Campuran B)',
    weightKg: 85,
    reason: 'Kadar air melebihi batas toleransi (terbaca 16.4%, syarat maksimal 14.0%)',
    moistureActual: 16.4,
    quarantineZone: 'Kamar Kering B1',
    status: 'IN_QUARANTINE',
  },
  {
    id: 'QRN-20261009-02',
    manifestId: 'MNF-SLM-20261009-002',
    supplier: 'Gapoktan Prambanan Sejahtera',
    commodity: 'Bawang Merah Lokal Grade B',
    weightKg: 120,
    reason: 'Persentase umbi busuk/basah melebihi 7% dari sampel acak per karung',
    moistureActual: 14.8,
    quarantineZone: 'Area Sortasi Remediasi C2',
    status: 'RE_SORTED',
  },
];

/**
 * Halaman Karantina & Penanganan Deviasi Mutu Komoditas Hub.
 * Mengisolasi bahan pangan yang tidak lolos toleransi &plusmn;5% atau kadar air standar.
 */
export default function HubQuarantinePage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="destructive">Ruang Isolasi Mutu Terproteksi</Badge>
            <span className="text-xs text-gelap/60">Toleransi Mutu Ketat DIY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Karantina Komoditas &amp; Deviasi Mutu
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Penanganan stok panen yang tidak memenuhi standar QC dapur sebelum masuk ke gerai HoReKa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <RotateCcw className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Refresh Status Karantina
          </Button>
        </div>
      </div>

      <div className="bg-status-danger-light/60 border border-status-danger/30 p-4 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-gelap">
          <span className="font-bold font-heading text-status-danger block mb-0.5">
            Protokol Pencegahan Sengketa Timbangan &amp; Kualitas (Zero-Dispute)
          </span>
          <p className="leading-relaxed text-gelap/85">
            Komoditas yang masuk ke zona karantina tidak akan dikirim ke dapur restoran dan saldo escrow tidak akan dicairkan sampai hasil remediasi atau penyesuaian bobot disetujui bersama oleh ketua Gapoktan.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-netral-border/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-netral-border/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gelap font-heading">
              Daftar Batch Dalam Masa Karantina &amp; Remediasi
            </h2>
            <p className="text-[11px] text-gelap/65 mt-0.5">
              Dikelola oleh supervisor QC Hub Transit Sewon Bantul.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-status-danger-light text-status-danger whitespace-nowrap shrink-0">
            {MOCK_QUARANTINE.length} Batch Tertahan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-netral-canvas/60 text-gelap/85 font-semibold border-b border-netral-border">
              <tr>
                <th className="p-3.5">ID Karantina</th>
                <th className="p-3.5">Pemasok &amp; Komoditas</th>
                <th className="p-3.5">Bobot</th>
                <th className="p-3.5">Penyebab Karantina</th>
                <th className="p-3.5">Lokasi Simpan</th>
                <th className="p-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60 text-gelap">
              {MOCK_QUARANTINE.map((item) => (
                <tr key={item.id} className="hover:bg-netral-canvas/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primer">{item.id}</td>
                  <td className="p-3.5">
                    <div className="font-semibold">{item.commodity}</div>
                    <div className="text-[11px] text-gelap/60">{item.supplier}</div>
                  </td>
                  <td className="p-3.5 font-mono font-bold">{item.weightKg} kg</td>
                  <td className="p-3.5 max-w-xs">
                    <p className="text-[11px] text-status-danger font-medium">{item.reason}</p>
                    <span className="text-[10px] text-gelap/60">Kadar air: {item.moistureActual}%</span>
                  </td>
                  <td className="p-3.5 font-medium text-gelap/70">{item.quarantineZone}</td>
                  <td className="p-3.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => alert(`Memulai proses sortasi ulang untuk batch ${item.id}`)}
                      className="text-xs"
                    >
                      Sortasi Ulang
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
