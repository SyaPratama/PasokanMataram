/**
 * @file apps/api/src/settlement/settlement.controller.ts
 * @description NestJS controller exposing Solosmartpay payment gateway, webhooks, and escrow disbursements.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import type { Request } from 'express';
import type { SecurityContext } from '@pasok/domain';
import { SettlementService } from './settlement.service';
import type { CreateInvoiceParams } from '@pasok/settlement-service';

@Controller('settlement')
export class SettlementController {
  private readonly settlementService: SettlementService;

  public constructor(@Optional() @Inject(SettlementService) settlementService?: SettlementService) {
    this.settlementService = settlementService ?? new SettlementService();
  }

  /**
   * Membuat invoice pembayaran Solosmartpay.
   */
  @Post('invoice')
  public async createInvoice(@Body() body: CreateInvoiceParams) {
    try {
      const invoice = await this.settlementService.createPaymentInvoice(body);
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
