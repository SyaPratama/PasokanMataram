/**
 * @file services/queue-worker/src/handlers/ml-ingest-handler.ts
 * @description Handler pemroses pekerjaan antrean ml.data.ingest.daily.
 * Mengoordinasikan ingesti data paralel dari Bapanas, PIHPS, Pasar Lelang, dan BMKG DIY.
 * Mematuhi Prinsip I, II, dan IV Konstitusi PasokMataram.
 */

import type { QueueJob } from '@pasok/queue';
import { query } from '@pasok/database';
import type { MarketPriceIngest, WeatherObservation } from '@pasok/domain';
import { BapanasAdapter } from '../adapters/bapanas-adapter';
import { PihpsAdapter } from '../adapters/pihps-adapter';
import { BmkgAdapter } from '../adapters/bmkg-adapter';
import { LelangKulonProgoAdapter } from '../adapters/lelang-kulonprogo-adapter';

export interface IngestionResult {
  date: string;
  pricesIngested: number;
  weatherObservationsIngested: number;
}

/**
 * Menangani eksekusi pekerjaan ingesti data harian untuk pipeline machine learning.
 * @param job Objek pekerjaan dari antrean.
 * @returns Ringkasan hasil ingesti.
 */
export async function executeDataIngestion(
  job: QueueJob<'ml.data.ingest.daily'>
): Promise<IngestionResult> {
  const targetDate = job.payload.date ?? new Date().toISOString().slice(0, 10);

  const bapanas = new BapanasAdapter();
  const pihps = new PihpsAdapter();
  const lelang = new LelangKulonProgoAdapter();
  const bmkg = new BmkgAdapter();

  const [bapanasRes, pihpsRes, lelangRes, bmkgRes] = await Promise.allSettled([
    bapanas.fetchDailyPrices(targetDate),
    pihps.fetchDailyMarketPrices(targetDate),
    lelang.fetchAuctionPrices(targetDate),
    bmkg.fetchDiyWeatherObservations(targetDate),
  ]);

  const priceItems: MarketPriceIngest[] = [];
  if (bapanasRes.status === 'fulfilled') {
    priceItems.push(...bapanasRes.value);
  }
  if (pihpsRes.status === 'fulfilled') {
    priceItems.push(...pihpsRes.value);
  }
  if (lelangRes.status === 'fulfilled') {
    priceItems.push(...lelangRes.value);
  }

  const weatherItems: WeatherObservation[] = [];
  if (bmkgRes.status === 'fulfilled') {
    weatherItems.push(...bmkgRes.value);
  }

  const pricesCount = await persistMarketPrices(priceItems);
  const weatherCount = await persistWeatherObservations(weatherItems);

  return {
    date: targetDate,
    pricesIngested: pricesCount,
    weatherObservationsIngested: weatherCount,
  };
}

/**
 * Handler antrean job ml.data.ingest.daily yang mematuhi kontrak JobHandler (Promise<void>).
 * @param job Objek pekerjaan antrean.
 */
export async function handleDailyDataIngest(
  job: QueueJob<'ml.data.ingest.daily'>
): Promise<void> {
  await executeDataIngestion(job);
}

/**
 * Menyimpan larik data harga ke tabel commodity_raw_market_prices.
 * @param items Larik harga komoditas.
 * @returns Jumlah baris yang berhasil disimpan.
 */
async function persistMarketPrices(items: MarketPriceIngest[]): Promise<number> {
  if (items.length === 0) return 0;

  let saved = 0;
  for (const item of items) {
    try {
      const commRes = await query<{ id: string }>(
        'SELECT id FROM commodities WHERE code = $1 LIMIT 1',
        [item.commodityCode]
      );
      const row = commRes.rows[0];
      if (!row?.id) continue;

      const commodityId = row.id;
      await query(
        `INSERT INTO commodity_raw_market_prices (
          commodity_id, source_type, price, market_location, recorded_date, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (commodity_id, source_type, market_location, recorded_date)
        DO UPDATE SET price = EXCLUDED.price, metadata = EXCLUDED.metadata`,
        [
          commodityId,
          item.sourceType,
          item.price,
          item.marketLocation,
          item.recordedDate,
          JSON.stringify(item.metadata || {}),
        ]
      );
      saved++;
    } catch {
      continue;
    }
  }

  return saved;
}

/**
 * Menyimpan larik observasi cuaca ke tabel weather_observations.
 * @param items Larik observasi cuaca BMKG.
 * @returns Jumlah baris yang berhasil disimpan.
 */
async function persistWeatherObservations(items: WeatherObservation[]): Promise<number> {
  if (items.length === 0) return 0;

  let saved = 0;
  for (const item of items) {
    try {
      await query(
        `INSERT INTO weather_observations (
          regency, recorded_date, rainfall_mm, humidity_percent, temperature_celsius, weather_condition, bmkg_station_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (regency, recorded_date)
        DO UPDATE SET
          rainfall_mm = EXCLUDED.rainfall_mm,
          humidity_percent = EXCLUDED.humidity_percent,
          temperature_celsius = EXCLUDED.temperature_celsius,
          weather_condition = EXCLUDED.weather_condition,
          bmkg_station_code = EXCLUDED.bmkg_station_code`,
        [
          item.regency,
          item.recordedDate,
          item.rainfallMm,
          item.humidityPercent,
          item.temperatureCelsius,
          item.weatherCondition,
          item.bmkgStationCode,
        ]
      );
      saved++;
    } catch {
      continue;
    }
  }

  return saved;
}
