import type { Metadata } from 'next';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Ceklis Mutu & QC Dapur | Portal HoReKa PasokMataram',
  description: 'Prosedur penerimaan barang, pencocokan timbangan digital, dan form retur komoditas gagal sortir.',
};

/**
 * Halaman Ceklis Mutu QC Dapur HoReKa.
 */
export default function BuyerQcPage() {
  const qcLogs = [
    {
      id: 'QC-20261009-01',
      commodity: 'Bawang Merah Srikayangan',
      lotNumber: 'LOT-KLP-SRI-044',
      batchWeightKg: 25,
      actualWeightKg: 25.1,
      moisturePercent: 12.4,
      defectPercent: 0.8,
      status: 'VERIFIED' as const,
      inspector: 'Chef Bambang (Head Chef)',
      timestamp: '04:38 WIB',
    },
    {
      id: 'QC-20261009-02',
      commodity: 'Cabai Rawit Merah Segar',
      lotNumber: 'LOT-KLP-RAW-089',
      batchWeightKg: 15,
      actualWeightKg: 15.0,
      moisturePercent: 14.1,
      defectPercent: 1.2,
      status: 'VERIFIED' as const,
      inspector: 'Chef Bambang (Head Chef)',
      timestamp: '04:45 WIB',
    },
    {
      id: 'QC-20261007-12',
      commodity: 'Tomat Buah Organik',
      lotNumber: 'LOT-BTL-TOM-012',
      batchWeightKg: 20,
      actualWeightKg: 19.8,
      moisturePercent: 18.0,
      defectPercent: 4.5,
      status: 'REJECTED' as const,
      inspector: 'Sdr. Dian (Purchasing)',
      timestamp: '05:10 WIB (07 Okt)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Ceklis Mutu & Serah Terima QC Dapur
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Standarisasi penerimaan bahan baku dengan verifikasi kadar air, berat digital tare-zero, dan toleransi cacat fisik.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Input Uji Petik Subuh Ini</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Tingkat Kelulusan QC
          </div>
          <div className="text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            98.7%
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            <span>Standar mutu HoReKa terpenuhi</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Toleransi Defek Rata-Rata
          </div>
          <div className="text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">
            1.1%
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Di bawah ambang batas toleransi (maks. 3.0%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Retur Bulan Ini
          </div>
          <div className="text-2xl font-heading font-black text-status-danger mt-1 font-mono tabular-nums">
            1 Batch (20 kg)
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Penggantian otomatis pada jadwal berikutnya
          </div>
        </div>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Riwayat Serah Terima & Verifikasi Mutu
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {qcLogs.length} Pemeriksaan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Komoditas & No. Lot</th>
                <th className="py-3 px-4 text-right">Manifest Kg</th>
                <th className="py-3 px-4 text-right">Timbangan Dapur</th>
                <th className="py-3 px-4 text-right">Kadar Air</th>
                <th className="py-3 px-4 text-right">Defek Fisik</th>
                <th className="py-3 px-4">Pemeriksa & Waktu</th>
                <th className="py-3 px-4 text-center">Hasil QC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {qcLogs.map((log) => (
                <tr key={log.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{log.commodity}</div>
                    <div className="text-[11px] text-gelap/60 font-mono mt-0.5">{log.lotNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">
                    {log.batchWeightKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">
                    {log.actualWeightKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">
                    {log.moisturePercent}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">
                    {log.defectPercent}%
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gelap">{log.inspector}</div>
                    <div className="text-[11px] text-gelap/60 font-mono">{log.timestamp}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={log.status} />
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
