/**
 * @file apps/api/src/pooling/pooling.service.ts
 * @description NestJS service delegating to @pasok/pooling-service.
 * Enforces MTV Rp 500k minimum transaction value and distributed concurrency lock.
 */

import { Injectable } from '@nestjs/common';
import type { SecurityContext } from '@pasok/domain';
import { PoolingService as CorePoolingService } from '@pasok/pooling-service';

@Injectable()
export class PoolingService {
  private readonly core = new CorePoolingService();

  /**
   * Mengambil daftar kampanye pooling komoditas yang aktif.
   * @param context Konteks keamanan penyewa.
   * @returns Array kampanye aktif.
   */
  public async listCampaigns(context: SecurityContext) {
    return this.core.listActiveCampaigns(context);
  }

  /**
   * Membuat alokasi reservasi kuota pooling baru dengan validasi MTV Rp 500.000.
   * @param context Konteks pembeli horeka.
   * @param input Data masukan kuota.
   * @returns Rincian reservasi kuota dan instruksi pembayaran VA BPD DIY.
   */
  public async reserveQuota(context: SecurityContext, input: unknown) {
    return this.core.createReservation(context, input);
  }
}
