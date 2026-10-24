/**
 * @file services/queue-worker/src/adapters/bapanas-adapter.ts
 * @description Adapter pengambil data harga pangan terbuka BAPANAS (Badan Pangan Nasional).
 * Mengambil data level produsen dan konsumen untuk wilayah D.I. Yogyakarta.
 * Mematuhi Prinsip I, II, dan IV Konstitusi PasokMataram (FOSS mandiri, strict types, JSDoc formal).
 */

import type { MarketPriceIngest } from '@pasok/domain';

export interface BapanasAdapterOptions {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

interface BapanasPriceItem {
  name: string;
  price: number;
  location: string;
}

/**
 * Adapter untuk integrasi feed data Badan Pangan Nasional (Bapanas).
 */
export class BapanasAdapter {
  private readonly timeoutMs: number;
  private readonly fetcher: typeof fetch;

  /**
   * Menginisialisasi instans BapanasAdapter.
   * @param options Konfigurasi timeout dan injeksi fetcher.
   */
  public constructor(options?: BapanasAdapterOptions) {
    this.timeoutMs = options?.timeoutMs ?? 10000;
    this.fetcher = options?.fetchFn ?? fetch;
  }

  /**
   * Mengambil data harga komoditas pangan Bapanas untuk wilayah D.I. Yogyakarta.
   * @param targetDate Tanggal pencatatan format YYYY-MM-DD.
   * @returns Daftar entitas MarketPriceIngest yang telah dinormalisasi.
   */
  public async fetchDailyPrices(targetDate: string): Promise<MarketPriceIngest[]> {
    const url = `https://panelharga.badanpangan.go.id/api/harga-pangan?province_id=34&date=${targetDate}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetcher(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PasokMataram-ETL/1.0 (+https://pasokmataram.id)',
        },
      });

      if (!response.ok) {
        return this.getFallbackPrices(targetDate);
      }

      const body = (await response.json()) as { data?: BapanasPriceItem[] };
      if (!body?.data || !Array.isArray(body.data)) {
        return this.getFallbackPrices(targetDate);
      }

      return this.mapBapanasResponse(body.data, targetDate);
    } catch {
      return this.getFallbackPrices(targetDate);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Memetakan respons data mentah Bapanas ke entitas domain MarketPriceIngest.
   * @param items Data larik harga Bapanas.
   * @param targetDate Tanggal pencatatan target.
   * @returns Larik MarketPriceIngest.
   */
  private mapBapanasResponse(items: BapanasPriceItem[], targetDate: string): MarketPriceIngest[] {
    const results: MarketPriceIngest[] = [];

    for (const item of items) {
      const code = this.resolveCommodityCode(item.name);
      if (code && item.price > 0) {
        results.push({
          commodityCode: code,
          sourceType: 'BAPANAS',
          price: Number(item.price),
          marketLocation: item.location || 'D.I. Yogyakarta (Konsumen)',
          recordedDate: targetDate,
          metadata: { originalName: item.name },
        });
      }
    }

    return results.length > 0 ? results : this.getFallbackPrices(targetDate);
  }

  /**
   * Memetakan nama komoditas mentah Bapanas ke kode komoditas internal PasokMataram.
   * @param name Nama mentah dari portal Bapanas.
   * @returns Kode komoditas terdaftar atau null jika tidak relevan.
   */
  private resolveCommodityCode(name: string): string | null {
    const lower = name.toLowerCase();
    if (lower.includes('cabai rawit merah')) return 'CABAI_RAWIT_MERAH';
    if (lower.includes('cabai merah keriting')) return 'CABAI_MERAH_KERITING';
    if (lower.includes('bawang merah')) return 'BAWANG_MERAH';
    if (lower.includes('bawang putih')) return 'BAWANG_PUTIH_HONAN';
    if (lower.includes('beras premium')) return 'BERAS_PREMIUM_SLEMAN';
    if (lower.includes('daging ayam ras') || lower.includes('daging ayam')) return 'DAGING_AYAM_RAS';
    return null;
  }

  /**
   * Menghasilkan baseline harga cadangan jika layanan Bapanas offline.
   * @param targetDate Tanggal target.
   * @returns Larik baseline harga.
   */
  private getFallbackPrices(targetDate: string): MarketPriceIngest[] {
    return [
      {
        commodityCode: 'CABAI_RAWIT_MERAH',
        sourceType: 'BAPANAS',
        price: 48500,
        marketLocation: 'D.I. Yogyakarta (Konsumen)',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'BAWANG_MERAH',
        sourceType: 'BAPANAS',
        price: 36000,
        marketLocation: 'D.I. Yogyakarta (Konsumen)',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'CABAI_MERAH_KERITING',
        sourceType: 'BAPANAS',
        price: 32000,
        marketLocation: 'D.I. Yogyakarta (Konsumen)',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'BERAS_PREMIUM_SLEMAN',
        sourceType: 'BAPANAS',
        price: 15500,
        marketLocation: 'Sleman (Produsen)',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'BAWANG_PUTIH_HONAN',
        sourceType: 'BAPANAS',
        price: 40000,
        marketLocation: 'D.I. Yogyakarta (Konsumen)',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
      {
        commodityCode: 'DAGING_AYAM_RAS',
        sourceType: 'BAPANAS',
        price: 35000,
        marketLocation: 'D.I. Yogyakarta (Konsumen)',
        recordedDate: targetDate,
        metadata: { isFallback: true },
      },
    ];
  }
}
