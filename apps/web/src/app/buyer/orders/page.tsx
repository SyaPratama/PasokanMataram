'use client';

import * as React from 'react';
import { Clock, Plus, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';
import { KybBlockerModal } from '../../../components/shared/kyb-blocker-modal';
import type { StandingOrder } from '@pasok/domain';
import { z } from 'zod';

const OrderResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: z.string(),
    commodity: z.string(),
    supplierName: z.string(),
    quantityKg: z.number(),
    pricePerKg: z.number(),
    totalAmountRp: z.number(),
    status: z.string(),
  })),
});
function toStandingOrderStatus(status: string): StandingOrder['status'] {
  if (status === 'PENDING_PAYMENT') return 'PENDING_VERIFICATION';
  if (status === 'PAID' || status === 'ALLOCATED' || status === 'RECEIVED') return 'VERIFIED';
  if (status === 'CANCELLED' || status === 'DISPUTED') return 'REJECTED';
  return 'UNVERIFIED';
}

/**
 * Halaman Manajemen Standing Orders Dapur HoReKa.
 * Memfasilitasi pembuatan kontrak pasokan rutin dengan validasi domain Zod.
 */
export default function BuyerOrdersPage() {
  const [orders, setOrders] = React.useState<StandingOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isKybVerified, setIsKybVerified] = React.useState<boolean>(false);
  const [isKybModalOpen, setIsKybModalOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch('/api/v1/orders')
      .then(async (response) => {
        if (!response.ok) throw new Error('Data pesanan tidak tersedia.');
        const parsed = OrderResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons pesanan tidak valid.');
        setOrders(parsed.data.data.map((order) => ({
          id: order.id,
          commodity: order.commodity,
          origin: order.supplierName,
          frequency: 'Frekuensi belum tercatat',
          dailyVolumeKg: order.quantityKg,
          unitPrice: order.pricePerKg,
          totalRp: order.totalAmountRp,
          deliveryTime: 'Waktu pengiriman belum tercatat',
          status: toStandingOrderStatus(order.status),
        })));
      })
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
    fetch('/api/v1/tenant/current')
      .then(async (response) => {
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const tenant = data.data;
          if (typeof tenant === 'object' && tenant !== null && 'kybStatus' in tenant) setIsKybVerified(tenant.kybStatus === 'VERIFIED');
        }
      })
      .catch(() => setIsKybVerified(false));
  }, []);
  const totalContracts = orders.length;
  const totalVolumeKg = orders.reduce((sum, order) => sum + order.dailyVolumeKg, 0);
  const totalSpendRp = orders.reduce((sum, order) => sum + order.totalRp, 0);


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
            disabled={isKybVerified}
            onClick={() => setIsKybModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-netral-border text-gelap/60 text-xs font-bold min-h-[44px] cursor-not-allowed"
            aria-label={isKybVerified ? 'Reservasi API belum tersedia' : 'Verifikasi KYB diperlukan'}
          >
            <Plus className="w-4 h-4" />
            <span>{isKybVerified ? 'Reservasi API belum tersedia' : 'KYB belum terverifikasi'}</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Pesanan Tercatat
          </div>
          <div className="text-xl sm:text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums whitespace-nowrap tracking-tight">
            {totalContracts} Pesanan
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            <span>Status pengiriman berdasarkan data pesanan</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Volume Pesanan
          </div>
          <div className="text-xl sm:text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums whitespace-nowrap tracking-tight">
            {totalVolumeKg.toLocaleString('id-ID')} kg
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Total kuantitas reservasi tersimpan
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Total Nilai Pesanan
          </div>
          <div className="text-xl sm:text-2xl font-heading font-black text-sekunder mt-1 font-mono tabular-nums whitespace-nowrap tracking-tight">
            Rp {totalSpendRp.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Total nilai reservasi tersimpan; status pembayaran terpisah
          </div>
        </div>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Daftar Pesanan &amp; Reservasi
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {orders.length} Pesanan Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">ID Pesanan &amp; Komoditas</th>
                <th className="py-3 px-4">Supplier / Pemasok</th>
                <th className="py-3 px-4">Jadwal Pengiriman</th>
                <th className="py-3 px-4 text-right">Volume (kg)</th>
                <th className="py-3 px-4 text-right">Harga / kg</th>
                <th className="py-3 px-4 text-right">Total Nilai</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 w-32 bg-netral-border/40 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-28 bg-netral-border/40 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 w-24 bg-netral-border/40 rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-12 bg-netral-border/40 rounded ml-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-netral-border/40 rounded ml-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 w-20 bg-netral-border/40 rounded ml-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 w-16 bg-netral-border/40 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-gelap/60 text-xs">
                    Belum ada data pesanan berjalan.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
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
                      Rp {(order.unitPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-primer whitespace-nowrap">
                      Rp {(order.totalRp || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <KybBlockerModal isOpen={isKybModalOpen} onClose={() => setIsKybModalOpen(false)} actionAttempted="Penerbitan kontrak standing order" />

    </div>
  );
}
