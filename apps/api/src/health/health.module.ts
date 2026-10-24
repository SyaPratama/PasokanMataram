/**
 * @file apps/api/src/health/health.module.ts
 * @description NestJS module bundling system health probes.
 */

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
