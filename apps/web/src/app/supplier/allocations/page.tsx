'use client';

import * as React from 'react';
import { Plus, Clock } from 'lucide-react';
import { z } from 'zod';

const AllocationResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: z.string(),
    commodity: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    allocatedKg: z.number(),
    targetQuotaKg: z.number(),
    pricePerKg: z.number(),
    status: z.string(),
  })),
});
type Allocation = z.infer<typeof AllocationResponseSchema>['data'][number];

function formatDate(value: string): string {
  return value.slice(0, 10);
}

function formatTime(value: string): string {
  return value.slice(11, 16) || 'Waktu belum ditetapkan';
}


export default function SupplierAllocationsPage() {
  const [allocations, setAllocations] = React.useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/supplier/allocations')
      .then(async (response) => {
        if (!response.ok) throw new Error('Alokasi supplier tidak tersedia.');
        const parsed = AllocationResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons alokasi tidak valid.');
        setAllocations(parsed.data.data);
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Alokasi supplier tidak tersedia.');
        setAllocations([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const renderStatus = (status: string) => (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer border border-primer/20">
      {status}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Komitmen Alokasi Pasokan ke Hub Transit
          </h1>
          <p className="text-xs sm:text-sm text-gelap-muted mt-1">
            Jadwal pengiriman pasokan ke Sentra Hub Sentolo sebelum jam sortasi malam (21.00 WIB).
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Jadwal Pasok Baru</span>
        </button>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Jadwal Alokasi Pasokan Pekan Ini
          </h2>
          <span className="text-xs text-gelap-muted font-mono">
            {allocations.length} Alokasi
          </span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gelap-muted animate-pulse">Memuat alokasi tersimpan...</div>
        ) : allocations.length === 0 ? (
          <div className="p-10 text-center text-sm text-gelap-muted">{loadError || 'Belum ada alokasi pasokan tersimpan.'}</div>
        ) : (
          <>
 
        <div className="block sm:hidden divide-y divide-netral-border/60">
          {allocations.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-gelap">{item.commodity}</div>
                  <div className="text-xs text-gelap-muted font-mono mt-0.5">{item.id}</div>
                </div>
                {renderStatus(item.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="space-y-0.5">
                  <span className="text-gelap-muted block">Jadwal Setor:</span>
                  <span className="font-semibold text-gelap block">{formatDate(item.startsAt)}</span>
                  <span className="text-primer font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.endsAt)}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gelap-muted block">Target Kuota:</span>
                  <span className="font-medium text-gelap block">{item.targetQuotaKg} kg</span>
                </div>
              </div>

              <div className="pt-2 border-t border-netral-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gelap-muted">Kuota Pasok: </span>
                  <span className="font-mono font-bold text-gelap">{item.allocatedKg} kg</span>
                </div>
                <div>
                  <span className="text-gelap-muted">Total Nilai Pasokan: </span>
                  <span className="font-mono font-bold text-primer">
                    Rp {(item.allocatedKg * item.pricePerKg).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap-muted font-semibold uppercase tracking-wider text-xs">
                <th className="py-3 px-4">Komoditas & No. Alokasi</th>
                <th className="py-3 px-4">Jadwal Setor Hub</th>
                <th className="py-3 px-4">Target Kuota</th>
                <th className="py-3 px-4 text-right">Kuota Pasok</th>
                <th className="py-3 px-4 text-right">Harga Kontrak</th>
                <th className="py-3 px-4 text-right">Total Nilai Pasokan</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {allocations.map((item) => (
                <tr key={item.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{item.commodity}</div>
                    <div className="text-xs text-gelap-muted font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gelap">{formatDate(item.startsAt)}</div>
                    <div className="text-xs text-primer font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.endsAt)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gelap-muted">
                    {item.targetQuotaKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-gelap">
                    {item.allocatedKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap-muted">
                    Rp {item.pricePerKg.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">
                    Rp {(item.allocatedKg * item.pricePerKg).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {renderStatus(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
          )}
      </div>
    </div>
  );
}
