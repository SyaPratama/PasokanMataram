import type { Metadata } from 'next';
import { Clock, Plus, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Standing Orders Rutin Dapur | Portal HoReKa PasokMataram',
  description: 'Jadwal pemesanan bahan baku rutin dan kontrak pengadaan harian dapur restoran.',
};

/**
 * Halaman Manajemen Standing Orders Dapur HoReKa.
 * Mematuhi rute semantik bebas anchor hash dan format angka tabular monospaced.
 */
export default function BuyerOrdersPage() {
  const mockOrders = [
    {
      id: 'SO-2026-101',
      commodity: 'Bawang Merah Srikayangan (Grade A Super)',
      origin: 'Sentra Panjatan, Kulon Progo',
      frequency: 'Setiap Hari (Senin - Minggu)',
      dailyVolumeKg: 25,
      unitPrice: 32000,
      totalWeeklyIdr: 5600000,
      deliveryTime: '04:30 WIB',
      status: 'VERIFIED' as const,
    },
    {
      id: 'SO-2026-102',
      commodity: 'Cabai Rawit Merah Segar (Grade A)',
      origin: 'Gapoktan Pasir Makmur, Kulon Progo',
      frequency: '3x Seminggu (Sen, Rab, Jum)',
      dailyVolumeKg: 15,
      unitPrice: 48000,
      totalWeeklyIdr: 2160000,
      deliveryTime: '04:45 WIB',
      status: 'VERIFIED' as const,
    },
    {
      id: 'SO-2026-103',
      commodity: 'Beras Pandan Wangi Seyegan',
      origin: 'Sleman Agro Mandiri',
      frequency: 'Mingguan (Setiap Selasa)',
      dailyVolumeKg: 100,
      unitPrice: 15500,
      totalWeeklyIdr: 1550000,
      deliveryTime: '05:15 WIB',
      status: 'VERIFIED' as const,
    },
    {
      id: 'SO-2026-104',
      commodity: 'Kopi Robusta Merapi Biji Kering',
      origin: 'Sentra Lereng Merapi, Sleman',
      frequency: 'Dua Mingguan',
      dailyVolumeKg: 20,
      unitPrice: 85000,
      totalWeeklyIdr: 1700000,
      deliveryTime: '05:30 WIB',
      status: 'PENDING_VERIFICATION' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Standing Orders & Jadwal Pasokan Rutin
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Pengadaan otomatis terjadwal tanpa risiko kekosongan stok dapur menjelang jam operasional restoran.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-netral-border bg-white text-xs font-semibold text-gelap hover:bg-netral-canvas min-h-[44px] shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-gelap/60" />
            <span>Filter Status</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Standing Order Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Kontrak Aktif
          </div>
          <div className="text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            3 Kontrak
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            <span>Terjadwal kirim subuh ini</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Volume Mingguan
          </div>
          <div className="text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">
            320 kg
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Alokasi hub transit Kulon Progo & Bantul
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Estimasi Belanja Mingguan
          </div>
          <div className="text-2xl font-heading font-black text-sekunder mt-1 font-mono tabular-nums">
            Rp 9.310.000
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Terproteksi rekening escrow B2B
          </div>
        </div>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Daftar Kontrak Rutin Berjalan
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {mockOrders.length} Pesanan Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">No. Kontrak & Komoditas</th>
                <th className="py-3 px-4">Sentra Panen</th>
                <th className="py-3 px-4">Frekuensi & Jam Subuh</th>
                <th className="py-3 px-4 text-right">Volume / Kirim</th>
                <th className="py-3 px-4 text-right">Harga Kontrak / kg</th>
                <th className="py-3 px-4 text-right">Total / Minggu</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{order.commodity}</div>
                    <div className="text-[11px] text-gelap/60 font-mono flex items-center gap-1 mt-0.5">
                      <FileText className="w-3 h-3 text-gelap/40" />
                      {order.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gelap/80">
                    {order.origin}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gelap">{order.frequency}</div>
                    <div className="text-[11px] text-primer font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {order.deliveryTime}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-gelap">
                    {order.dailyVolumeKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap/80">
                    Rp {order.unitPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer">
                    Rp {order.totalWeeklyIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={order.status} />
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
