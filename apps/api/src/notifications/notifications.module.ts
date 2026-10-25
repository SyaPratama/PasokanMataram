/**
 * @file apps/api/src/notifications/notifications.module.ts
 * @description NestJS module for Notifications, Web Push, and SSE Stream.
 */

import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
