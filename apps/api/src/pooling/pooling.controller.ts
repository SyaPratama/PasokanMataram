/**
 * @file apps/api/src/pooling/pooling.controller.ts
 * @description NestJS controller exposing Group Buying pooling endpoints.
 * Enforces MTV minimum Rp 500.000 rule and multi-tenant isolation.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import type { SecurityContext } from '@pasok/domain';
import { PoolingService } from './pooling.service';

@Controller('pooling')
export class PoolingController {
  private readonly poolingService: PoolingService;

  public constructor(@Optional() @Inject(PoolingService) poolingService?: PoolingService) {
    this.poolingService = poolingService ?? new PoolingService();
  }

  /**
   * Mengambil seluruh kampanye pooling bahan pangan lokal DIY yang terbuka.
   * @param tenantId Header identifier organisasi penyewa.
   * @returns Array kampanye aktif.
   */
  @Get('campaigns')
  public async getCampaigns(@Headers('x-tenant-id') tenantId?: string) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const campaigns = await this.poolingService.listCampaigns(context);
      return {
        success: true,
        data: campaigns,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat kampanye.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Menerbitkan reservasi kuota pembelian dengan validasi batas MTV Rp 500.000.
   * @param body Payload reservasi (campaignId, quantityKg, pricePerKg, deliveryAddress).
   * @param tenantId Header penyewa pembeli.
   * @returns Data reservasi dan VA Bank BPD DIY.
   */
  @Post('reservations')
  public async makeReservation(
    @Body() body: Record<string, unknown>,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    const buyerTenantId =
      (body.buyerTenantId as string) || tenantId || '00000000-0000-0000-0000-000000000000';
    const context: SecurityContext = {
      tenantId: buyerTenantId,
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const result = await this.poolingService.reserveQuota(context, {
        ...body,
        buyerTenantId,
      });

      return {
        success: true,
        data: result,
        message: 'Reservasi kuota pooling berhasil diterbitkan.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat reservasi.';
      const isMtvViolation = message.includes('minimal Rp 500.000');
      throw new HttpException(
        message,
        isMtvViolation ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
