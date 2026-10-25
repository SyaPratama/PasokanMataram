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
  ChevronDown,
  Search,
  Check,
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
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCommodities = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return MOCK_COMMODITY_FORECASTS;
    return MOCK_COMMODITY_FORECASTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.originRegion.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-netral-border text-xs font-semibold text-gelap hover:bg-netral-canvas min-h-[44px] shadow-2xs self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primer ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap">Segarkan</span>
        </button>
      </div>

      <div className="relative w-full sm:max-w-md" ref={pickerRef}>
        <label className="block text-xs font-bold text-gelap uppercase tracking-wider mb-1.5">
          Pilih Komoditas Pangan DIY:
        </label>
        <button
          type="button"
          onClick={() => setIsPickerOpen((prev) => !prev)}
          className="w-full p-3.5 rounded-2xl bg-white border-2 border-netral-border flex items-center justify-between text-left text-sm font-semibold text-gelap hover:border-primer/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primer/30 transition-all shadow-xs min-h-[48px]"
          aria-haspopup="listbox"
          aria-expanded={isPickerOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-bold text-gelap truncate">{selectedCommodity.name}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                selectedCommodity.trend === 'DOWN'
                  ? 'bg-status-success/15 text-status-success'
                  : 'bg-status-warning/15 text-status-warning'
              }`}
            >
              {selectedCommodity.trend === 'DOWN'
                ? `-${Math.abs(selectedCommodity.trendPercentage)}%`
                : `+${selectedCommodity.trendPercentage}%`}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gelap/60 shrink-0 transition-transform duration-200 ${
              isPickerOpen ? 'rotate-180 text-primer' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {isPickerOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-netral-border shadow-2xl p-3 z-30 space-y-2 animate-in fade-in zoom-in-95">
            <div className="relative">
              <Search
                className="w-4 h-4 text-gelap/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari komoditas atau sentra pangan..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium text-gelap bg-netral-canvas rounded-xl border border-netral-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[40px]"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 pt-1">
              {filteredCommodities.length === 0 ? (
                <div className="p-4 text-center text-xs text-gelap/60">
                  Tidak ada komoditas pangan yang cocok.
                </div>
              ) : (
                filteredCommodities.map((item) => {
                  const isSelected = item.id === selectedCommodityId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedCommodityId(item.id);
                        setIsPickerOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between min-h-[44px] ${
                        isSelected
                          ? 'bg-primer text-white font-bold shadow-xs'
                          : 'hover:bg-netral-canvas text-gelap'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate font-semibold">{item.name}</div>
                        <div
                          className={`text-[10px] mt-0.5 truncate ${
                            isSelected ? 'text-white/80' : 'text-gelap/60'
                          }`}
                        >
                          {item.originRegion}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : item.trend === 'DOWN'
                              ? 'bg-status-success/15 text-status-success'
                              : 'bg-status-warning/15 text-status-warning'
                          }`}
                        >
                          {item.trend === 'DOWN'
                            ? `-${Math.abs(item.trendPercentage)}%`
                            : `+${item.trendPercentage}%`}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
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
