import type { CommodityForecast, PriceDataPoint } from '../types/forecast';

/**
 * @file src/lib/mock-forecast-data.ts
 * @description Dataset tiruan hermetis multi-horizon untuk 6 komoditas unggulan pertanian DIY.
 * Menyediakan data historis 14 hari terakhir dan proyeksi ke depan 90 hari dengan rentang keyakinan (confidence interval).
 */

/**
 * Generator deret waktu harga historis dan proyeksi masa depan.
 */
function generatePoints(
  basePrice: number,
  trendFactor: number,
  volatility: number
): readonly PriceDataPoint[] {
  const points: PriceDataPoint[] = [];
  const today = new Date('2026-10-09');

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = -14; i <= 0; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayStr = `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]}`;
    const noise = Math.sin(i * 0.8) * volatility * basePrice;
    const price = Math.round(basePrice + noise + (i * trendFactor * basePrice * 0.005));
    points.push({
      date: dayStr,
      price,
      isProjected: false,
    });
  }

  for (let i = 1; i <= 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayStr = `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]}`;
    const trendDrift = (i * trendFactor * basePrice * 0.003);
    const seasonalWave = Math.sin(i * 0.12) * volatility * basePrice;
    const projectedPrice = Math.round(basePrice + trendDrift + seasonalWave);
    const intervalSpread = Math.round((basePrice * 0.03) + (i * 0.0008 * basePrice));

    points.push({
      date: dayStr,
      price: projectedPrice,
      isProjected: true,
      confidenceLower: projectedPrice - intervalSpread,
      confidenceUpper: projectedPrice + intervalSpread,
    });
  }

  return points;
}

