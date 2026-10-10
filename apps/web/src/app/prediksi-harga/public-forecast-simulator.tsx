'use client';

import * as React from 'react';
import { MOCK_COMMODITY_FORECASTS } from '../../lib/mock-forecast-data';
import type { CommodityForecast, ForecastHorizon } from '../../types/forecast';
import { ForecastInteractiveChart } from '../../components/forecast/forecast-interactive-chart';
import { ForecastInsightCards } from '../../components/forecast/forecast-insight-cards';
import { TrendingUp, TrendingDown, Minus, Sparkles, MapPin } from 'lucide-react';

/**
 * Komponen Client-Side Simulator Prediksi Harga Publik.
 * Memungkinkan calon mitra HoReKa dan petani menjajal kecerdasan model ML secara langsung.
 */
export function PublicForecastSimulator() {
  const defaultCommodity = MOCK_COMMODITY_FORECASTS[0] as CommodityForecast;
  const [selectedCommodityId, setSelectedCommodityId] = React.useState<string>(
    defaultCommodity.id
  );
  const [horizon, setHorizon] = React.useState<ForecastHorizon>(30);

  const selectedCommodity: CommodityForecast =
    MOCK_COMMODITY_FORECASTS.find((c) => c.id === selectedCommodityId) ||
    defaultCommodity;

  return (
    <div className="space-y-6">
      {/* Selector Pills */}
      <div>
        <div className="text-xs font-semibold text-gelap/60 uppercase tracking-wider mb-2.5">
          Pilih Komoditas Unggulan Yogyakarta:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MOCK_COMMODITY_FORECASTS.map((item) => {
            const isSelected = item.id === selectedCommodityId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCommodityId(item.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2.5 flex-shrink-0 ${
                  isSelected
                    ? 'bg-primer text-white shadow-sm font-bold'
                    : 'bg-white border border-netral-border text-gelap hover:border-primer/50'
                }`}
              >
                <span>{item.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-white/20 text-white font-bold' : 'bg-netral-canvas text-gelap/60'
                }`}>
                  Rp {(item.currentPrice / 1000).toFixed(0)}k
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Harga Rata-Rata Terkini
          </div>
          <div className="text-xl font-heading font-black text-gelap mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.currentPrice.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-gelap/60"> / kg</span>
          </div>
          <div className="text-[11px] text-gelap/60 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sekunder" />
            <span className="truncate">{selectedCommodity.originRegion}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Proyeksi 7 Hari
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice7d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            {selectedCommodity.predictedPrice7d < selectedCommodity.currentPrice ? 'Koreksi turun' : 'Kenaikan bertahap'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Proyeksi 30 Hari
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            Rp {selectedCommodity.predictedPrice30d.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] font-mono font-bold mt-1 text-sekunder">
            {selectedCommodity.trendPercentage > 0 ? `+${selectedCommodity.trendPercentage}%` : `${selectedCommodity.trendPercentage}%`}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
          <div className="text-[11px] font-semibold text-gelap/60 uppercase tracking-wider">
            Akurasi Model Machine Learning
          </div>
          <div className="text-xl font-heading font-black text-primer mt-1 font-mono tabular-nums">
            {selectedCommodity.confidenceScore}%
          </div>
          <div className="text-[11px] text-gelap/60 mt-1">
            Mean Absolute Percentage Error
          </div>
        </div>
      </div>

      {/* Grafik Interaktif */}
      <ForecastInteractiveChart
        commodity={selectedCommodity}
        horizon={horizon}
        onHorizonChange={setHorizon}
      />

      {/* Kartu Wawasan Publik */}
      <ForecastInsightCards
        commodity={selectedCommodity}
        userType="PUBLIC"
      />
    </div>
  );
}
