'use client';

import * as React from 'react';
import { Banknote, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminEscrowPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success">Tata Kelola Keuangan</Badge>
          <span className="text-xs text-gelap/60">Bank BPD DIY &amp; Solosmartpay</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
          Rekening Escrow &amp; Settlement PasokMataram
        </h1>
        <p className="text-xs text-gelap/65 mt-1">
          Pengawasan dana escrow terproteksi dan penyelesaian otomatis H+1 bagi petani Gapoktan.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-netral-border/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <Banknote className="w-6 h-6 text-primer" />
          <div>
            <h2 className="text-sm font-bold text-gelap">Status Escrow Terpusat</h2>
            <p className="text-xs text-gelap/60">Semua transaksi escrow terlindungi dengan jaminan dana aman.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
