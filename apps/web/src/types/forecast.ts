/**
 * @file src/types/forecast.ts
 * @description Tipe domain dan struktur data antarmuka prakiraan harga komoditas pangan AI / ML.
 * Dirancang siap pakai untuk konsumsi endpoint Machine Learning (FastAPI / PyTorch / ONNX) masa depan.
 */

export type ForecastHorizon = 7 | 30 | 90;

export type ForecastTrend = 'UP' | 'DOWN' | 'STABLE';

export type RecommendedAction = 'BELI_SEKARANG' | 'TUNGGU_PANEN_RAYA' | 'KUNCI_KONTRAK';

export type WeatherRiskLevel = 'RENDAH' | 'SEDANG' | 'TINGGI';

/**
 * Titik data historis dan proyeksi kurva harga per tanggal.
 */
export interface PriceDataPoint {
  readonly date: string;
  readonly price: number;
  readonly isProjected: boolean;
  readonly confidenceLower?: number;
  readonly confidenceUpper?: number;
}

/**
 * Entitas lengkap prakiraan harga satu komoditas pertanian DIY.
 */
export interface CommodityForecast {
  readonly id: string;
  readonly name: string;
  readonly category: 'Hortikultura' | 'Pangan Pokok' | 'Perkebunan';
  readonly originRegion: string;
  readonly unit: string;
  readonly currentPrice: number;
  readonly predictedPrice7d: number;
  readonly predictedPrice30d: number;
  readonly predictedPrice90d: number;
  readonly trend: ForecastTrend;
  readonly trendPercentage: number;
  readonly confidenceScore: number;
  readonly optimalBuyWindow: {
    readonly startDate: string;
    readonly endDate: string;
    readonly targetPrice: number;
    readonly recommendedAction: RecommendedAction;
    readonly explanation: string;
  };
  readonly weatherAnomalyRisk: {
    readonly riskLevel: WeatherRiskLevel;
    readonly description: string;
    readonly rainfallForecastMm: number;
    readonly bmkgSource: string;
  };
  readonly modelMetadata: {
    readonly algorithm: string;
    readonly mapeAccuracy: number;
    readonly lastTrained: string;
  };
  readonly historicalAndProjected: readonly PriceDataPoint[];
}
