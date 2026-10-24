/**
 * @file apps/api/src/supplier/supplier.module.ts
 * @description NestJS module bundling Supplier and Gapoktan operations.
 */

import { Module } from '@nestjs/common';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';

@Module({
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
