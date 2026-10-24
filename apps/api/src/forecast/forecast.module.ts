/**
 * @file apps/api/src/forecast/forecast.module.ts
 * @description NestJS module bundling Machine Learning forecasting services.
 */

import { Module } from '@nestjs/common';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';

@Module({
  controllers: [ForecastController],
  providers: [ForecastService],
  exports: [ForecastService],
})
export class ForecastModule {}
