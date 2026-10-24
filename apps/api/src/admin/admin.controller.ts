/**
 * @file apps/api/src/admin/admin.controller.ts
 * @description NestJS controller exposing Super Admin platform governance, escrow, and KYB review endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import { AdminService, type ReviewKybDto } from './admin.service';

@Controller('admin')
export class AdminController {
  private readonly adminService: AdminService;

  public constructor(@Optional() @Inject(AdminService) adminService?: AdminService) {
    this.adminService = adminService ?? new AdminService();
  }

  /**
   * Mengambil daftar seluruh penyewa bisnis terdaftar (HoReKa, Gapoktan, Hub Operator).
   * @returns Array organisasi penyewa.
   */
  @Get('tenants')
  public async getTenants() {
    try {
      const tenants = await this.adminService.getTenants();
      return {
        success: true,
        data: tenants,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat penyewa.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil ringkasan rekonsiliasi rekening penampung escrow Bank BPD DIY.
   * @returns Data saldo escrow platform.
   */
  @Get('escrow')
  public async getEscrow() {
    try {
      const summary = await this.adminService.getEscrowReconciliation();
      return {
        success: true,
        data: summary,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat rekonsiliasi escrow.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil pemanfaatan alokasi kuota komoditas seluruh kabupaten di DIY.
   * @returns Array data kuota kabupaten.
   */
  @Get('quotas')
  public async getQuotas() {
    try {
      const quotas = await this.adminService.getPlatformQuotas();
      return {
        success: true,
        data: quotas,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat kuota platform.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil putusan verifikasi berkas legalitas KYB oleh Super Admin.
   * @param body Payload keputusan review.
   * @returns Hasil evaluasi status berkas.
   */
  @Post('kyb/review')
  public async postKybReview(@Body() body: ReviewKybDto) {
    if (!body.documentId || !body.tenantId || !body.decision) {
      throw new HttpException('Parameter putusan KYB tidak lengkap.', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.adminService.processKybReview(body);
      return {
        success: true,
        data: result,
        message: `Dokumen KYB berhasil diverifikasi dengan status: ${body.decision}.`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses review KYB.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
