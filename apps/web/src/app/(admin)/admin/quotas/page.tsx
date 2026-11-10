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


/**
 * Halaman Manajemen Kuota & Penetapan Floor Price Pangan DIY.
 * Dikelola oleh Konsorsium PasokMataram untuk menjaga stabilitas inflasi cabai & bawang merah.
 */
export default function AdminQuotasPage() {
  const quotas: CommodityQuota[] = [];
  return (
    <div className="space-y-6">
      <div className="border-b border-netral-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Alokasi Pasokan Bahan Pangan 2026</Badge>
            <span className="text-xs text-gelap/60">5 Kabupaten/Kota DIY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
            Katalog Komoditas &amp; Alokasi Kuota Konsorsium
          </h1>
          <p className="text-xs text-gelap/65 mt-1">
            Pengaturan batas serap pasokan agregat, penetapan harga dasar (floor price) produsen, dan jaminan transparansi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quotas.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-netral-border/80 shadow-xs">
            <h3 className="text-base font-bold text-gelap font-heading mb-1">Tidak Ada</h3>
            <p className="text-xs text-gelap/60">Belum ada data kuota agregat yang aktif saat ini.</p>
          </div>
        ) : (
          quotas.map((qta) => {
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
        }))}
      </div>
    </div>
  );
}
