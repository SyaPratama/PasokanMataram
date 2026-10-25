'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { MOCK_COMMODITY_FORECASTS } from '../../../lib/mock-forecast-data';
import type { CommodityForecast, ForecastHorizon } from '../../../types/forecast';
import { ForecastInteractiveChart } from '../../../components/forecast/forecast-interactive-chart';
import { ForecastInsightCards } from '../../../components/forecast/forecast-insight-cards';

/**
 * Meja Kerja Prediksi Tren Harga Pasokan AI untuk Pengadaan HoReKa D.I. Yogyakarta.
 * Membantu kepala dapur dan manajer purchasing merencanakan menu dan pesanan bahan baku lebih hemat.
 */
export default function BuyerForecastPage() {
  const defaultCommodity = MOCK_COMMODITY_FORECASTS[0] as CommodityForecast;
  const [selectedCommodityId, setSelectedCommodityId] = React.useState<string>(
    defaultCommodity.id
  );
  const [horizon, setHorizon] = React.useState<ForecastHorizon>(30);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const selectedCommodity: CommodityForecast =
    MOCK_COMMODITY_FORECASTS.find((c) => c.id === selectedCommodityId) ||
    defaultCommodity;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    if (trend === 'UP') return <TrendingUp className="w-4 h-4 text-status-danger" />;
    if (trend === 'DOWN') return <TrendingDown className="w-4 h-4 text-status-success" />;
    return <Minus className="w-4 h-4 text-gelap/60" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
              Prediksi Tren Harga Pasokan Pangan
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-aksen-light text-aksen-dark font-extrabold border border-aksen/30">
              Tren DIY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Prakiraan kecerdasan buatan multi-horizon berbasis data pasar agregat Yogyakarta dan kalender agrikultur Gapoktan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-netral-border text-xs font-semibold text-gelap hover:bg-netral-canvas min-h-[44px] shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primer ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Segarkan Model</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MOCK_COMMODITY_FORECASTS.map((item) => {
          const isSelected = item.id === selectedCommodityId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedCommodityId(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 flex-shrink-0 ${
                isSelected
                  ? 'bg-primer text-white shadow-xs font-bold'
                  : 'bg-white border border-netral-border/80 text-gelap hover:border-primer/50'
              }`}
            >
              <span>{item.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-white/20 text-white' : 'bg-netral-canvas text-gelap/60'
              }`}>
                {item.trend === 'DOWN' ? `-${Math.abs(item.trendPercentage)}%` : `+${item.trendPercentage}%`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap truncate">
            Harga Patokan Hari Ini
          </div>
          <div className="text-xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.currentPrice.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-gelap/60"> / {selectedCommodity.unit}</span>
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 truncate">
            {selectedCommodity.originRegion}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap truncate">
            Proyeksi 7 Hari
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice7d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            {getTrendIcon(selectedCommodity.predictedPrice7d < selectedCommodity.currentPrice ? 'DOWN' : 'UP')}
            <span>
              {selectedCommodity.predictedPrice7d < selectedCommodity.currentPrice ? 'Kecenderungan Turun' : 'Kecenderungan Naik'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap truncate">
            Proyeksi 30 Hari
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice30d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            <span className={`font-mono font-bold ${
              selectedCommodity.trend === 'DOWN' ? 'text-status-success' : 'text-status-danger'
            }`}>
              {selectedCommodity.trendPercentage > 0 ? `+${selectedCommodity.trendPercentage}%` : `${selectedCommodity.trendPercentage}%`}
            </span>
            <span>vs harga saat ini</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap truncate">
            Proyeksi 90 Hari (Triwulan)
          </div>
          <div className="text-xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice90d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Akurasi model MAPE: <strong className="font-mono text-primer">{selectedCommodity.modelMetadata.mapeAccuracy}%</strong>
          </div>
        </div>
      </div>

      <ForecastInteractiveChart
        commodity={selectedCommodity}
        horizon={horizon}
        onHorizonChange={setHorizon}
      />

      <ForecastInsightCards
        commodity={selectedCommodity}
        userType="BUYER"
      />

      <div className="p-4 rounded-2xl bg-netral-canvas/60 border border-netral-border/70 text-xs text-gelap/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primer flex-shrink-0" />
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>Arsitektur Model: <strong className="text-gelap">{selectedCommodity.modelMetadata.algorithm}</strong></span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>Terakhir Diperbarui: <span className="font-mono">{selectedCommodity.modelMetadata.lastTrained}</span></span>
          </span>
        </div>
        <div className="text-[11px] text-gelap/60">
          Disclaimer: Proyeksi inferensi harga ditujukan untuk acuan mitigasi volatilitas pengadaan bahan baku dapur.
        </div>
      </div>
    </div>
  );
}
