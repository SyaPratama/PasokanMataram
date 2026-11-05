/**
 * @file apps/api/src/webhooks/webhooks.module.ts
 * @description NestJS module for payment webhook handlers
 */

import { Module } from '@nestjs/common';
import { SolosmartpayWebhookController } from './solosmartpay.controller';

@Module({
  controllers: [SolosmartpayWebhookController],
})
export class WebhooksModule {}
