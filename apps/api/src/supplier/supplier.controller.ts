/**
 * @file apps/api/src/supplier/supplier.controller.ts
 * @description NestJS controller exposing supplier portal endpoints: products, allocations, metrics, and dispatch.
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
import {
  SupplierService,
  type CreateProductDto,
  type DispatchOrderDto,
} from './supplier.service';

@Controller('supplier')
export class SupplierController {
  private readonly supplierService: SupplierService;

  public constructor(@Optional() @Inject(SupplierService) supplierService?: SupplierService) {
    this.supplierService = supplierService ?? new SupplierService();
  }

  /**
   * Mengambil daftar SKU dagangan supplier yang terdaftar.
   * @param tenantId Header organisasi supplier.
   * @returns Array produk dagangan.
   */
  @Get('products')
  public async getProducts(@Headers('x-tenant-id') tenantId?: string) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'SUPPLIER',
      isSuperAdmin: false,
    };

    try {
      const products = await this.supplierService.getProducts(context);
      return {
        success: true,
        data: products,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat produk.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mendaftarkan produk pangan lokal baru ke etalase multi-SKU.
   * @param body Data produk.
   * @param tenantId Header supplier.
   * @returns Entitas produk tersimpan.
   */
  @Post('products')
  public async addProduct(
    @Body() body: CreateProductDto,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    if (!body.name || !body.price || !body.skuCode) {
      throw new HttpException('Nama, harga, dan kode SKU wajib diisi.', HttpStatus.BAD_REQUEST);
    }

    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'SUPPLIER',
      isSuperAdmin: false,
    };

    try {
      const product = await this.supplierService.createProduct(context, body);
      return {
        success: true,
        data: product,
        message: 'Produk berhasil ditambahkan ke etalase multi-SKU.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan produk.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil alokasi komitmen kuota panen massal supplier.
   * @param tenantId Header supplier.
   * @returns Array kuota panen.
   */
  @Get('allocations')
  public async getAllocations(@Headers('x-tenant-id') tenantId?: string) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'SUPPLIER',
      isSuperAdmin: false,
    };

    try {
      const allocations = await this.supplierService.getAllocations(context);
      return {
        success: true,
        data: allocations,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat alokasi.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Mengambil metrik analitik dashboard operasional supplier.
   * @param tenantId Header supplier.
   * @returns Metrik ringkasan performa.
   */
  @Get('dashboard')
  public async getMetrics(@Headers('x-tenant-id') tenantId?: string) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'SUPPLIER',
      isSuperAdmin: false,
    };

    try {
      const metrics = await this.supplierService.getDashboardMetrics(context);
      return {
        success: true,
        data: metrics,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat metrik.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Menerbitkan status pengiriman armada logistik supplier.
   * @param body Rincian pengiriman.
   * @param tenantId Header supplier.
   * @returns Manifest pengiriman tersimpan.
   */
  @Post('dispatch')
  public async postDispatch(
    @Body() body: DispatchOrderDto,
    @Headers('x-tenant-id') tenantId?: string
  ) {
    const context: SecurityContext = {
      tenantId: tenantId || '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      role: 'SUPPLIER',
      isSuperAdmin: false,
    };

    try {
      const manifest = await this.supplierService.dispatchDelivery(context, body);
      return {
        success: true,
        data: manifest,
        message: 'Armada pengiriman berhasil diberangkatkan.',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mencatat pengiriman.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
