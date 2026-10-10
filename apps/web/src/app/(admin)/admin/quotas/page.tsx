'use client';

import * as React from 'react';
import { ShoppingBag, TrendingUp, Layers, CheckCircle2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CommodityQuota {
  id: string;
  name: string;
  variety: string;
  regency: string;
  totalQuotaTon: number;
  allocatedTon: number;
  floorPriceRpPerKg: number;
  ceilingPriceRpPerKg: number;
  status: 'ACTIVE' | 'NEAR_CAPACITY' | 'COMPLETED';
}

const MOCK_QUOTAS: CommodityQuota[] = [
  {
    id: 'QTA-BAP-01',
    name: 'Bawang Merah',
    variety: 'Srikayangan Super (Grade A)',
    regency: 'Kulon Progo',
    totalQuotaTon: 25.0,
    allocatedTon: 21.5,
    floorPriceRpPerKg: 28000,
    ceilingPriceRpPerKg: 34000,
    status: 'NEAR_CAPACITY',
  },
  {
    id: 'QTA-CRM-02',
    name: 'Cabai Rawit Merah',
    variety: 'Panjatan Pedas Tinggi (Grade A)',
    regency: 'Kulon Progo',
    totalQuotaTon: 15.0,
    allocatedTon: 10.2,
    floorPriceRpPerKg: 42000,
    ceilingPriceRpPerKg: 52000,
    status: 'ACTIVE',
  },
  {
    id: 'QTA-BRS-03',
    name: 'Beras Premium',
    variety: 'Rojolele Delanggu & Menthik Wangi',
    regency: 'Sleman',
    totalQuotaTon: 50.0,
    allocatedTon: 38.0,
    floorPriceRpPerKg: 14500,
    ceilingPriceRpPerKg: 16500,
    status: 'ACTIVE',
  },
  {
    id: 'QTA-BAP-04',
    name: 'Bawang Merah',
    variety: 'Bawangan Bantul Lokal',
    regency: 'Bantul',
    totalQuotaTon: 18.0,
    allocatedTon: 18.0,
    floorPriceRpPerKg: 27000,
    ceilingPriceRpPerKg: 32500,
    status: 'COMPLETED',
  },
];

/**
 * Halaman Manajemen Kuota & Penetapan Floor Price Pangan DIY.
 * Dikelola oleh Konsorsium PasokMataram untuk menjaga stabilitas inflasi cabai & bawang merah.
 */
export default function AdminQuotasPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Batas Kuota Panen Musim Gadu 2026</Badge>
            <span className="text-xs text-gelap/60">5 Kabupaten/Kota DIY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Katalog Komoditas &amp; Alokasi Kuota Konsorsium
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Pengaturan batas serap panen agregat, penetapan harga dasar (floor price) petani, dan pencegahan tengkulak.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_QUOTAS.map((qta) => {
          const percent = Math.round((qta.allocatedTon / qta.totalQuotaTon) * 100);
          return (
            <div
              key={qta.id}
              className="bg-white p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primer">{qta.id}</span>
                  <h2 className="text-sm font-bold text-gelap font-heading mt-0.5">{qta.name}</h2>
                  <p className="text-xs text-gelap/70">{qta.variety}</p>
                </div>
                <Badge
                  variant={
                    qta.status === 'COMPLETED'
                      ? 'destructive'
                      : qta.status === 'NEAR_CAPACITY'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {qta.status === 'COMPLETED'
                    ? 'Kuota Penuh'
                    : qta.status === 'NEAR_CAPACITY'
                    ? 'Sisa Sedikit'
                    : 'Tersedia'}
                </Badge>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gelap/65">Terisi: {qta.allocatedTon} Ton</span>
                  <span className="font-bold text-gelap">{percent}% dari {qta.totalQuotaTon} Ton</span>
                </div>
                <div className="w-full bg-netral-border/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percent >= 100
                        ? 'bg-status-danger'
                        : percent >= 80
                        ? 'bg-aksen'
                        : 'bg-primer'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-netral-border/60 text-xs flex justify-between items-center text-gelap/85">
                <span className="flex items-center gap-1 text-gelap/60 text-[11px]">
                  <MapPin className="w-3 h-3 text-primer" aria-hidden="true" />
                  {qta.regency}
                </span>
                <span className="font-mono font-semibold text-primer text-[11px]">
                  Rp {qta.floorPriceRpPerKg.toLocaleString('id-ID')} /kg
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
