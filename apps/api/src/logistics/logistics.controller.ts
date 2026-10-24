/**
 * @file apps/api/src/logistics/logistics.controller.ts
 * @description NestJS controller exposing Hub weighing, Cold Chain routing, and QC dispute endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import type { SecurityContext, CommodityCategory } from '@pasok/domain';
import { LogisticsService } from './logistics.service';
import type { QcDisputeInput } from '@pasok/logistics-hub-service';

@Controller('logistics')
export class LogisticsController {
  private readonly logisticsService: LogisticsService;

  public constructor(@Optional() @Inject(LogisticsService) logisticsService?: LogisticsService) {
    this.logisticsService = logisticsService ?? new LogisticsService();
  }

  /**
   * Mengambil petunjuk zona suhu dan armada logistik komoditas.
   * @param commodity Kategori komoditas.
   * @param frozen Parameter boolean pembekuan.
   * @returns Petunjuk zona suhu aman.
   */
  @Get('routing')
  public getRouting(
    @Query('commodity') commodity: CommodityCategory,
    @Query('frozen') frozen?: string
  ) {
    if (!commodity) {
      throw new HttpException('Parameter komoditas diperlukan.', HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      data: this.logisticsService.getRoutingDirective(commodity, frozen === 'true'),
    };
  }

  /**
   * Menyimpan log timbangan tera fisik dan validasi deviasi susut terhadap standar SNI.
   * @param body Payload pembacaan timbangan fisik.
   * @param hubId Header atau query stasiun hub.
   * @param tenantId Header penyewa.
   * @returns Hasil evaluasi metrologi dan toleransi.
   */
  @Post('weighing')
  public async postWeighing(
    @Body() body: Record<string, unknown>,
    @Query('hubId') hubIdQuery?: string,
    @Headers('x-hub-id') hubIdHeader?: string,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    const hubId = hubIdQuery || hubIdHeader || 'HUB-BANTUL-01';
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: (body.operatorId as string) || 'OPERATOR_QC',
      role: 'HUB_OPERATOR',
      isSuperAdmin: false,
    };

    try {
      const result = await this.logisticsService.recordWeighing(context, body, hubId);
      return {
        success: true,
        data: result,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mencatat log timbangan.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengajukan klaim sanggahan susut melebihi batas toleransi atau barang busuk dengan pemotongan dana seketika.
   * @param body Payload dispute QC.
   * @param tenantId Header penyewa.
   * @returns Hasil resolusi pemotongan dana prorata.
   */
  @Post('qc-dispute')
  public async submitDispute(
    @Body() body: QcDisputeInput,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: 'OPERATOR_QC',
      role: 'HUB_OPERATOR',
      isSuperAdmin: false,
    };

    try {
      const result = await this.logisticsService.fileQcDispute(context, body);
      return {
        success: true,
        data: result,
        message: 'Klaim dispute QC berhasil diproses dan dana escrow telah disesuaikan.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses dispute QC.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