export const MOCK_COMMODITY_FORECASTS: readonly CommodityForecast[] = [
  {
    id: 'f-bawang-srikayangan',
    name: 'Bawang Merah Srikayangan Super',
    category: 'Hortikultura',
    originRegion: 'Sentra Lahan Pasir Panjatan & Sentolo, Kulon Progo',
    unit: 'kg',
    currentPrice: 31000,
    predictedPrice7d: 29500,
    predictedPrice30d: 26800,
    predictedPrice90d: 34500,
    trend: 'DOWN',
    trendPercentage: -13.5,
    confidenceScore: 94.8,
    optimalBuyWindow: {
      startDate: '22 Okt 2026',
      endDate: '05 Nov 2026',
      targetPrice: 26500,
      recommendedAction: 'TUNGGU_PANEN_RAYA',
      explanation:
        'Puncak panen raya lahan pasir Kulon Progo diproyeksikan tiba pada pekan ke-4 Oktober. Disarankan menunggu 10–14 hari untuk mendapatkan harga tampung terendah sebelum lonjakan permintaan akhir tahun.',
    },
    weatherAnomalyRisk: {
      riskLevel: 'RENDAH',
      description: 'Prakiraan curah hujan normal (120-150 mm) dengan hari tanpa hujan memadai untuk pengeringan umbi di lapangan.',
      rainfallForecastMm: 135,
      bmkgSource: 'Stasiun Klimatologi BMKG Yogyakarta (Update 08 Okt 2026)',
    },
    modelMetadata: {
      algorithm: 'PasokML Ensemble v2.1 (XGBoost + LSTM + Spatial Bayesian)',
      mapeAccuracy: 3.8,
      lastTrained: '09 Okt 2026, 04:00 WIB',
    },
    historicalAndProjected: generatePoints(31000, -1.2, 0.04),
  },
  {
    id: 'f-cabai-panjatan',
    name: 'Cabai Rawit Merah Panjatan Segar',
    category: 'Hortikultura',
    originRegion: 'Pesisir Pantai Selatan Panjatan, Kulon Progo',
    unit: 'kg',
    currentPrice: 46500,
    predictedPrice7d: 51000,
    predictedPrice30d: 59000,
    predictedPrice90d: 48000,
    trend: 'UP',
    trendPercentage: 26.8,
    confidenceScore: 91.2,
    optimalBuyWindow: {
      startDate: '09 Okt 2026',
      endDate: '14 Okt 2026',
      targetPrice: 46500,
      recommendedAction: 'KUNCI_KONTRAK',
      explanation:
        'Anomali transisi musim penghujan berpotensi memicu kerontokan bunga cabai di pesisir selatan. Kunci kontrak standing order 30 hari ke depan sekarang untuk memitigasi kenaikan harga hingga Rp 59.000/kg.',
    },
    weatherAnomalyRisk: {
      riskLevel: 'TINGGI',
      description: 'Peningkatan intensitas hujan lebat disertai angin barat di pesisir Kulon Progo berisiko meningkatkan kelembaban patek/antraknosa.',
      rainfallForecastMm: 240,
      bmkgSource: 'Stasiun Meteorologi YIA Kulon Progo',
    },
    modelMetadata: {
      algorithm: 'PasokML Ensemble v2.1 (Temporal Fusion Transformer + LightGBM)',
      mapeAccuracy: 4.6,
      lastTrained: '09 Okt 2026, 04:00 WIB',
    },
    historicalAndProjected: generatePoints(46500, 2.1, 0.06),
  },
  {
    id: 'f-beras-seyegan',
    name: 'Beras Pandan Wangi Seyegan',
    category: 'Pangan Pokok',
    originRegion: 'Lumbung Padi Irigasi Selokan Mataram Seyegan, Sleman',
    unit: 'kg',
    currentPrice: 15500,
    predictedPrice7d: 15500,
    predictedPrice30d: 15700,
    predictedPrice90d: 16200,
    trend: 'STABLE',
    trendPercentage: 1.3,
    confidenceScore: 97.4,
    optimalBuyWindow: {
      startDate: '10 Okt 2026',
      endDate: '30 Nov 2026',
      targetPrice: 15500,
      recommendedAction: 'BELI_SEKARANG',
      explanation:
        'Pasokan gabah kering giling di lumbung Sleman Barat stabil dengan cadangan gabah melimpah. Harga diproyeksikan sangat stabil dengan variasi kurang dari 2% sepanjang triwulan ini.',
    },
    weatherAnomalyRisk: {
      riskLevel: 'RENDAH',
      description: 'Debit air Selokan Mataram normal, kecukupan pengairan sawah padi premium terjamin penuh.',
      rainfallForecastMm: 110,
      bmkgSource: 'Balai Pengelolaan SDA DIY',
    },
    modelMetadata: {
      algorithm: 'PasokML AutoARIMA + Gradient Boosting Linear',
      mapeAccuracy: 1.9,
      lastTrained: '09 Okt 2026, 04:00 WIB',
    },
    historicalAndProjected: generatePoints(15500, 0.2, 0.015),
  },
  {
    id: 'f-bawang-nawungan',
    name: 'Bawang Merah Organik Nawungan',
    category: 'Hortikultura',
    originRegion: 'Perbukitan Nawungan, Selopamioro, Imogiri, Bantul',
    unit: 'kg',
    currentPrice: 38000,
    predictedPrice7d: 37000,
    predictedPrice30d: 35500,
    predictedPrice90d: 42000,
    trend: 'DOWN',
    trendPercentage: -6.5,
    confidenceScore: 92.0,
    optimalBuyWindow: {
      startDate: '25 Okt 2026',
      endDate: '10 Nov 2026',
      targetPrice: 35000,
      recommendedAction: 'TUNGGU_PANEN_RAYA',
      explanation:
        'Kawasan agrowisata organik Nawungan memasuki masa petik umbi serentak akhir Oktober. Kualitas grade A organik bersertifikasi tersedia melimpah dengan diskon volume hub.',
    },
    weatherAnomalyRisk: {
      riskLevel: 'SEDANG',
      description: 'Potensi erosi lereng ringan pada lereng Selopamioro, tetapi drainase terasering petani dinilai sangat siap.',
      rainfallForecastMm: 165,
      bmkgSource: 'Stasiun Klimatologi Bantul',
    },
    modelMetadata: {
      algorithm: 'PasokML Ensemble v2.1',
      mapeAccuracy: 3.9,
      lastTrained: '09 Okt 2026, 04:00 WIB',
    },
    historicalAndProjected: generatePoints(38000, -0.7, 0.035),
  },
  {
    id: 'f-kopi-merapi',
    name: 'Kopi Robusta Lereng Merapi',
    category: 'Perkebunan',
    originRegion: 'Lereng Selatan Gunung Merapi Cangkringan & Pakem, Sleman',
    unit: 'kg',
    currentPrice: 85000,
    predictedPrice7d: 85000,
    predictedPrice30d: 87000,
    predictedPrice90d: 92000,
    trend: 'UP',
    trendPercentage: 8.2,
    confidenceScore: 90.5,
    optimalBuyWindow: {
      startDate: '10 Okt 2026',
      endDate: '20 Okt 2026',
      targetPrice: 85000,
      recommendedAction: 'KUNCI_KONTRAK',
      explanation:
        'Kenaikan harga kopi dunia dan menipisnya stok panen raya kopi Merapi mendorong tren apresiasi harga. Amankan alokasi green bean atau roasted bean Anda sebelum akhir bulan.',
    },
    weatherAnomalyRisk: {
      riskLevel: 'RENDAH',
      description: 'Aktivitas vulkanik status normal, cuaca lereng sejuk optimal untuk penyimpanan biji kering.',
      rainfallForecastMm: 140,
      bmkgSource: 'BPPTKG & BMKG Sleman',
    },
    modelMetadata: {
      algorithm: 'PasokML Commodity Futures Prophet + Ridge',
      mapeAccuracy: 3.4,
      lastTrained: '09 Okt 2026, 04:00 WIB',
    },
    historicalAndProjected: generatePoints(85000, 0.8, 0.02),
  },
  {
    id: 'f-kedelai-mallika',
    name: 'Kedelai Hitam Mallika Gunungkidul',
    category: 'Pangan Pokok',
    originRegion: 'Lahan Karst Playen & Wonosari, Gunungkidul',
    unit: 'kg',
    currentPrice: 19000,
    predictedPrice7d: 19000,
    predictedPrice30d: 18500,
    predictedPrice90d: 21000,
    trend: 'STABLE',
    trendPercentage: -2.6,
    confidenceScore: 93.7,
    optimalBuyWindow: {
      startDate: '15 Okt 2026',
      endDate: '15 Nov 2026',
      targetPrice: 18500,
      recommendedAction: 'BELI_SEKARANG',
      explanation:
        'Panen kedelai hitam binaan kemitraan industri di Gunungkidul mulai masuk gudang transit. Saat tepat untuk pengadaan bahan baku fermentasi kecap & tahu dalam jumlah besar.',
    },
    weatherAnomalyRisk: {
      riskLevel: 'RENDAH',
      description: 'Lahan karst telah selesai panen sebelum puncak hujan, kelembaban penyimpanan silo terjaga aman.',
      rainfallForecastMm: 95,
      bmkgSource: 'Stasiun Geofisika BMKG Wonosari',
    },
    modelMetadata: {
      algorithm: 'PasokML Ensemble v2.1',
      mapeAccuracy: 2.8,
      lastTrained: '09 Okt 2026, 04:00 WIB',
    },
    historicalAndProjected: generatePoints(19000, -0.3, 0.025),
  },
];
