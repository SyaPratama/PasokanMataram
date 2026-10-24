'use client';

import * as React from 'react';
import { MOCK_COMMODITY_FORECASTS } from '../../lib/mock-forecast-data';
import type { CommodityForecast, ForecastHorizon } from '../../types/forecast';
import { ForecastInteractiveChart } from '../../components/forecast/forecast-interactive-chart';
import { ForecastInsightCards } from '../../components/forecast/forecast-insight-cards';
import {
  Search,
  MapPin,
  ArrowUpDown,
  ChevronDown,
  X,
  Sparkles,
  CloudRain,
  Fuel,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

function resolveCommodityCode(name: string): string {
  const norm = name.toLowerCase();
  if (norm.includes('rawit')) return 'CABAI_RAWIT_MERAH';
  if (norm.includes('keriting')) return 'CABAI_MERAH_KERITING';
  if (norm.includes('bawang') || norm.includes('srikayangan') || norm.includes('nawungan')) return 'BAWANG_MERAH';
  if (norm.includes('beras') || norm.includes('seyegan')) return 'BERAS_PREMIUM_SLEMAN';
  if (norm.includes('putih') || norm.includes('kating')) return 'BAWANG_PUTIH_HONAN';
  if (norm.includes('ayam') || norm.includes('broiler')) return 'DAGING_AYAM_RAS';
  return 'BAWANG_MERAH';
}

/**
 * Komponen Client-Side Simulator Prediksi Harga Pasok Pangan D.I. Yogyakarta.
 * Mendukung filter pencarian real-time dan simulasi interaktif skenario cuaca serta biaya logistik ML.
 */
export function PublicForecastSimulator() {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [regionFilter, setRegionFilter] = React.useState<string>('SEMUA');
  const [sortBy, setSortBy] = React.useState<string>('default');
  const [horizon, setHorizon] = React.useState<ForecastHorizon>(30);

  const [commodities, setCommodities] = React.useState<readonly CommodityForecast[]>(
    MOCK_COMMODITY_FORECASTS
  );
  const [selectedCommodityId, setSelectedCommodityId] = React.useState<string>(
    MOCK_COMMODITY_FORECASTS[0]?.id || ''
  );

  const [rainfallAnomaly, setRainfallAnomaly] = React.useState<number>(0);
  const [fuelPriceHike, setFuelPriceHike] = React.useState<number>(0);
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
  const [simulationSource, setSimulationSource] = React.useState<string | null>(null);
  const [simulatedCommodity, setSimulatedCommodity] = React.useState<CommodityForecast | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchForecastData() {
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (regionFilter !== 'SEMUA') params.set('region', regionFilter);
        if (sortBy !== 'default') params.set('sort', sortBy);

        const res = await fetch(`/api/v1/forecast?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setCommodities(json.data);
            return;
          }
        }
      } catch {}

      if (isMounted) {
        let fallback = [...MOCK_COMMODITY_FORECASTS];
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          fallback = fallback.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.originRegion.toLowerCase().includes(q) ||
              c.category.toLowerCase().includes(q)
          );
        }
        if (regionFilter !== 'SEMUA') {
          const r = regionFilter.toLowerCase().replace('_', ' ');
          fallback = fallback.filter((c) => c.originRegion.toLowerCase().includes(r));
        }
        if (sortBy === 'price_asc') {
          fallback.sort((a, b) => a.currentPrice - b.currentPrice);
        } else if (sortBy === 'price_desc') {
          fallback.sort((a, b) => b.currentPrice - a.currentPrice);
        }
        setCommodities(fallback);
      }
    }

    const timer = setTimeout(() => {
      fetchForecastData();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, regionFilter, sortBy]);

  React.useEffect(() => {
    if (commodities.length > 0) {
      const stillExists = commodities.some((c) => c.id === selectedCommodityId);
      if (!stillExists) {
        setSelectedCommodityId(commodities[0]?.id || '');
      }
    }
  }, [commodities, selectedCommodityId]);

  React.useEffect(() => {
    setSimulatedCommodity(null);
    setSimulationSource(null);
  }, [selectedCommodityId]);

  const selectedCommodity: CommodityForecast | undefined =
    commodities.find((c) => c.id === selectedCommodityId) || commodities[0];

  const activeCommodity: CommodityForecast | undefined = simulatedCommodity || selectedCommodity;

  const handleResetFilters = () => {
    setSearchQuery('');
    setRegionFilter('SEMUA');
    setSortBy('default');
  };

  const handleRunSimulation = async () => {
    if (!selectedCommodity) return;
    setIsSimulating(true);
    try {
      const code = resolveCommodityCode(selectedCommodity.name);
      const res = await fetch('/api/v1/forecast/ml?adapt=domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity_code: code,
          current_price: selectedCommodity.currentPrice,
          rainfall_anomaly_percent: rainfallAnomaly,
          fuel_price_hike_percent: fuelPriceHike,
        }),
      });

      if (res.ok) {
        const json: { success: boolean; source: string; data: CommodityForecast } = await res.json();
        if (json.success && json.data) {
          setSimulatedCommodity(json.data);
          setSimulationSource(json.source === 'FASTAPI_ML' ? 'FastAPI ML Engine' : 'Fallback Deterministik');
          return;
        }
      }
    } catch {} finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setRainfallAnomaly(0);
    setFuelPriceHike(0);
    setSimulatedCommodity(null);
    setSimulationSource(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-netral-border/60">
          <div>
            <h3 className="text-sm font-bold text-gelap font-heading">
              Filter &amp; Pencarian Komoditas Pasok
            </h3>
            <p className="text-xs text-gelap/60 mt-0.5">
              Data terintegrasi API harga pangan real-time dan prakiraan cerdas per daerah D.I. Yogyakarta
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primer bg-primer-light px-3 py-1 rounded-full whitespace-nowrap shrink-0 self-start sm:self-auto shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primer shrink-0" />
            <span>{commodities.length} Komoditas Ditemukan</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gelap/50">
              <Search className="w-4 h-4 text-primer" aria-hidden="true" />
            </div>
            <input
              id="forecast-search"
              name="forecast-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari komoditas (misal: Bawang, Cabai, Sleman)..."
              aria-label="Cari nama komoditas atau daerah sentra"
              className="w-full pl-10 pr-9 py-2.5 text-xs text-gelap bg-netral-canvas/40 border border-netral-border/80 rounded-xl shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[48px] placeholder:text-gelap/45 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus kata kunci pencarian"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gelap/50 hover:text-gelap min-h-[48px] min-w-[48px] justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gelap/50">
              <MapPin className="w-4 h-4 text-sekunder" aria-hidden="true" />
            </div>
            <select
              id="forecast-region"
              name="forecast-region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label="Filter berdasarkan daerah kabupaten atau kota di D.I. Yogyakarta"
              className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold text-gelap bg-netral-canvas/40 border border-netral-border/80 rounded-xl shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[48px] appearance-none cursor-pointer"
            >
              <option value="SEMUA">Semua Daerah D.I. Yogyakarta</option>
              <option value="KULON_PROGO">Kulon Progo</option>
              <option value="BANTUL">Bantul</option>
              <option value="SLEMAN">Sleman</option>
              <option value="GUNUNGKIDUL">Gunungkidul</option>
              <option value="YOGYAKARTA">Kota Yogyakarta</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gelap/50">
              <ChevronDown className="w-4 h-4 text-gelap/50" aria-hidden="true" />
            </div>
          </div>

          <div className="md:col-span-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gelap/50">
              <ArrowUpDown className="w-4 h-4 text-primer" aria-hidden="true" />
            </div>
            <select
              id="forecast-sort"
              name="forecast-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutkan harga komoditas"
              className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold text-gelap bg-netral-canvas/40 border border-netral-border/80 rounded-xl shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primer min-h-[48px] appearance-none cursor-pointer"
            >
              <option value="default">Urutan Standar</option>
              <option value="price_asc">Harga: Termurah (Asc)</option>
              <option value="price_desc">Harga: Termahal (Desc)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gelap/50">
              <ChevronDown className="w-4 h-4 text-gelap/50" aria-hidden="true" />
            </div>
          </div>
        </div>

        {commodities.length > 0 ? (
          <div className="pt-2 border-t border-netral-border/50">
            <div className="text-xs font-semibold text-gelap/80 mb-2">
              Pilih komoditas untuk menampilkan simulasi kurva &amp; wawasan:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {commodities.map((item) => {
                const isSelected = item.id === selectedCommodityId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCommodityId(item.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[48px] flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-primer text-white shadow-xs font-bold'
                        : 'bg-white border border-netral-border text-gelap hover:border-primer/50 hover:bg-netral-canvas/40'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded whitespace-nowrap ${
                        isSelected
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-netral-canvas text-gelap/70'
                      }`}
                    >
                      Rp&nbsp;{(item.currentPrice / 1000).toFixed(0)}k
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-2 text-center text-xs text-gelap/70">
            <p>Tidak ada komoditas yang cocok dengan filter atau kata kunci pencarian.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 text-xs font-bold text-primer underline hover:text-primer-hover inline-flex items-center gap-1 min-h-[48px]"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {activeCommodity ? (
        <>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-netral-border/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-netral-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primer-light flex items-center justify-center text-primer shrink-0">
                  <SlidersHorizontal className="w-5 h-5 text-primer" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gelap font-heading">
                    Simulasi Skenario Agroklimat &amp; Logistik ML
                  </h4>
                  <p className="text-xs text-gelap/60">
                    Eksplorasi sensitivitas harga pangan DIY terhadap cuaca BMKG dan tarif transportasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {simulationSource ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-aksen-light text-aksen-dark border border-aksen/30 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-aksen-dark shrink-0" />
                    <span>{simulationSource}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-netral-canvas text-gelap/70 border border-netral-border">
                    <span>Baseline Model</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-netral-canvas/40 border border-netral-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="rainfall-slider" className="text-xs font-bold text-gelap flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-sekunder" />
                    <span>Anomali Curah Hujan BMKG</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-gelap px-2 py-0.5 rounded bg-white border border-netral-border">
                    {rainfallAnomaly > 0 ? `+${rainfallAnomaly}%` : `${rainfallAnomaly}%`}
                  </span>
                </div>
                <input
                  id="rainfall-slider"
                  type="range"
                  min="-50"
                  max="100"
                  step="5"
                  value={rainfallAnomaly}
                  onChange={(e) => setRainfallAnomaly(Number(e.target.value))}
                  aria-label="Atur persentase anomali curah hujan BMKG"
                  className="w-full accent-sekunder min-h-[48px] cursor-pointer"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { label: 'Normal (0%)', val: 0 },
                    { label: 'Hujan (+30%)', val: 30 },
                    { label: 'Ekstrem (+60%)', val: 60 },
                    { label: 'Kering (-30%)', val: -30 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setRainfallAnomaly(p.val)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium whitespace-nowrap min-h-[48px] flex items-center ${
                        rainfallAnomaly === p.val
                          ? 'bg-sekunder text-white border-sekunder'
                          : 'bg-white border-netral-border text-gelap/80 hover:bg-netral-canvas'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-netral-canvas/40 border border-netral-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="fuel-slider" className="text-xs font-bold text-gelap flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-primer" />
                    <span>Kenaikan Tarif Logistik &amp; Solar</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-gelap px-2 py-0.5 rounded bg-white border border-netral-border">
                    +{fuelPriceHike}%
                  </span>
                </div>
                <input
                  id="fuel-slider"
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={fuelPriceHike}
                  onChange={(e) => setFuelPriceHike(Number(e.target.value))}
                  aria-label="Atur persentase kenaikan tarif logistik atau BBM"
                  className="w-full accent-primer min-h-[48px] cursor-pointer"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { label: 'Tetap (0%)', val: 0 },
                    { label: 'Naik Ringan (+10%)', val: 10 },
                    { label: 'Lonjakan BBM (+25%)', val: 25 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setFuelPriceHike(p.val)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium whitespace-nowrap min-h-[48px] flex items-center ${
                        fuelPriceHike === p.val
                          ? 'bg-primer text-white border-primer'
                          : 'bg-white border-netral-border text-gelap/80 hover:bg-netral-canvas'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              {simulatedCommodity && (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="px-4 py-2.5 text-xs font-semibold text-gelap/80 bg-white border border-netral-border rounded-xl hover:bg-netral-canvas min-h-[48px] inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-gelap/60" />
                  <span>Kembalikan ke Baseline</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-5 py-2.5 text-xs font-bold text-white bg-primer hover:bg-primer-hover disabled:opacity-50 rounded-xl shadow-xs min-h-[48px] inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isSimulating ? 'Menghitung Skenario ML...' : 'Jalankan Simulasi ML'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
              <div className="text-xs font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap">
                Harga Rata-Rata Terkini
              </div>
              <div className="text-xl sm:text-2xl font-heading font-black text-gelap mt-1 font-mono tabular-nums whitespace-nowrap">
                Rp&nbsp;{activeCommodity.currentPrice.toLocaleString('id-ID')}
                <span className="text-xs font-normal text-gelap/60"> / kg</span>
              </div>
              <div className="text-xs text-gelap/60 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sekunder shrink-0" />
                <span className="truncate">{activeCommodity.originRegion}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
              <div className="text-xs font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap">
                Proyeksi 7 Hari
              </div>
              <div className="text-xl sm:text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums whitespace-nowrap">
                Rp&nbsp;{activeCommodity.predictedPrice7d.toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-gelap/60 mt-1 whitespace-nowrap truncate">
                {activeCommodity.predictedPrice7d < activeCommodity.currentPrice
                  ? 'Koreksi turun'
                  : 'Kenaikan bertahap'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
              <div className="text-xs font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap">
                Proyeksi 30 Hari
              </div>
              <div className="text-xl sm:text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums whitespace-nowrap">
                Rp&nbsp;{activeCommodity.predictedPrice30d.toLocaleString('id-ID')}
              </div>
              <div className="text-xs font-mono font-bold mt-1 text-sekunder whitespace-nowrap">
                {activeCommodity.trendPercentage > 0
                  ? `+${activeCommodity.trendPercentage}%`
                  : `${activeCommodity.trendPercentage}%`}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-netral-border/80 shadow-xs">
              <div className="text-xs font-semibold text-gelap/60 uppercase tracking-wider whitespace-nowrap">
                Akurasi Model ML
              </div>
              <div className="text-xl sm:text-2xl font-heading font-black text-primer mt-1 font-mono tabular-nums whitespace-nowrap">
                {activeCommodity.confidenceScore}%
              </div>
              <div className="text-xs text-gelap/60 mt-1 whitespace-nowrap truncate">
                Mean Absolute Percentage Error
              </div>
            </div>
          </div>

          <ForecastInteractiveChart
            commodity={activeCommodity}
            horizon={horizon}
            onHorizonChange={setHorizon}
          />

          <ForecastInsightCards commodity={activeCommodity} userType="PUBLIC" />
        </>
      ) : null}
    </div>
  );
}
