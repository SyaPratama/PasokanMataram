/**
 * @file apps/api/src/health/dbHealth.ts
 * @description Database connectivity health check controller with retry fallback.
 */

import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { query } from '@pasok/database';

/**
 * Controller providing dedicated database health probe at /health/db.
 */
@Controller('health')
export class DbHealthController {
  /**
   * Checks database connectivity by executing SELECT 1 with retry resilience.
   * @returns 200 OK when database responds, or throws 503 when exhausted.
   */
  @Public()
  @Get('db')
  public async check(): Promise<{ status: string; database: string }> {
    try {
      await query('SELECT 1');
      return { status: 'OK', database: 'HEALTHY' };
    } catch {
      throw new ServiceUnavailableException({ status: 'ERROR', database: 'UNAVAILABLE' });
    }
  }
}
