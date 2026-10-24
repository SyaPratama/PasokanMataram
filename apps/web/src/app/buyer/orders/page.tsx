'use client';

import * as React from 'react';
import { Clock, Plus, Filter, FileText, CheckCircle2, X } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { StandingOrderSchema, type StandingOrder } from '@pasok/domain';

const INITIAL_ORDERS: StandingOrder[] = [
  {
    id: 'SO-2026-101',
    commodity: 'Bawang Merah Srikayangan (Grade A Super)',
    origin: 'Sentra Panjatan, Kulon Progo',
    frequency: 'Setiap Hari (Senin - Minggu)',
    dailyVolumeKg: 25,
    unitPrice: 32000,
    totalWeeklyIdr: 5600000,
    deliveryTime: '04:30 WIB',
    status: 'VERIFIED',
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
    status: 'VERIFIED',
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
    status: 'VERIFIED',
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
    status: 'PENDING_VERIFICATION',
  },
];

/**
 * Halaman Manajemen Standing Orders Dapur HoReKa.
 * Memfasilitasi pembuatan kontrak pasokan rutin dengan validasi domain Zod.
 */
export default function BuyerOrdersPage() {
  const [orders, setOrders] = React.useState<StandingOrder[]>(INITIAL_ORDERS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [commodity, setCommodity] = React.useState('');
  const [origin, setOrigin] = React.useState('');
  const [frequency, setFrequency] = React.useState('Setiap Hari (Senin - Minggu)');
  const [dailyVolumeKg, setDailyVolumeKg] = React.useState<number>(20);
  const [unitPrice, setUnitPrice] = React.useState<number>(30000);
  const [deliveryTime, setDeliveryTime] = React.useState('05:00 WIB');
  const [notification, setNotification] = React.useState<string | null>(null);

  const totalContracts = orders.length;
  const totalVolumeWeekly = orders.reduce((sum, o) => sum + o.dailyVolumeKg * 7, 0);
  const totalSpendWeekly = orders.reduce((sum, o) => sum + o.totalWeeklyIdr, 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedTotalWeekly = dailyVolumeKg * unitPrice * (frequency.includes('3x') ? 3 : 7);
    const newOrderData = {
      id: `SO-2026-${(orders.length + 105).toString()}`,
      commodity: commodity.trim() || 'Komoditas Bahan Baku Dapur',
      origin: origin.trim() || 'Sentra Pertanian D.I. Yogyakarta',
      frequency,
      dailyVolumeKg,
      unitPrice,
      totalWeeklyIdr: calculatedTotalWeekly,
      deliveryTime,
      status: 'PENDING_VERIFICATION' as const,
    };

    const parsed = StandingOrderSchema.safeParse(newOrderData);
    if (!parsed.success) {
      setNotification('Gagal memvalidasi data standing order. Pastikan volume dan harga bernilai positif.');
      return;
    }

    setOrders([parsed.data, ...orders]);
    setIsModalOpen(false);
    setCommodity('');
    setOrigin('');
    setNotification(`Standing order ${parsed.data.id} berhasil diajukan untuk verifikasi pengantaran subuh.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Standing Orders &amp; Jadwal Pasokan Rutin
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
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Standing Order Baru</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-primer-light border border-primer/30 text-primer text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primer" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-primer/15 text-primer min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Kontrak Aktif
          </div>
          <div className="text-xl sm:text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums whitespace-nowrap tracking-tight">
            {totalContracts} Kontrak
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
          <div className="text-xl sm:text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums whitespace-nowrap tracking-tight">
            {totalVolumeWeekly.toLocaleString('id-ID')} kg
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Alokasi hub transit Kulon Progo &amp; Bantul
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Estimasi Belanja Mingguan
          </div>
          <div className="text-xl sm:text-2xl font-heading font-black text-sekunder mt-1 font-mono tabular-nums whitespace-nowrap tracking-tight">
            Rp {totalSpendWeekly.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Terproteksi rekening bersama escrow
          </div>
        </div>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Daftar Kontrak Rutin Berjalan
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {orders.length} Pesanan Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">No. Kontrak &amp; Komoditas</th>
                <th className="py-3 px-4">Sentra Panen</th>
                <th className="py-3 px-4">Frekuensi &amp; Jam Subuh</th>
                <th className="py-3 px-4 text-right">Volume / Hari</th>
                <th className="py-3 px-4 text-right">Harga Kontrak / kg</th>
                <th className="py-3 px-4 text-right">Total / Minggu</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{order.commodity}</div>
                    <div className="text-[11px] text-gelap/60 font-mono flex items-center gap-1 mt-0.5">
                      <FileText className="w-3 h-3 text-gelap/40" />
                      {order.id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gelap/80">{order.origin}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gelap">{order.frequency}</div>
                    <div className="text-[11px] text-primer font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {order.deliveryTime}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-gelap whitespace-nowrap">
                    {order.dailyVolumeKg} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-gelap/80 whitespace-nowrap">
                    Rp {order.unitPrice.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer whitespace-nowrap">
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

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-gelap/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-netral-border space-y-4">
            <div className="flex items-center justify-between border-b border-netral-border/70 pb-3">
              <h2 className="text-base font-bold font-heading text-gelap">
                Buat Kontrak Standing Order Baru
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-netral-canvas text-gelap/70 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup formulir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="so-commodity" className="block font-bold text-gelap mb-1">
                  Nama Komoditas &amp; Spesifikasi
                </label>
                <Input
                  id="so-commodity"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder="Contoh: Bawang Merah Srikayangan Super A"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="so-origin" className="block font-bold text-gelap mb-1">
                  Sentra Produsen / Gapoktan
                </label>
                <Input
                  id="so-origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Contoh: Gapoktan Sentolo Kulon Progo"
                  required
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="so-volume" className="block font-bold text-gelap mb-1">
                    Volume per Kirim (kg)
                  </label>
                  <Input
                    id="so-volume"
                    type="number"
                    min="1"
                    value={dailyVolumeKg}
                    onChange={(e) => setDailyVolumeKg(Number(e.target.value))}
                    required
                    className="w-full font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="so-price" className="block font-bold text-gelap mb-1">
                    Harga Satuan / kg (Rp)
                  </label>
                  <Input
                    id="so-price"
                    type="number"
                    min="1000"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    required
                    className="w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="so-freq" className="block font-bold text-gelap mb-1">
                    Frekuensi Pengantaran
                  </label>
                  <select
                    id="so-freq"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full border border-netral-border rounded-xl px-3 py-2 bg-white text-gelap min-h-[44px]"
                  >
                    <option value="Setiap Hari (Senin - Minggu)">Setiap Hari</option>
                    <option value="3x Seminggu (Sen, Rab, Jum)">3x Seminggu</option>
                    <option value="Mingguan (Setiap Selasa)">Mingguan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="so-time" className="block font-bold text-gelap mb-1">
                    Jadwal Tiba Subuh
                  </label>
                  <Input
                    id="so-time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="04:30 WIB"
                    required
                    className="w-full font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-netral-border/70 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] text-xs font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="min-h-[44px] text-xs font-bold bg-primer text-white hover:bg-primer-hover"
                >
                  Ajukan Kontrak Standing Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
