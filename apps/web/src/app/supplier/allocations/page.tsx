import type { Metadata } from 'next';
import { Calendar, Plus, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Alokasi Pasok Hub Sentolo | Portal Gapoktan PasokMataram',
  description: 'Komitmen jadwal setor panen Gapoktan ke Sentra Hub Transit Kulon Progo.',
};

/**
 * Halaman Alokasi Pasok Hub untuk Gapoktan.
 */
export default function SupplierAllocationsPage() {
  const allocations = [
    {
      id: 'ALO-KLP-0881',
      commodity: 'Bawang Merah Srikayangan Super',
      harvestDate: 'Jumat, 10 Okt 2026',
      dropOffTime: '18:00 - 20:00 WIB',
      hubDestination: 'Sentra Hub Kulon Progo (Sentolo)',
      allocatedKg: 500,
      targetAcceptedKg: 490,
      agreedPricePerKg: 31000,
      totalPaymentIdr: 15190000,
      status: 'VERIFIED' as const,
    },
    {
      id: 'ALO-KLP-0882',
      commodity: 'Cabai Rawit Merah Panjatan',
      harvestDate: 'Sabtu, 11 Okt 2026',
      dropOffTime: '17:30 - 19:30 WIB',
      hubDestination: 'Sentra Hub Kulon Progo (Sentolo)',
      allocatedKg: 250,
      targetAcceptedKg: 245,
      agreedPricePerKg: 46500,
      totalPaymentIdr: 11392500,
      status: 'VERIFIED' as const,
    },
    {
      id: 'ALO-KLP-0883',
      commodity: 'Cabai Keriting Merah',
      harvestDate: 'Senin, 13 Okt 2026',
      dropOffTime: '18:00 - 20:00 WIB',
      hubDestination: 'Sentra Hub Kulon Progo (Sentolo)',
      allocatedKg: 300,
      targetAcceptedKg: 295,
      agreedPricePerKg: 38000,
      totalPaymentIdr: 11210000,
      status: 'PENDING_VERIFICATION' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Komitmen Alokasi Pasokan ke Hub Transit
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Jadwal pengiriman hasil panen kelompok tani ke Sentra Hub Sentolo sebelum jam sortasi malam (21.00 WIB).
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Jadwal Panen Baru</span>
        </button>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Jadwal Alokasi Panen Pekan Ini
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {allocations.length} Alokasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Komoditas & No. Alokasi</th>
                <th className="py-3 px-4">Jadwal Setor Hub</th>
                <th className="py-3 px-4">Tujuan Hub</th>
                <th className="py-3 px-4 text-right">Kuota Pasok</th>
                <th className="py-3 px-4 text-right">Harga Kontrak</th>
                <th className="py-3 px-4 text-right">Total Nilai Escrow</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {allocations.map((item) => (
                <tr key={item.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{item.commodity}</div>
                    <div className="text-[11px] text-gelap/60 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gelap">{item.harvestDate}</div>
                    <div className="text-[11px] text-primer font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.dropOffTime}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gelap/80">
                    {item.hubDestination}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-gelap">
                    {item.allocatedKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap/80">
                    Rp {item.agreedPricePerKg.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">
                    Rp {item.totalPaymentIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={item.status} />
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
