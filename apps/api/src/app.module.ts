/**
 * @file apps/api/src/app.module.ts
 * @description Root NestJS application module orchestrating domain microservices.
 */

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PoolingModule } from './pooling/pooling.module';
import { LogisticsModule } from './logistics/logistics.module';
import { SettlementModule } from './settlement/settlement.module';
import { ForecastModule } from './forecast/forecast.module';
import { BuyerModule } from './buyer/buyer.module';
import { SupplierModule } from './supplier/supplier.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    AuthModule,
    PoolingModule,
    LogisticsModule,
    SettlementModule,
    ForecastModule,
    BuyerModule,
    SupplierModule,
    AdminModule,
    HealthModule,
    NotificationsModule,
  ],
})
export class AppModule {}
