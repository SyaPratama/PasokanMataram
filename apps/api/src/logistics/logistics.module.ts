/**
 * @file apps/api/src/logistics/logistics.module.ts
 * @description NestJS module bundling Hub Logistics and Cold Chain operations.
 */

import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
