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
import type { CreatePaymentParams } from '@pasok/settlement-service';

@Controller('settlement')
export class SettlementController {
  private readonly settlementService: SettlementService;

  public constructor(@Optional() @Inject(SettlementService) settlementService?: SettlementService) {
    this.settlementService = settlementService ?? new SettlementService();
  }

  /**
   * Mengambil status rekening escrow untuk pesanan pooling tertentu.
   * @param reservationId Identifier reservasi kuota.
   * @param tenantId Header organisasi penyewa.
   * @returns Rincian saldo penampung escrow BPD DIY.
   */
  @Get('escrow/:reservationId')
  public async getEscrow(
    @Param('reservationId') reservationId: string,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const result = await this.settlementService.getEscrowDetails(context, reservationId);
      if (!result) {
        throw new HttpException('Rekening escrow tidak ditemukan.', HttpStatus.NOT_FOUND);
      }
      return {
        success: true,
        data: result,
      };
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      const message = err instanceof Error ? err.message : 'Gagal memuat status escrow.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Menerbitkan tagihan pembayaran baru via gateway Solosmartpay (QRIS & Virtual Accounts).
   * Menerapkan pembagian biaya resmi: 0.3% biaya sistem pembeli, 0.5% fee platform merchant.
   * @param body Parameter pembuatan tagihan.
   * @returns Faktur tagihan dengan nomor VA atau string QRIS.
   */
  @Post('payments/solosmartpay')
  public async createSolosmartpayPayment(@Body() body: CreatePaymentParams) {
    if (!body.orderId || !body.amountRp || !body.customerEmail || !body.method) {
      throw new HttpException(
        'Parameter tagihan Solosmartpay tidak lengkap.',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const invoice = await this.settlementService.createPaymentInvoice(body);
      return {
        success: true,
        data: invoice,
        message: 'Tagihan pembayaran Solosmartpay berhasil diterbitkan.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menerbitkan tagihan.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Endpoint listener webhook callback notifikasi pembayaran berhasil dari Solosmartpay.
   * Memvalidasi tanda tangan kriptografi HMAC-SHA256 untuk memastikan integritas payload.
   * @param req Request Express mentah untuk membaca body string.
   * @param body Payload JSON event.
   * @param signature Header X-SoloSmartPay-Signature.
   * @returns Konfirmasi keberhasilan penerimaan webhook.
   */
  @Post('webhook/solosmartpay')
  public async handleSolosmartpayWebhook(
    @Req() req: Request,
    @Body() body: unknown,
    @Headers('x-solosmartpay-signature') signature?: string
  ) {
    try {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(body);
      const result = await this.settlementService.handleWebhook(
        rawBody,
        signature || ''
      );

      return {
        success: true,
        data: result,
        message: 'Webhook Solosmartpay berhasil diverifikasi dan diproses.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verifikasi webhook gagal.';
      const isSignatureError = message.includes('tidak valid');
      throw new HttpException(
        message,
        isSignatureError ? HttpStatus.UNAUTHORIZED : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Memicu eksekusi massal pencairan dana escrow H+1 ke rekening kelompok tani.
   * @param body Opsi batas transaksi.
   * @returns Ringkasan hasil batch pencairan.
   */
  @Post('disburse')
  public async triggerDisburse(@Body() body?: { limit?: number }) {
    try {
      const summary = await this.settlementService.triggerDisbursements(body?.limit);
      return {
        success: true,
        data: summary,
        message: 'Pencairan dana escrow berhasil diproses.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses pencairan.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
