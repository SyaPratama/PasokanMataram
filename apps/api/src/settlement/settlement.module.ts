/**
 * @file apps/api/src/settlement/settlement.module.ts
 * @description NestJS module bundling Escrow Settlement and Solosmartpay Payment Gateway.
 */

import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';

@Module({
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementModule {}
