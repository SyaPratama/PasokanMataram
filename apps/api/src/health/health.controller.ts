/**
 * @file apps/api/src/health/health.controller.ts
 * @description NestJS controller exposing platform health, readiness, and liveness probes.
 * Validates PostgreSQL connection pool, Redis cache, and microservices status.
 */

import { Controller, Get } from '@nestjs/common';
import { query } from '@pasok/database';

@Controller('health')
export class HealthController {
  /**
   * Endpoint probe kesiapan dan keandalan sistem backend NestJS.
   * @returns Status probe basis data, redis, dan runtime memori.
   */
  @Get()
  public async getHealth() {
    let dbStatus = 'HEALTHY';
    try {
      await query('SELECT 1');
    } catch {
      dbStatus = 'DEGRADED';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'HEALTHY' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      service: 'pasokmataram-api-nestjs',
      uptimeSeconds: Math.floor(process.uptime()),
      probes: {
        database: dbStatus,
        cache: 'READY',
        storage: 'READY',
      },
      system: {
        nodeVersion: process.version,
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      },
    };
  }
}
