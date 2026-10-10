'use client';

import * as React from 'react';
import type { CommodityForecast } from '../../types/forecast';
import {
  Sparkles,
  CloudRain,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface ForecastInsightCardsProps {
  commodity: CommodityForecast;
  userType?: 'BUYER' | 'SUPPLIER' | 'PUBLIC';
}

/**
 * Komponen kartu wawasan cerdas rekomendasi belanja dan anomali cuaca BMKG.
 * Memberikan nilai tambah operasional dengan analisis actionable untuk dapur maupun kelompok tani.
 */
export function ForecastInsightCards({
  commodity,
  userType = 'BUYER',
}: ForecastInsightCardsProps) {
  const { optimalBuyWindow, weatherAnomalyRisk, modelMetadata } = commodity;

  const actionBadgeMap = {
    BELI_SEKARANG: {
      label: 'Beli Sekarang (Harga Optimal)',
      color: 'bg-status-success/15 text-status-success border-status-success/30',
      icon: CheckCircle2,
    },
    TUNGGU_PANEN_RAYA: {
      label: 'Tunggu Puncak Panen Raya',
      color: 'bg-aksen-light text-aksen-dark border-aksen/30',
      icon: Calendar,
    },
    KUNCI_KONTRAK: {
      label: 'Kunci Kontrak Forward Segera',
      color: 'bg-sekunder-light text-sekunder border-sekunder/30',
      icon: Sparkles,
    },
  };

  const actionBadge = actionBadgeMap[optimalBuyWindow.recommendedAction];
  const ActionIcon = actionBadge.icon;

  const weatherRiskMap = {
    RENDAH: {
      label: 'Risiko Rendah',
      color: 'bg-status-success/15 text-status-success',
      icon: ShieldCheck,
    },
    SEDANG: {
      label: 'Risiko Sedang',
      color: 'bg-aksen-light text-aksen-dark',
      icon: AlertTriangle,
    },
    TINGGI: {
      label: 'Risiko Anomali Tinggi',
      color: 'bg-status-danger/15 text-status-danger',
      icon: ShieldAlert,
    },
  };

  const weatherBadge = weatherRiskMap[weatherAnomalyRisk.riskLevel];
  const WeatherIcon = weatherBadge.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Kartu Rekomendasi Aksi */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primer-light flex items-center justify-center text-primer">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-gelap">
                Rekomendasi Waktu Pengadaan Cerdas
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${actionBadge.color}`}>
              <ActionIcon className="w-3.5 h-3.5" />
              <span>{actionBadge.label}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-netral-canvas/60 border border-netral-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold text-gelap/60 uppercase tracking-wider">
                Jendela Pembelian Optimal:
              </div>
              <div className="text-sm font-bold text-gelap font-heading flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-primer" />
                <span>{optimalBuyWindow.startDate} &ndash; {optimalBuyWindow.endDate}</span>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-[10px] font-semibold text-gelap/60 uppercase tracking-wider">
                Target Harga Efisien:
              </div>
              <div className="text-base font-extrabold text-primer font-mono tabular-nums">
                Rp {optimalBuyWindow.targetPrice.toLocaleString('id-ID')}
                <span className="text-xs font-normal text-gelap/60"> / {commodity.unit}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gelap/80 leading-relaxed">
            {optimalBuyWindow.explanation}
          </p>
        </div>

        <div className="pt-3 border-t border-netral-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[11px] text-gelap/60">
            Tingkat keyakinan model: <strong className="text-primer font-mono">{commodity.confidenceScore}%</strong>
          </span>

          {userType === 'BUYER' && (
            <Link
              href="/buyer/orders"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
            >
              <span>Jadwalkan Standing Order Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {userType === 'SUPPLIER' && (
            <Link
              href="/supplier/allocations"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
            >
              <span>Buka Alokasi Kuota Pasok Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {userType === 'PUBLIC' && (
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
            >
              <span>Daftar Kemitraan PasokMataram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Kartu Anomali Cuaca BMKG */}
      <div className="p-5 rounded-2xl bg-white border border-netral-border/80 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-aksen-light flex items-center justify-center text-aksen-dark">
                <CloudRain className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-gelap">
                Anomali Cuaca Agrikultur
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${weatherBadge.color}`}>
              <WeatherIcon className="w-3 h-3" />
              <span>{weatherBadge.label}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-netral-canvas/60 border border-netral-border/60">
            <div className="text-[10px] font-semibold text-gelap/60 uppercase">
              Curah Hujan Dasarian:
            </div>
            <div className="text-sm font-bold text-gelap font-mono tabular-nums mt-0.5">
              {weatherAnomalyRisk.rainfallForecastMm} mm / dasarian
            </div>
          </div>

          <p className="text-xs text-gelap/80 leading-relaxed">
            {weatherAnomalyRisk.description}
          </p>
        </div>

        <div className="pt-2 border-t border-netral-border/60 text-[10px] text-gelap/60 leading-tight">
          Sumber: {weatherAnomalyRisk.bmkgSource}
        </div>
      </div>
    </div>
  );
}
