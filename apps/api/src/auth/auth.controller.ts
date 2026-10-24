/**
 * @file apps/api/src/auth/auth.controller.ts
 * @description NestJS controller exposing authentication, KYB onboarding, and presigner endpoints.
 */

import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly authService: AuthService;

  public constructor(@Optional() @Inject(AuthService) authService?: AuthService) {
    this.authService = authService ?? new AuthService();
  }

  /**
   * Endpoint presigning MinIO S3 untuk unggah dokumen legalitas KYB pedagang/supplier.
   * @param tenantId Identifier penyewa.
   * @param documentType Tipe dokumen.
   * @param fileName Nama berkas.
   * @param contentType MIME type.
   * @returns URL presigned dan path MinIO.
   */
  @Get('kyb/upload-url')
  public async getUploadUrl(
    @Query('tenantId') tenantId: string,
    @Query('documentType') documentType: string,
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string
  ) {
    if (!tenantId || !documentType || !fileName) {
      throw new HttpException('Parameter dokumen tidak lengkap.', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.authService.getKybUploadUrl(
        tenantId,
        documentType,
        fileName,
        contentType || 'application/pdf'
      );
      return {
        success: true,
        data: result,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat URL presigned.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Endpoint audit dokumen KYB yang menunggu verifikasi admin.
   * @returns Daftar dokumen pending verifikasi.
   */
  @Get('kyb/pending')
  public async getPendingKyb() {
    try {
      const audits = await this.authService.getPendingKybAudits();
      return {
        success: true,
        data: audits,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat daftar audit KYB.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
