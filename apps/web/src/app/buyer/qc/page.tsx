'use client';

import * as React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { z } from 'zod';

const QcSchema = z.object({
  id: z.string(),
  commodity: z.string(),
  manifestWeightKg: z.number(),
  actualWeightKg: z.number(),
  toleranceStatus: z.string(),
  operatorName: z.string(),
  hubId: z.string(),
  createdAt: z.string(),
});
const LogisticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({ qc: z.array(QcSchema) }),
});
type QcLog = z.infer<typeof QcSchema>;

function formatDate(value: string): string {
  return value.slice(0, 16).replace('T', ' ');
}

export default function BuyerQcPage() {
  const [qcLogs, setQcLogs] = React.useState<QcLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/buyer/logistics')
      .then(async (response) => {
        if (!response.ok) throw new Error('Riwayat QC tidak tersedia.');
        const parsed = LogisticsResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons QC tidak valid.');
        setQcLogs(parsed.data.data.qc);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Riwayat QC tidak tersedia.');
        setQcLogs([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const passedCount = qcLogs.filter((log) => log.toleranceStatus === 'WITHIN_TOLERANCE').length;
  const passRate = qcLogs.length === 0 ? 'Belum ada data' : `${Math.round((passedCount / qcLogs.length) * 100)}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">Ceklis Mutu & Serah Terima QC Dapur</h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">Riwayat verifikasi timbang berdasarkan data reservasi dan stasiun hub.</p>
        </div>
        <button type="button" disabled className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer/50 text-white text-xs font-bold min-h-[44px] shadow-sm">
          <ClipboardCheck className="w-4 h-4" />
          <span>Input Uji Petik</span>
        </button>
      </div>

      {errorMessage && <div className="p-5 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-sm text-status-danger">{errorMessage}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs"><div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">Tingkat Kelulusan QC</div><div className="text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums">{isLoading ? 'Memuat' : passRate}</div><div className="text-[11px] text-gelap/60 mt-1">Dihitung dari status timbang tersimpan.</div></div>
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs"><div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">Toleransi Defek Rata-Rata</div><div className="text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">Tidak tersedia</div><div className="text-[11px] text-gelap/60 mt-1">Defek fisik belum ada pada kontrak data.</div></div>
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs"><div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">Total Pemeriksaan</div><div className="text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">{isLoading ? 'Memuat' : qcLogs.length}</div><div className="text-[11px] text-gelap/60 mt-1">Baris timbang milik tenant ini.</div></div>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between"><h2 className="text-sm font-heading font-bold text-gelap">Riwayat Serah Terima & Verifikasi Mutu</h2><span className="text-xs text-gelap/60 font-mono">{qcLogs.length} Pemeriksaan</span></div>
        {isLoading ? <div className="p-8 text-center text-sm text-gelap/70 animate-pulse">Memuat pemeriksaan tersimpan...</div> : qcLogs.length === 0 ? <div className="p-8 text-center text-sm text-gelap/70">Belum ada verifikasi timbang tersimpan.</div> : (
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs"><thead><tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]"><th className="py-3 px-4">Komoditas & ID</th><th className="py-3 px-4 text-right">Manifest Kg</th><th className="py-3 px-4 text-right">Timbangan Hub</th><th className="py-3 px-4">Hub & Waktu</th><th className="py-3 px-4">Pemeriksa</th><th className="py-3 px-4 text-center">Status</th></tr></thead><tbody className="divide-y divide-netral-border/60">{qcLogs.map((log) => <tr key={log.id} className="hover:bg-netral-canvas/40 transition-colors"><td className="py-3.5 px-4"><div className="font-bold text-gelap">{log.commodity}</div><div className="text-[11px] text-gelap/60 font-mono mt-0.5">{log.id}</div></td><td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">{log.manifestWeightKg} kg</td><td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">{log.actualWeightKg} kg</td><td className="py-3.5 px-4"><div className="font-medium text-gelap">{log.hubId}</div><div className="text-[11px] text-gelap/60 font-mono">{formatDate(log.createdAt)}</div></td><td className="py-3.5 px-4 text-gelap/70">{log.operatorName}</td><td className="py-3.5 px-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer">{log.toleranceStatus}</span></td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
