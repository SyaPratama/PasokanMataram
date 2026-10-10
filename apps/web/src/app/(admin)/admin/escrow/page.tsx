'use client';

import * as React from 'react';
import { Scale, Banknote, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerName: string;
  supplierName: string;
  amountRp: number;
  bankAccount: string;
  qcConfirmedAt: string;
  payoutStatus: 'HELD_IN_ESCROW' | 'RELEASED_TO_SUPPLIER' | 'REFUNDED_TO_BUYER';
}

const MOCK_ESCROW: EscrowTransaction[] = [
  {
    id: 'ESC-20261010-001',
    orderId: 'PO-20261009-082',
    buyerName: 'Restoran Bale Raos Kraton',
    supplierName: 'Gapoktan Srikayangan Makmur',
    amountRp: 24500000,
    bankAccount: 'BPD DIY Virtual Account #982103',
    qcConfirmedAt: '05:45 WIB (Chef Bambang)',
    payoutStatus: 'RELEASED_TO_SUPPLIER',
  },
  {
    id: 'ESC-20261010-002',
    orderId: 'PO-20261009-083',
    buyerName: 'Kopi Klotok Pakem',
    supplierName: 'Kelompok Tani Panjatan Maju',
    amountRp: 12250000,
    bankAccount: 'BPD DIY Virtual Account #982104',
    qcConfirmedAt: '06:10 WIB (Manager Outlet)',
    payoutStatus: 'RELEASED_TO_SUPPLIER',
  },
  {
    id: 'ESC-20261010-003',
    orderId: 'PO-20261010-001',
    buyerName: 'Hotel Tentrem Yogyakarta',
    supplierName: 'Gapoktan Sidomulyo Godean',
    amountRp: 18400000,
    bankAccount: 'BPD DIY Virtual Account #982105',
    qcConfirmedAt: 'Menunggu QC Gerai (Tiba 05:30 WIB)',
    payoutStatus: 'HELD_IN_ESCROW',
  },
];

/**
 * Halaman Pengawasan Rekening Bersama Escrow Terproteksi Bank Indonesia & BPD DIY.
 * Memantau pelepasan dana otomatis saat koki restoran mengonfirmasi penerimaan bahan baku.
 */
export default function AdminEscrowPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Kemitraan Perbankan BPD DIY &amp; BI</Badge>
            <span className="text-xs text-gelap/60">Perlindungan Pembeli &amp; Petani 100%</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Pengawasan Rekening Bersama (Escrow) Konsorsium
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Dana transaksi belanja dapur ditahan di rekening perantara aman s/d koki memeriksa kualitas fisik barang di gerai.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs">
          <span className="text-xs font-semibold text-gelap/70">Total Dana Tertampung Saat Ini</span>
          <div className="text-2xl font-bold font-mono text-primer mt-2">Rp 482.500.000</div>
          <p className="text-[11px] text-gelap/60 mt-1">Rekening Operasional BPD DIY Escrow</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs">
          <span className="text-xs font-semibold text-gelap/70">Pencairan Sukses Hari Ini</span>
          <div className="text-2xl font-bold font-mono text-gelap mt-2">Rp 148.200.000</div>
          <p className="text-[11px] text-gelap/60 mt-1">Ditransfer otomatis ke rekening kas Gapoktan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs">
          <span className="text-xs font-semibold text-gelap/70">Dana Tertahan (Menunggu QC)</span>
          <div className="text-2xl font-bold font-mono text-aksen-dark mt-2">Rp 36.650.000</div>
          <p className="text-[11px] text-gelap/60 mt-1">Rilis otomatis setelah verifikasi koki gerai</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-netral-border/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-netral-border/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gelap font-heading">
              Mutasi Rekening Escrow Terkini
            </h2>
            <p className="text-[11px] text-gelap/65 mt-0.5">
              Sinkronisasi realtime dari gateway perbankan BPD DIY.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primer-light text-primer whitespace-nowrap shrink-0">
            {MOCK_ESCROW.length} Transaksi Terpantau
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-netral-canvas/60 text-gelap/85 font-semibold border-b border-netral-border">
              <tr>
                <th className="p-3.5">ID Escrow</th>
                <th className="p-3.5">Pembeli HoReKa</th>
                <th className="p-3.5">Pemasok Gapoktan</th>
                <th className="p-3.5">Nominal Transaksi</th>
                <th className="p-3.5">Status Konfirmasi QC</th>
                <th className="p-3.5">Status Dana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60 text-gelap">
              {MOCK_ESCROW.map((esc) => (
                <tr key={esc.id} className="hover:bg-netral-canvas/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primer">{esc.id}</td>
                  <td className="p-3.5 font-semibold">{esc.buyerName}</td>
                  <td className="p-3.5 text-gelap/85">{esc.supplierName}</td>
                  <td className="p-3.5 font-mono font-bold">
                    Rp {esc.amountRp.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 text-[11px] text-gelap/70">{esc.qcConfirmedAt}</td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        esc.payoutStatus === 'RELEASED_TO_SUPPLIER' ? 'success' : 'warning'
                      }
                    >
                      {esc.payoutStatus === 'RELEASED_TO_SUPPLIER'
                        ? 'Dana Dicairkan'
                        : 'Tertahan Aman'}
                    </Badge>
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
