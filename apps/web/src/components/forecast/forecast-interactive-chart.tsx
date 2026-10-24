'use client';

import * as React from 'react';
import { themeColors } from '@pasok/config';
import type { CommodityForecast, ForecastHorizon, PriceDataPoint } from '../../types/forecast';
import { Calendar, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface ForecastInteractiveChartProps {
  commodity: CommodityForecast;
  horizon: ForecastHorizon;
  onHorizonChange: (horizon: ForecastHorizon) => void;
}

/**
 * Komponen grafik SVG interaktif kelas dunia untuk visualisasi data deret waktu harga pangan.
 * Menampilkan kurva historis solid, proyeksi masa depan bergaris putus-putus, shading rentang keyakinan,
 * dan penanda jendela beli optimal tanpa dependensi pihak ketiga eksternal yang berat.
 */
export function ForecastInteractiveChart({
  commodity,
  horizon,
  onHorizonChange,
}: ForecastInteractiveChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<PriceDataPoint | null>(null);

  const horizonDays = horizon;
  const filteredData = React.useMemo(() => {
    const historical = commodity.historicalAndProjected.filter((p) => !p.isProjected);
    const projected = commodity.historicalAndProjected
      .filter((p) => p.isProjected)
      .slice(0, horizonDays);
    return [...historical, ...projected];
  }, [commodity.historicalAndProjected, horizonDays]);

  const { minPrice, maxPrice, priceRange } = React.useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    filteredData.forEach((p) => {
      const low = p.confidenceLower ?? p.price;
      const high = p.confidenceUpper ?? p.price;
      if (low < min) min = low;
      if (high > max) max = high;
    });
    const padding = (max - min) * 0.15 || 1000;
    return {
      minPrice: Math.max(0, Math.floor((min - padding) / 500) * 500),
      maxPrice: Math.ceil((max + padding) / 500) * 500,
      priceRange: (Math.ceil((max + padding) / 500) * 500) - Math.max(0, Math.floor((min - padding) / 500) * 500),
    };
  }, [filteredData]);

  const svgWidth = 800;
  const svgHeight = 320;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = React.useCallback(
    (index: number) => {
      return padLeft + (index / (filteredData.length - 1)) * chartW;
    },
    [filteredData.length, chartW]
  );

  const getY = React.useCallback(
    (price: number) => {
      const norm = (price - minPrice) / (priceRange || 1);
      return padTop + chartH - norm * chartH;
    },
    [minPrice, priceRange, chartH]
  );

  const historicalPoints = filteredData.filter((p) => !p.isProjected);
  const historicalPath = React.useMemo(() => {
    return historicalPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(p.price).toFixed(1)}`)
      .join(' ');
  }, [historicalPoints, getX, getY]);

  const lastHistIdx = historicalPoints.length - 1;
  const projectedPath = React.useMemo(() => {
    const pts = filteredData.slice(lastHistIdx);
    return pts
      .map((p, i) => {
        const actualIdx = lastHistIdx + i;
        return `${i === 0 ? 'M' : 'L'} ${getX(actualIdx).toFixed(1)} ${getY(p.price).toFixed(1)}`;
      })
      .join(' ');
  }, [filteredData, lastHistIdx, getX, getY]);

  const confidenceAreaPath = React.useMemo(() => {
    const projPoints = filteredData.slice(lastHistIdx);
    if (projPoints.length <= 1) return '';

    const topPath = projPoints
      .map((p, i) => {
        const actualIdx = lastHistIdx + i;
        const upper = p.confidenceUpper ?? p.price;
        return `${i === 0 ? 'M' : 'L'} ${getX(actualIdx).toFixed(1)} ${getY(upper).toFixed(1)}`;
      })
      .join(' ');

    const bottomPath = [...projPoints]
      .reverse()
      .map((p, i) => {
        const actualIdx = filteredData.length - 1 - i;
        const lower = p.confidenceLower ?? p.price;
        return `L ${getX(actualIdx).toFixed(1)} ${getY(lower).toFixed(1)}`;
      })
      .join(' ');

    return `${topPath} ${bottomPath} Z`;
  }, [filteredData, lastHistIdx, getX, getY]);

  const yTicks = [
    minPrice,
    minPrice + Math.round(priceRange * 0.33),
    minPrice + Math.round(priceRange * 0.66),
    maxPrice,
  ];

  return (
    <div className="bg-white border border-netral-border/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-netral-border/70">
        <div>
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
            <h2 className="font-heading font-extrabold text-xs sm:text-base text-gelap truncate">
              Kurva Tren &amp; Proyeksi Multi-Horizon
            </h2>
            <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-primer-light text-primer font-bold whitespace-nowrap shrink-0 shadow-2xs">
              Ensemble v2.1
            </span>
          </div>
          <p className="text-xs text-gelap/60 mt-0.5 flex flex-wrap items-center gap-1.5">
            <span>Garis tebal: data pasar aktual</span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>Garis putus-putus: estimasi ML</span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>Area arsiran: interval keyakinan 95%</span>
          </p>
        </div>

        <div className="flex items-center bg-netral-canvas p-1 rounded-xl border border-netral-border/60 self-start sm:self-auto">
          {([7, 30, 90] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHorizonChange(h)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer ${
                horizon === h
                  ? 'bg-white text-primer shadow-2xs font-extrabold'
                  : 'text-gelap/70 hover:text-gelap'
              }`}
            >
              {h} Hari
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          aria-label={`Grafik prediksi harga untuk ${commodity.name}`}
        >
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColors.aksen.DEFAULT} stopOpacity="0.18" />
              <stop offset="100%" stopColor={themeColors.aksen.DEFAULT} stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="todayLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeColors.primer.DEFAULT} stopOpacity="0.6" />
              <stop offset="100%" stopColor={themeColors.primer.DEFAULT} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={themeColors.netral.border}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-xs font-mono fill-gelap-muted tabular-nums"
                >
                  Rp {(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          <line
            x1={getX(lastHistIdx)}
            y1={padTop}
            x2={getX(lastHistIdx)}
            y2={svgHeight - padBottom}
            stroke="url(#todayLineGradient)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={getX(lastHistIdx)}
            y={padTop - 8}
            textAnchor="middle"
            className="text-xs font-bold fill-primer font-heading"
          >
            HARI INI (09 OKT)
          </text>

          {confidenceAreaPath ? (
            <path
              d={confidenceAreaPath}
              fill="url(#confidenceGradient)"
              className="transition-all duration-300"
            />
          ) : null}

          <path
            d={historicalPath}
            fill="none"
            stroke={themeColors.primer.DEFAULT}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={projectedPath}
            fill="none"
            stroke={themeColors.sekunder.DEFAULT}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {filteredData.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.price);
            const isHovered = hoveredPoint?.date === p.date;
            const isToday = idx === lastHistIdx;

            return (
              <g key={p.date + idx}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : isToday ? 5 : p.isProjected ? 3 : 3.5}
                  fill={isToday ? themeColors.primer.DEFAULT : p.isProjected ? themeColors.sekunder.DEFAULT : themeColors.primer.DEFAULT}
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="cursor-pointer transition-all hover:scale-125"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          <g>
            <text
              x={padLeft}
              y={svgHeight - 14}
              textAnchor="start"
              className="text-xs font-mono fill-gelap-muted"
            >
              {filteredData[0]?.date}
            </text>
            <text
              x={getX(lastHistIdx)}
              y={svgHeight - 14}
              textAnchor="middle"
              className="text-xs font-mono fill-primer font-bold"
            >
              09 Okt (Sekarang)
            </text>
            <text
              x={svgWidth - padRight}
              y={svgHeight - 14}
              textAnchor="end"
              className="text-xs font-mono fill-gelap-muted"
            >
              +{horizonDays} Hari
            </text>
          </g>
        </svg>

        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-netral-border rounded-xl p-3 shadow-lg text-xs space-y-1 pointer-events-none transition-all">
            <div className="text-xs font-bold text-gelap-muted uppercase flex items-center justify-between gap-3">
              <span>{hoveredPoint.date}</span>
              <span className={`px-1.5 py-0.2 rounded text-xs font-semibold ${
                hoveredPoint.isProjected ? 'bg-aksen-light text-aksen-dark' : 'bg-primer-light text-primer'
              }`}>
                {hoveredPoint.isProjected ? 'Proyeksi AI' : 'Data Pasar Riil'}
              </span>
            </div>
            <div className="text-base font-heading font-black text-primer font-mono tabular-nums">
              Rp {hoveredPoint.price.toLocaleString('id-ID')}
              <span className="text-[10px] font-normal text-gelap/60"> / {commodity.unit}</span>
            </div>
            {hoveredPoint.confidenceLower && hoveredPoint.confidenceUpper && (
              <div className="text-[10px] text-gelap/70 font-mono">
                Rentang 95%: Rp {hoveredPoint.confidenceLower.toLocaleString('id-ID')} &ndash; Rp {hoveredPoint.confidenceUpper.toLocaleString('id-ID')}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-netral-border/60 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primer rounded-full inline-block" />
            <span className="text-gelap/80 font-medium text-[11px]">Historis 14 Hari</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sekunder border-b border-dashed border-sekunder inline-block" />
            <span className="text-gelap/80 font-medium text-[11px]">Proyeksi Model ML</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-aksen/20 rounded-xs inline-block" />
            <span className="text-gelap/80 font-medium text-[11px]">Pita Ketidakpastian 95%</span>
          </div>
        </div>

        <div className="text-[11px] text-gelap/60 font-mono">
          MAPE Akurasi: <strong className="text-primer font-bold">{commodity.modelMetadata.mapeAccuracy}%</strong>
        </div>
      </div>
    </div>
  );
}
