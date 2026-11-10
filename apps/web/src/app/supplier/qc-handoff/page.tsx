'use client';

import * as React from 'react';
import { z } from 'zod';

const HandoffSchema = z.object({
  id: z.string(),
  commodity: z.string(),
  sentKg: z.number(),
  hubScaleKg: z.number().nullable(),
  hubId: z.string().nullable(),
  operatorName: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
});
const HandoffResponseSchema = z.object({ success: z.boolean(), data: z.array(HandoffSchema) });
type Handoff = z.infer<typeof HandoffSchema>;

function formatDate(value: string): string {
  return value.slice(0, 16).replace('T', ' ');
}

export default function SupplierQcHandoffPage() {
  const [handoffs, setHandoffs] = React.useState<Handoff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/supplier/handoffs')
      .then(async (response) => {
        if (!response.ok) throw new Error('Data serah terima tidak tersedia.');
        const parsed = HandoffResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons serah terima tidak valid.');
        setHandoffs(parsed.data.data);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Data serah terima tidak tersedia.');
        setHandoffs([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">Alur Serah Terima & Pengujian Mutu Hub</h1><p className="text-xs sm:text-sm text-gelap/70 mt-1">Riwayat serah terima berdasarkan reservasi supplier dan verifikasi timbang tersimpan.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs"><div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">Langkah 1</div><div className="text-sm font-bold text-gelap mt-1">Penimbangan</div><p className="text-xs text-gelap/70 mt-1">Berat manifest dibandingkan dengan pembacaan hub tersimpan.</p></div><div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs"><div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">Langkah 2</div><div className="text-sm font-bold text-gelap mt-1">Status Toleransi</div><p className="text-xs text-gelap/70 mt-1">Status diambil dari verifikasi timbang, bukan label buatan UI.</p></div><div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs"><div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">Langkah 3</div><div className="text-sm font-bold text-gelap mt-1">Bukti Tersimpan</div><p className="text-xs text-gelap/70 mt-1">Nomor reservasi dan hub menjadi referensi audit.</p></div></div>
      {errorMessage && <div className="p-5 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-sm text-status-danger">{errorMessage}</div>}
      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between"><h2 className="text-sm font-heading font-bold text-gelap">Riwayat Berita Acara Serah Terima Hub</h2><span className="text-xs text-gelap/60 font-mono">{isLoading ? 'Memuat' : `${handoffs.length} Baris`}</span></div>
        {isLoading ? <div className="p-8 text-center text-sm text-gelap/70 animate-pulse">Memuat serah terima tersimpan...</div> : handoffs.length === 0 ? <div className="p-8 text-center text-sm text-gelap/70">Belum ada serah terima tersimpan.</div> : <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs"><thead><tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]"><th className="py-3 px-4">ID & Komoditas</th><th className="py-3 px-4">Waktu Setor</th><th className="py-3 px-4 text-right">Manifest</th><th className="py-3 px-4 text-right">Timbangan Hub</th><th className="py-3 px-4">Hub & Petugas</th><th className="py-3 px-4 text-center">Status</th></tr></thead><tbody className="divide-y divide-netral-border/60">{handoffs.map((handoff) => <tr key={handoff.id} className="hover:bg-netral-canvas/40 transition-colors"><td className="py-3.5 px-4"><div className="font-bold text-gelap">{handoff.commodity}</div><div className="text-[11px] text-gelap/60 font-mono mt-0.5">{handoff.id}</div></td><td className="py-3.5 px-4 text-gelap/80 font-mono">{formatDate(handoff.createdAt)}</td><td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap">{handoff.sentKg} kg</td><td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">{handoff.hubScaleKg === null ? 'Belum ada' : `${handoff.hubScaleKg} kg`}</td><td className="py-3.5 px-4 text-gelap/70"><div>{handoff.hubId || 'Hub belum tercatat'}</div><div className="text-[11px]">{handoff.operatorName || 'Petugas belum tercatat'}</div></td><td className="py-3.5 px-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer">{handoff.status}</span></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}
