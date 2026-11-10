'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingDown,
  Clock,
  ShieldCheck,
  Plus,
  Store,
  Calendar,
  AlertCircle,
  ChefHat,
  Wallet,
  CookingPot,
  Sparkles,
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/shared/status-badge';
import { KybBlockerModal } from '../../../components/shared/kyb-blocker-modal';
import type { StandingOrder as MockStandingOrder } from '../../../types/models';
import { canAccessFinancials } from '@pasok/security/edge';
import type { MicroRole } from '@pasok/domain';

const OrderResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: z.string(),
    commodity: z.string(),
    deliveryAddress: z.string(),
    quantityKg: z.number(),
    pricePerKg: z.number(),
    totalAmountRp: z.number(),
    status: z.string(),
    createdAt: z.string(),
  })),
});

function toStandingOrderStatus(status: string): MockStandingOrder['status'] {
  return status === 'PAID' || status === 'ALLOCATED' ? 'CONFIRMED' : status === 'RECEIVED' ? 'ACTIVE' : status;
}
interface TenantIdentity {
  tenantId: string;
  businessName: string;
  tenantType: string;
  regency: string;
  kybStatus: string;
  macroRole: string;
  microRole?: string;
}

export default function BuyerDashboardPage() {
  const [orders, setOrders] = React.useState<MockStandingOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(true);
  const [currentRole, setCurrentRole] = React.useState<MicroRole>('HEAD_CHEF');
  const [kybModalOpen, setKybModalOpen] = React.useState(false);
  const [tenantIdentity, setTenantIdentity] = React.useState<TenantIdentity | null>(null);
  const [loadingTenant, setLoadingTenant] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/v1/orders')
      .then(async (response) => {
        if (!response.ok) throw new Error('Data pesanan tidak tersedia.');
        const parsed = OrderResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons pesanan tidak valid.');
        setOrders(parsed.data.data.map((order) => ({
          id: order.id,
          commodityName: order.commodity,
          outletName: order.deliveryAddress,
          quantityKg: order.quantityKg,
          unitPriceRp: order.pricePerKg,
          totalRp: order.totalAmountRp,
          deliveryWindow: 'Waktu pengiriman belum tercatat',
          status: toStandingOrderStatus(order.status),
        })));
      })
      .catch(() => setOrders([]))
      .finally(() => setIsLoadingOrders(false));
  }, []);
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/pasok_session_role=([^;]+)/);
      if (match && match[1]) {
        setCurrentRole(match[1] as MicroRole);
      }

      const fetchTenant = async () => {
        try {
          const res = await fetch('/api/v1/tenant/current');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setTenantIdentity(data.data);
              if (data.data.microRole) {
                setCurrentRole(data.data.microRole as MicroRole);
              }
            }
          }
        } catch {
        } finally {
          setLoadingTenant(false);
        }
      };

      fetchTenant();
    }
  }, []);

  const hasFinancialAccess = canAccessFinancials(currentRole);

  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-2xl bg-white border border-netral-border/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primer-light flex items-center justify-center text-primer flex-shrink-0">
            {hasFinancialAccess ? (
              <Wallet className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChefHat className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-gelap flex items-center gap-2">
              <span>Mode Tampilan: <strong>{hasFinancialAccess ? 'Finansial & Owner' : 'Operasional Dapur & Koki'}</strong></span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-netral-canvas text-primer font-semibold">
                {currentRole}
              </span>
            </div>
            <p className="text-[11px] text-gelap/85 mt-0.5">
              {hasFinancialAccess
                ? 'Akses penuh saldo pembayaran, mutasi perbankan, dan pengadaan multi-outlet aktif.'
                : 'Metrik saldo & transaksi keuangan disembunyikan total demi privasi bisnis.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const nextRole: MicroRole = currentRole === 'HEAD_CHEF' ? 'OWNER' : 'HEAD_CHEF';
              setCurrentRole(nextRole);
              if (typeof document !== 'undefined') {
                document.cookie = `pasok_session_role=${nextRole}; path=/; max-age=604800`;
              }
            }}
            className="text-xs h-8"
          >
            Alih ke {currentRole === 'HEAD_CHEF' ? 'Mode Owner' : 'Mode Chef'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-netral-border/60 pb-4">
        <div>
          <h1 className="text-xl font-bold font-heading text-gelap">
            {hasFinancialAccess ? 'Ringkasan Pengadaan & Finansial' : 'Meja Kerja Operasional Dapur'}
          </h1>
          <p className="text-xs text-gelap/85 mt-1">
            {hasFinancialAccess
              ? 'Pantau perputaran dana komoditas, standing orders gerai, dan status pembayaran.'
              : 'Pantau ketersediaan stok bahan segar dan alokasi pool kuota.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setKybModalOpen(true)}
            className="text-xs font-bold bg-sekunder text-white hover:bg-sekunder-hover shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>+ Kuota Pool</span>
          </Button>
          <Link href="/buyer/outlets">
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap shrink-0">
              <Store className="w-3.5 h-3.5 mr-1" />
              <span>Gerai</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasFinancialAccess ? (
          <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gelap/80">
              <span className="text-xs font-semibold uppercase tracking-wider">Saldo Tersedia</span>
              <div className="p-2 bg-primer-light rounded-xl text-primer">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-primer font-heading whitespace-nowrap tracking-tight tabular-nums">
              {orders.length > 0 ? `Rp ${orders.reduce((sum, o) => sum + (o.totalRp || 0), 0).toLocaleString('id-ID')}` : 'Tidak Ada'}
            </div>
            <div className="text-[11px] text-gelap/85 font-medium">
              Data rekening belum tersedia
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gelap/80">
              <span className="text-xs font-semibold uppercase tracking-wider">Stok Bahan Siap Pakai</span>
              <div className="p-2 bg-primer-light rounded-xl text-primer">
                <CookingPot className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-primer font-heading whitespace-nowrap tracking-tight">
              {orders.length > 0 ? `${orders.reduce((sum, o) => sum + (o.quantityKg || 0), 0)} Kilogram` : 'Tidak Ada'}
            </div>
            <div className="text-[11px] text-gelap/85 font-medium">
              {orders.length > 0 ? 'Stok Dapur Terjadwal' : 'Tidak Ada'}
            </div>
          </div>
        )}

        {hasFinancialAccess ? (
          <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gelap/80">
              <span className="text-xs font-semibold uppercase tracking-wider">Hemat Pooling Bulan Ini</span>
              <div className="p-2 bg-sekunder-light rounded-xl text-sekunder">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-sekunder font-heading whitespace-nowrap tracking-tight tabular-nums">
              Tidak tersedia
            </div>
            <div className="text-[11px] text-gelap/85 flex items-center font-medium">
              Belum ada data pembanding harga
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gelap/80">
              <span className="text-xs font-semibold uppercase tracking-wider">Kalkulator Resep COGS</span>
              <div className="p-2 bg-aksen/15 rounded-xl text-aksen-dark">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gelap font-heading whitespace-nowrap tracking-tight">
              Tidak tersedia
            </div>
            <div className="text-[11px] text-gelap/85 font-medium">
              Data resep COGS belum tersedia
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gelap/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Jadwal Drop Terdekat</span>
            <div className="p-2 bg-netral-canvas rounded-xl text-primer border border-netral-border">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-gelap font-heading">
            {orders.length > 0 ? 'Belum ada jadwal pengiriman' : 'Tidak Ada'}
          </div>
          <div className="text-[11px] text-gelap/85 font-medium flex items-center gap-1.5">
            Waktu pengiriman belum tercatat
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gelap/80">
            <span className="text-xs font-semibold uppercase tracking-wider">Jaminan Mutu QC Hub</span>
            <div className="p-2 bg-primer-light rounded-xl text-primer">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-primer font-heading flex items-center">
            Grade A Prima
          </div>
          <div className="text-[11px] text-gelap/85 font-medium">
            Lolos uji kadar air &lt; 14%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-netral-border/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-netral-border/70 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gelap font-heading">
              Daftar Pesanan &amp; Reservasi Berjalan
            </h2>
            <p className="text-[11px] text-gelap/85 mt-0.5">
              Daftar reservasi dan pesanan komoditas pangan dari supplier terdaftar.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primer-light text-primer whitespace-nowrap shrink-0">
            {orders.length} Pesanan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-netral-canvas/60 text-gelap/85 font-semibold border-b border-netral-border">
              <tr>
                <th className="p-3.5">ID Pesanan</th>
                <th className="p-3.5">Komoditas</th>
                <th className="p-3.5">Alamat Pengiriman</th>
                <th className="p-3.5">Volume</th>
                {hasFinancialAccess && <th className="p-3.5">Total Biaya</th>}
                <th className="p-3.5">Status Pesanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60 text-gelap">
              {isLoadingOrders ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3.5"><div className="h-4 w-16 bg-netral-border/40 rounded" /></td>
                    <td className="p-3.5"><div className="h-4 w-32 bg-netral-border/40 rounded" /></td>
                    <td className="p-3.5"><div className="h-4 w-24 bg-netral-border/40 rounded" /></td>
                    <td className="p-3.5"><div className="h-4 w-12 bg-netral-border/40 rounded" /></td>
                    {hasFinancialAccess && <td className="p-3.5"><div className="h-4 w-20 bg-netral-border/40 rounded" /></td>}
                    <td className="p-3.5"><div className="h-4 w-16 bg-netral-border/40 rounded" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={hasFinancialAccess ? 6 : 5} className="p-8 text-center text-gelap/60 text-xs">
                    Belum ada data pesanan aktif.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-netral-canvas/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primer">
                      {order.id || '-'}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold">{order.commodityName || 'Tidak Ada'}</div>
                      <div className="text-[10px] text-gelap/85">{order.deliveryWindow}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{order.outletName || 'Tidak Ada'}</div>
                    </td>
                    <td className="p-3.5 font-semibold">
                      {order.quantityKg} kg
                    </td>
                    {hasFinancialAccess && (
                      <td className="p-3.5 font-mono font-bold text-primer">
                        Rp {(order.totalRp || 0).toLocaleString('id-ID')}
                      </td>
                    )}
                    <td className="p-3.5">
                      <StatusBadge status={order.status === 'CONFIRMED' || order.status === 'ACTIVE' ? 'VERIFIED' : 'PENDING_VERIFICATION'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KybBlockerModal
        isOpen={kybModalOpen}
        onClose={() => setKybModalOpen(false)}
        actionAttempted="Permintaan Alokasi Kuota Pool >50 kg"
        quotaKg={100}
      />
    </div>
  );
}
