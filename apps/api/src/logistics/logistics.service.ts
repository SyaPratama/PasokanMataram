/**
 * @file apps/api/src/logistics/logistics.service.ts
 * @description NestJS service delegating to @pasok/logistics-hub-service.
 * Enforces Metrologi Legal standards and SNI cold chain governance.
 */

import { Injectable } from '@nestjs/common';
import type { SecurityContext, CommodityCategory } from '@pasok/domain';
import {
  LogisticsHubService as CoreLogisticsService,
  type QcDisputeInput,
} from '@pasok/logistics-hub-service';

@Injectable()
export class LogisticsService {
  private readonly core = new CoreLogisticsService();

  /**
   * Menentukan armada logistik dan zona suhu hub untuk komoditas.
   * @param commodity Kategori bahan pangan lokal.
   * @param forceFrozen Opsi status beku.
   * @returns Direktif rute logistik SNI.
   */
  public getRoutingDirective(commodity: CommodityCategory, forceFrozen?: boolean) {
    return this.core.routeCommodity(commodity, forceFrozen);
  }

  /**
   * Menyimpan log timbangan tera fisik dan menghitung deviasi susut bobot.
   * @param context Konteks keamanan operator hub.
   * @param input Data timbangan fisik.
   * @param hubId Identifier stasiun hub.
   * @returns Hasil evaluasi toleransi metrologi.
   */
  public async recordWeighing(
    context: SecurityContext,
    input: unknown,
    hubId: string
  ) {
    return this.core.submitWeighing(context, input, hubId);
  }

  /**
   * Memproses klaim sanggahan QC dengan penyesuaian dana escrow otomatis.
   * @param context Konteks keamanan pihak pemeriksa.
   * @param input Data pengajuan dispute.
   * @returns Putusan resolusi dan nominal pengembalian dana prorata.
   */
  public async fileQcDispute(context: SecurityContext, input: QcDisputeInput) {
    return this.core.processQcDispute(context, input);
  }
}
