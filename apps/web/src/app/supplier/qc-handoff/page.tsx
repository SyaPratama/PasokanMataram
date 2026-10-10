import type { Metadata } from 'next';
import { Layers, QrCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Alur Serah Terima & QC Hub | Portal Gapoktan PasokMataram',
  description: 'Prosedur penimbangan digital tare-zero dan serah terima komoditas di Hub Transit Sentolo.',
};

/**
 * Halaman Alur Serah Terima QC di Hub Transit untuk Petani / Gapoktan.
 */
export default function SupplierQcHandoffPage() {
  const handoffs = [
    {
      id: 'HO-20261008-01',
      date: '08 Okt 2026, 19:15 WIB',
      commodity: 'Bawang Merah Srikayangan Super A',
      sentKg: 500,
      hubScaleKg: 498.4,
      waterMoisture: '12.1%',
      qcGrade: 'Lulus Grade A',
      operatorName: 'Bambang Tri (QC Hub Sentolo)',
      status: 'VERIFIED' as const,
    },
    {
      id: 'HO-20261006-03',
      date: '06 Okt 2026, 18:40 WIB',
      commodity: 'Cabai Rawit Merah Panjatan',
      sentKg: 250,
      hubScaleKg: 249.2,
      waterMoisture: '13.8%',
      qcGrade: 'Lulus Grade A',
      operatorName: 'Bambang Tri (QC Hub Sentolo)',
      status: 'VERIFIED' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Alur Serah Terima & Pengujian Mutu Hub
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Transparansi timbangan digital di gerbang transit Hub Sentolo dengan pencatatan digital tare-zero dan bukti timbang kriptografis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Langkah 1: Penimbangan
          </div>
          <div className="text-sm font-bold text-gelap mt-1">
            Timbangan Digital Kalibrasi
          </div>
          <p className="text-xs text-gelap/70 mt-1">
            Penimbangan langsung dari bak pikap petani dengan tare-zero wadah keranjang.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Langkah 2: Uji Petik Mutu
          </div>
          <div className="text-sm font-bold text-gelap mt-1">
            Kadar Air & Sortasi Fisik
          </div>
          <p className="text-xs text-gelap/70 mt-1">
            Pemeriksaan kelembaban dan diameter umbi bawang / cabai sesuai standar Grade A.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Langkah 3: Penerbitan Label
          </div>
          <div className="text-sm font-bold text-gelap mt-1">
            QR Pass Kriptografis
          </div>
          <p className="text-xs text-gelap/70 mt-1">
            Penempelan label lot QR dan pencairan bertahap dana escrow ke saldo gapoktan.
          </p>
        </div>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Riwayat Berita Acara Serah Terima Hub Sentolo
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {handoffs.length} Dokumen Sah
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">No. Timbang & Komoditas</th>
                <th className="py-3 px-4">Waktu Setor</th>
                <th className="py-3 px-4 text-right">Manifest Panen</th>
                <th className="py-3 px-4 text-right">Timbangan Hub</th>
                <th className="py-3 px-4 text-right">Kadar Air</th>
                <th className="py-3 px-4">Petugas QC</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {handoffs.map((h) => (
                <tr key={h.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{h.commodity}</div>
                    <div className="text-[11px] text-gelap/60 font-mono mt-0.5">{h.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gelap/80 font-mono">
                    {h.date}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">
                    {h.sentKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">
                    {h.hubScaleKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">
                    {h.waterMoisture}
                  </td>
                  <td className="py-3.5 px-4 text-gelap/70">
                    {h.operatorName}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={h.status} />
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
