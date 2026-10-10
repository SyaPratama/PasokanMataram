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
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/shared/status-badge';
import { KybBlockerModal } from '../../../components/shared/kyb-blocker-modal';
import { MOCK_STANDING_ORDERS, type MockStandingOrder } from '../../../lib/mock-data';
import { canAccessFinancials } from '@pasok/security/tokens';
import type { MicroRole } from '@pasok/domain';

/**
 * Halaman Dashboard Role-Adaptive HoReKa.
 * Mematuhi FR-018 dan SC-007: Menyembunyikan total seluruh metrik finansial/escrow untuk peran Head Chef/Purchasing,
 * dan menampilkan kartu stok dapur kritis serta kalkulator resep COGS.
 */
export default function BuyerDashboardPage() {
  const [orders] = React.useState<MockStandingOrder[]>(MOCK_STANDING_ORDERS);
  const [currentRole, setCurrentRole] = React.useState<MicroRole>('HEAD_CHEF');
  const [kybModalOpen, setKybModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/pasok_session_role=([^;]+)/);
      if (match && match[1]) {
        setCurrentRole(match[1] as MicroRole);
      }
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
                ? 'Akses penuh saldo escrow, mutasi perbankan, dan pengadaan multi-outlet aktif.'
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
              ? 'Pantau perputaran dana komoditas, standing orders gerai, dan garansi escrow.'
              : 'Pantau ketersediaan stok bahan segar, jadwal subuh 04:30 WIB, dan alokasi pool kuota.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setKybModalOpen(true)}
            className="text-xs font-bold bg-sekunder text-white hover:bg-sekunder-hover shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Ajukan Kuota Pool
          </Button>
          <Link href="/buyer/outlets">
            <Button variant="outline" size="sm" className="text-xs">
              <Store className="w-3.5 h-3.5 mr-1.5" />
              Kelola Gerai
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasFinancialAccess ? (
          <div className="bg-white p-4 rounded-2xl border border-netral-border/70 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gelap/80">
              <span className="text-xs font-semibold uppercase tracking-wider">Saldo Escrow Aman</span>
              <div className="p-2 bg-primer-light rounded-xl text-primer">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primer font-heading">
              Rp 24.500.000
            </div>
            <div className="text-[11px] text-gelap/85 font-medium">
              Rekening Escrow BPD DIY
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
            <div className="text-2xl font-bold text-primer font-heading">
              320 <span className="text-xs font-medium text-gelap/80">Kilogram</span>
            </div>
            <div className="text-[11px] text-gelap/85 font-medium">
              Cukup untuk operasional 4 hari
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
            <div className="text-2xl font-bold text-sekunder font-heading">
              Rp 1.840.000
            </div>
            <div className="text-[11px] text-gelap/85 flex items-center font-medium">
              <span className="text-green-700 font-bold mr-1">&darr; 24.5%</span> vs Pasar Eceran
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
            <div className="text-2xl font-bold text-gelap font-heading">
              8 <span className="text-xs font-medium text-gelap/80">Menu Terhubung</span>
            </div>
            <div className="text-[11px] text-gelap/85 font-medium">
              Akurasi biaya porsi: 98.4%
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
            Besok Subuh
          </div>
          <div className="text-[11px] text-gelap/85 font-medium flex items-center gap-1.5">
            <span>Est. 04:30 WIB</span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>85 kg muatan</span>
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
              {hasFinancialAccess ? 'Purchase Orders Berjalan' : 'Daftar Penerimaan Bahan Baku Subuh'}
            </h2>
            <p className="text-[11px] text-gelap/85 mt-0.5">
              Jadwal Pengiriman Bahan Baku Rutin dari sentra Gapoktan via Cross-Dock Hub DIY.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primer-light text-primer whitespace-nowrap shrink-0">
            {orders.length} Batch Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-netral-canvas/60 text-gelap/85 font-semibold border-b border-netral-border">
              <tr>
                <th className="p-3.5">ID PO</th>
                <th className="p-3.5">Komoditas & Varietas</th>
                <th className="p-3.5">Gerai Tujuan</th>
                <th className="p-3.5">Volume</th>
                {hasFinancialAccess && <th className="p-3.5">Total Biaya</th>}
                <th className="p-3.5">Status Pengantaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60 text-gelap">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-netral-canvas/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primer">
                    {order.id}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold">{order.commodityName}</div>
                    <div className="text-[10px] text-gelap/85">Sentra Tani DIY</div>
                  </td>
                  <td className="p-3.5">
                    <div>{order.outletName}</div>
                  </td>
                  <td className="p-3.5 font-semibold">
                    {order.quantityKg} kg
                  </td>
                  {hasFinancialAccess && (
                    <td className="p-3.5 font-mono font-bold text-primer">
                      Rp {order.totalRp.toLocaleString('id-ID')}
                    </td>
                  )}
                  <td className="p-3.5">
                    <StatusBadge status={order.status === 'SIAP_KIRIM' ? 'VERIFIED' : 'PENDING_VERIFICATION'} />
                  </td>
                </tr>
              ))}
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
