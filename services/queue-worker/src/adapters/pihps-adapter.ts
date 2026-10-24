/**
 * @file services/queue-worker/src/adapters/pihps-adapter.ts
 * @description Adapter pengambil data harga pasar tradisional PIHPS (Pusat Informasi Harga Pangan Strategis - Bank Indonesia).
 * Berfokus pada pasar sentral Kota Yogyakarta: Pasar Beringharjo, Kranggan, dan Demangan.
 * Mematuhi Prinsip I, II, dan IV Konstitusi PasokMataram.
 */

import type { MarketPriceIngest } from '@pasok/domain';

export interface PihpsAdapterOptions {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

interface PihpsRow {
  komoditas: string;
  pasar: string;
  harga: number;
}

/**
 * Adapter untuk integrasi data PIHPS Bank Indonesia pasar tradisional DIY.
 */
export class PihpsAdapter {
  private readonly timeoutMs: number;
  private readonly fetcher: typeof fetch;

  /**
   * Menginisialisasi instans PihpsAdapter.
   * @param options Opsi timeout dan custom fetcher.
   */
  public constructor(options?: PihpsAdapterOptions) {
    this.timeoutMs = options?.timeoutMs ?? 10000;
    this.fetcher = options?.fetchFn ?? fetch;
  }

  /**
   * Mengambil data harga pasar tradisional Yogyakarta dari feed PIHPS.
   * @param targetDate Tanggal target pencatatan YYYY-MM-DD.
   * @returns Larik data MarketPriceIngest terstandarisasi.
   */
  public async fetchDailyMarketPrices(targetDate: string): Promise<MarketPriceIngest[]> {
    const url = `https://hargapangan.id/api/market-prices?region=34.71&date=${targetDate}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await this.fetcher(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PasokMataram-PIHPS-Client/1.0',
        },
      });

      if (!res.ok) {
        return this.getFallbackPihpsData(targetDate);
      }

      const payload = (await res.json()) as { rows?: PihpsRow[] };
      if (!payload?.rows || !Array.isArray(payload.rows)) {
        return this.getFallbackPihpsData(targetDate);
      }

      return this.mapPihpsRows(payload.rows, targetDate);
    } catch {
      return this.getFallbackPihpsData(targetDate);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Memetakan baris PIHPS ke entitas MarketPriceIngest.
   * @param rows Baris harga dari PIHPS.
   * @param targetDate Tanggal pencatatan.
   * @returns Larik entitas terpetakan.
   */
  private mapPihpsRows(rows: PihpsRow[], targetDate: string): MarketPriceIngest[] {
    const results: MarketPriceIngest[] = [];

    for (const row of rows) {
      const code = this.resolveCode(row.komoditas);
      if (code && row.harga > 0) {
        results.push({
          commodityCode: code,
          sourceType: 'PIHPS',
          price: Number(row.harga),
          marketLocation: row.pasar || 'Pasar Beringharjo Yogyakarta',
          recordedDate: targetDate,
          metadata: { source: 'PIHPS Bank Indonesia' },
        });
      }
    }

    return results.length > 0 ? results : this.getFallbackPihpsData(targetDate);
  }

  /**
   * Mengonversi nama komoditas PIHPS ke kode sistem PasokMataram.
   * @param name Nama komoditas teks mentah.
   * @returns Kode komoditas terpetakan.
   */
  private resolveCode(name: string): string | null {
    const lower = name.toLowerCase();
    if (lower.includes('cabai rawit merah')) return 'CABAI_RAWIT_MERAH';
    if (lower.includes('cabai merah keriting')) return 'CABAI_MERAH_KERITING';
    if (lower.includes('bawang merah')) return 'BAWANG_MERAH';
    if (lower.includes('bawang putih')) return 'BAWANG_PUTIH_HONAN';
    if (lower.includes('beras')) return 'BERAS_PREMIUM_SLEMAN';
    if (lower.includes('daging ayam')) return 'DAGING_AYAM_RAS';
    return null;
  }

  /**
   * Menghasilkan kumpulan harga pasar tradisional cadangan saat API offline.
   * @param targetDate Tanggal target.
   * @returns Larik harga cadangan.
   */
  private getFallbackPihpsData(targetDate: string): MarketPriceIngest[] {
    return [
      {
        commodityCode: 'CABAI_RAWIT_MERAH',
        sourceType: 'PIHPS',
        price: 50000,
        marketLocation: 'Pasar Beringharjo',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'CABAI_RAWIT_MERAH',
        sourceType: 'PIHPS',
        price: 49000,
        marketLocation: 'Pasar Kranggan',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'BAWANG_MERAH',
        sourceType: 'PIHPS',
        price: 37500,
        marketLocation: 'Pasar Demangan',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'CABAI_MERAH_KERITING',
        sourceType: 'PIHPS',
        price: 33500,
        marketLocation: 'Pasar Beringharjo',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'BERAS_PREMIUM_SLEMAN',
        sourceType: 'PIHPS',
        price: 16000,
        marketLocation: 'Pasar Kranggan',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'BAWANG_PUTIH_HONAN',
        sourceType: 'PIHPS',
        price: 41000,
        marketLocation: 'Pasar Demangan',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'DAGING_AYAM_RAS',
        sourceType: 'PIHPS',
        price: 36000,
        marketLocation: 'Pasar Beringharjo',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
    ];
  }
}
