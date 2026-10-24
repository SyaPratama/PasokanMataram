/**
 * @file services/queue-worker/src/ml/feature-store.ts
 * @description Modul ekstraksi fitur deret waktu (Time-Series Feature Store) komoditas pangan DIY.
 * Menghitung lag prices, rolling statistics, calendar seasonality, dan pengaruh presipitasi cuaca BMKG.
 * Mematuhi Prinsip I, II, dan IV Konstitusi PasokMataram.
 */

export interface HistoricalPriceRecord {
  date: string;
  price: number;
}

export interface FeatureVector {
  commodityId: string;
  featureDate: string;
  currentPrice: number;
  lag1d: number;
  lag3d: number;
  lag7d: number;
  lag14d: number;
  rollingMean7d: number;
  rollingVolatility14d: number;
  cumulativeRainfall3d: number;
  dayOfWeek: number;
  monthOfYear: number;
  isPeakTourismSeason: boolean;
}

/**
 * Pembangun dan pengekstrak fitur deret waktu untuk pemodelan PasokML.
 */
export class FeatureStoreBuilder {
  /**
   * Menghitung vektor fitur lengkap dari riwayat harga dan data cuaca.
   * @param commodityId Pengenal unik komoditas.
   * @param prices Larik riwayat harga urut tanggal kronologis menaik.
   * @param rainfallLast3d Total curah hujan 3 hari terakhir dalam milimeter.
   * @returns Vektor fitur yang siap dikonsumsi model ensemble.
   */
  public static extractFeatures(
    commodityId: string,
    prices: readonly HistoricalPriceRecord[],
    rainfallLast3d: number = 0
  ): FeatureVector {
    if (prices.length === 0) {
      throw new Error('Data riwayat harga tidak boleh kosong untuk ekstraksi fitur');
    }

    const latest = prices[prices.length - 1];
    if (!latest) {
      throw new Error('Data riwayat harga tidak ditemukan');
    }
    const n = prices.length;
    const currentPrice = latest.price;

    const lag1d = (n >= 2 ? prices[n - 2]?.price : undefined) ?? currentPrice;
    const lag3d = (n >= 4 ? prices[n - 4]?.price : undefined) ?? currentPrice;
    const lag7d = (n >= 8 ? prices[n - 8]?.price : undefined) ?? currentPrice;
    const lag14d = (n >= 15 ? prices[n - 15]?.price : undefined) ?? lag7d;

    const last7Slice = prices.slice(Math.max(0, n - 7));
    const rollingMean7d =
      last7Slice.reduce((sum, item) => sum + item.price, 0) / Math.max(1, last7Slice.length);

    const last14Slice = prices.slice(Math.max(0, n - 14));
    const mean14 =
      last14Slice.reduce((sum, item) => sum + item.price, 0) / Math.max(1, last14Slice.length);
    const variance14 =
      last14Slice.reduce((sum, item) => sum + Math.pow(item.price - mean14, 2), 0) /
      Math.max(1, last14Slice.length);
    const rollingVolatility14d = Math.sqrt(variance14) / (mean14 || 1);

    const dateObj = new Date(latest.date);
    const dayOfWeek = dateObj.getDay();
    const monthOfYear = dateObj.getMonth() + 1;

    const isPeakTourismSeason =
      monthOfYear === 6 || monthOfYear === 7 || monthOfYear === 12;

    return {
      commodityId,
      featureDate: latest.date,
      currentPrice,
      lag1d,
      lag3d,
      lag7d,
      lag14d,
      rollingMean7d: Math.round(rollingMean7d),
      rollingVolatility14d: Number(rollingVolatility14d.toFixed(4)),
      cumulativeRainfall3d: rainfallLast3d,
      dayOfWeek,
      monthOfYear,
      isPeakTourismSeason,
    };
  }
}
