/**
 * @file apps/api/src/settlement/settlement.controller.ts
 * @description NestJS controller exposing payment gateway invoice creation and status endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { PaymentProvider } from '@pasok/config';
import { SettlementService } from './settlement.service';
import type { CreateInvoiceParams } from './settlement.service';

interface CreateInvoiceBody extends CreateInvoiceParams {
  provider?: PaymentProvider;
}

@Controller('settlement')
export class SettlementController {
  public constructor(private readonly settlementService: SettlementService) {}

  /**
   * Membuat invoice pembayaran. Accepts optional `provider` to override active gateway.
   */
  @Post('invoice')
  public async createInvoice(@Body() body: CreateInvoiceBody) {
    try {
      const { provider, ...params } = body;
      const invoice = provider
        ? await this.settlementService.createPaymentInvoiceWithProvider(params, provider)
        : await this.settlementService.createPaymentInvoice(params);
      return { success: true, data: invoice };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat invoice';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil status invoice berdasarkan reference.
   */
  @Get('invoice/:reference')
  public async getInvoice(@Param('reference') reference: string) {
    try {
      const invoice = await this.settlementService.getInvoiceStatus(reference);
      if (!invoice) {
        throw new HttpException('Invoice tidak ditemukan', HttpStatus.NOT_FOUND);
      }
      return { success: true, data: invoice };
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      const message = err instanceof Error ? err.message : 'Gagal mengambil invoice';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
