/**
 * @file apps/api/src/app.module.ts
 * @description Root NestJS application module orchestrating domain microservices.
 */

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CsrfMiddleware } from './common/csrf.middleware';
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
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
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
    WebhooksModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
