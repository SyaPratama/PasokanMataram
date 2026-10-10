'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Tractor,
  Calendar,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { MOCK_COMMODITY_FORECASTS } from '../../../lib/mock-forecast-data';
import type { CommodityForecast, ForecastHorizon } from '../../../types/forecast';
import { ForecastInteractiveChart } from '../../../components/forecast/forecast-interactive-chart';
import { ForecastInsightCards } from '../../../components/forecast/forecast-insight-cards';

/**
 * Meja Kerja Proyeksi Harga Panen AI untuk Petani Mitra Gapoktan D.I. Yogyakarta.
 * Membantu kelompok tani menentukan jadwal petik optimal dan memprediksi nilai tampung di Hub Transit.
 */
export default function SupplierForecastPage() {
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
    if (trend === 'UP') return <TrendingUp className="w-4 h-4 text-status-success" />;
    if (trend === 'DOWN') return <TrendingDown className="w-4 h-4 text-status-danger" />;
    return <Minus className="w-4 h-4 text-gelap/60" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
              Proyeksi Harga Panen Komoditas AI
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sekunder-light text-sekunder font-extrabold border border-sekunder/30">
              Mitra Gapoktan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Panduan kecerdasan buatan untuk mengoptimalkan kalender petik dan memprediksi harga tampung di Hub Transit Sentolo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-netral-border text-xs font-semibold text-gelap hover:bg-netral-canvas min-h-[44px] shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primer ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Perbarui Proyeksi</span>
        </button>
      </div>

      {/* Selector Komoditas */}
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
                {item.trend === 'UP' ? `Apresiasi +${item.trendPercentage}%` : `Diskon ${item.trendPercentage}%`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Metrik Petani */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Harga Beli Hub Hari Ini
          </div>
          <div className="text-xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.currentPrice.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-gelap/60"> / {selectedCommodity.unit}</span>
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Standar: Grade A Tare-Zero
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Proyeksi Nilai Tampung 7 Hari
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice7d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            {getTrendIcon(selectedCommodity.predictedPrice7d >= selectedCommodity.currentPrice ? 'UP' : 'DOWN')}
            <span>
              {selectedCommodity.predictedPrice7d >= selectedCommodity.currentPrice ? 'Tren Menguntungkan' : 'Kecenderungan Melemah'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Proyeksi Nilai Tampung 30 Hari
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice30d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            <span className="font-mono font-bold text-primer">
              {selectedCommodity.trendPercentage > 0 ? `+${selectedCommodity.trendPercentage}%` : `${selectedCommodity.trendPercentage}%`}
            </span>
            <span>vs harga tampung saat ini</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Saran Waktu Setor Panen
          </div>
          <div className="text-sm font-heading font-bold text-sekunder mt-1 truncate">
            {selectedCommodity.optimalBuyWindow.startDate}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Alokasi hub: Sentra Sentolo & Bantul
          </div>
        </div>
      </div>

      {/* Grafik Interaktif */}
      <ForecastInteractiveChart
        commodity={selectedCommodity}
        horizon={horizon}
        onHorizonChange={setHorizon}
      />

      {/* Kartu Wawasan untuk Pemasok */}
      <ForecastInsightCards
        commodity={selectedCommodity}
        userType="SUPPLIER"
      />

      {/* Transparansi Model */}
      <div className="p-4 rounded-2xl bg-netral-canvas/60 border border-netral-border/70 text-xs text-gelap/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sekunder flex-shrink-0" />
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <span>Model Agrikultur PasokMataram: <strong className="text-gelap">{selectedCommodity.modelMetadata.algorithm}</strong></span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>Akurasi MAPE: <span className="font-mono text-primer font-bold">{selectedCommodity.modelMetadata.mapeAccuracy}%</span></span>
          </span>
        </div>
        <div className="text-[11px] text-gelap/60">
          Dana penjualan panen diproteksi sistem escrow B2B terbit otomatis saat QR Pass tervalidasi.
        </div>
      </div>
    </div>
  );
}
