/**
 * @file apps/api/src/buyer/buyer.controller.ts
 * @description NestJS controller exposing buyer portal endpoints: outlets, orders, catalog, and reviews.
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
import { BuyerService, type CreateOutletDto, type SubmitReviewDto } from './buyer.service';

@Controller('buyer')
export class BuyerController {
  private readonly buyerService: BuyerService;

  public constructor(@Optional() @Inject(BuyerService) buyerService?: BuyerService) {
    this.buyerService = buyerService ?? new BuyerService();
  }

  /**
   * Mengambil daftar outlet dapur restoran milik penyewa pembeli.
   * @param tenantId Header identifier organisasi penyewa.
   * @returns Array outlet dapur.
   */
  @Get('outlets')
  public async getOutlets(@Headers('x-tenant-id') tenantId?: string) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const outlets = await this.buyerService.getOutlets(context);
      return {
        success: true,
        data: outlets,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat outlet.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mendaftarkan outlet dapur cabang baru.
   * @param body Data outlet baru.
   * @param tenantId Header penyewa pembeli.
   * @returns Outlet baru yang terdaftar.
   */
  @Post('outlets')
  public async addOutlet(
    @Body() body: CreateOutletDto,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    if (!body.name || !body.address || !body.regency) {
      throw new HttpException('Nama, alamat, dan kabupaten outlet wajib diisi.', HttpStatus.BAD_REQUEST);
    }

    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const outlet = await this.buyerService.createOutlet(context, body);
      return {
        success: true,
        data: outlet,
        message: 'Outlet dapur berhasil ditambahkan.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membuat outlet.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil riwayat standing orders dan pesanan pooling dapur.
   * @param tenantId Header penyewa pembeli.
   * @returns Array riwayat pesanan.
   */
  @Get('orders')
  public async getOrders(@Headers('x-tenant-id') tenantId?: string) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const orders = await this.buyerService.getOrders(context);
      return {
        success: true,
        data: orders,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat pesanan.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil katalog etalase multi-SKU supplier bahan pangan lokal terverifikasi.
   * @returns Array katalog produk.
   */
  @Get('catalog')
  public async getCatalog() {
    try {
      const items = await this.buyerService.getCatalog();
      return {
        success: true,
        data: items,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat katalog.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengirimkan ulasan B2B dua arah ke supplier.
   * @param body Payload ulasan rating.
   * @param tenantId Header penyewa pembeli.
   * @returns Respon penerimaan ulasan.
   */
  @Post('reviews')
  public async postReview(
    @Body() body: SubmitReviewDto,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'BUYER',
      isSuperAdmin: false,
    };

    try {
      const review = await this.buyerService.submitReview(context, body);
      return {
        success: true,
        data: review,
        message: 'Ulasan B2B berhasil diterbitkan.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim ulasan.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
