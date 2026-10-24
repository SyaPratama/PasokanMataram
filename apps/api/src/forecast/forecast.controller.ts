/**
 * @file apps/api/src/forecast/forecast.controller.ts
 * @description NestJS controller exposing Machine Learning time-series price forecast and scenario simulations.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import { ForecastService } from './forecast.service';

@Controller('forecast')
export class ForecastController {
  private readonly forecastService: ForecastService;

  public constructor(@Optional() @Inject(ForecastService) forecastService?: ForecastService) {
    this.forecastService = forecastService ?? new ForecastService();
  }

  /**
   * Mengambil proyeksi harga komoditas multi-horizon H+1 s.d. H+7.
   * @param commodityId Identifier komoditas bahan pangan.
   * @returns Proyeksi kurva harga harian.
   */
  @Get('commodity/:id')
  public async getForecast(@Param('id') commodityId: string) {
    try {
      return await this.forecastService.getCommodityForecast(commodityId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat proyeksi harga.';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Menjalankan simulasi interaktif skenario anomali cuaca BMKG atau lonjakan BBM logistik.
   * @param body Payload parameter simulasi.
   * @returns Estimasi pergeseran harga komoditas.
   */
  @Post('simulate')
  public async postSimulation(@Body() body: Record<string, unknown>) {
    try {
      return await this.forecastService.simulateScenario(body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses simulasi.';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
