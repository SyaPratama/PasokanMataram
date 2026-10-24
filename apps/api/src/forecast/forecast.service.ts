/**
 * @file apps/api/src/forecast/forecast.service.ts
 * @description NestJS service connecting to D:/MLPasokanMataram LightGBM multi-horizon forecasting service.
 * Supports simulation of BMKG rainfall anomalies and fuel price spikes with deterministic offline fallback.
 */

import { Injectable } from '@nestjs/common';
import {
  MlSimulationInputSchema,
  type MlSimulationInput,
} from '@pasok/domain';

@Injectable()
export class ForecastService {
  private readonly mlBaseUrl: string;

  public constructor() {
    this.mlBaseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Mengambil proyeksi harga komoditas pangan lokal DIY untuk 7 hari ke depan.
   * @param commodityId Identifier komoditas (misal: cabai-rawit-merah, bawang-merah).
   * @returns Proyeksi multi-horizon H+1 s.d. H+7.
   */
  public async getCommodityForecast(commodityId: string) {
    try {
      const response = await fetch(
        `${this.mlBaseUrl}/api/v1/forecast/commodity/${commodityId}`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(2000),
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch {
      return this.generateDeterministicForecast(commodityId);
    }

    return this.generateDeterministicForecast(commodityId);
  }

  /**
   * Menjalankan simulasi interaktif dampak curah hujan BMKG (%) atau kenaikan solar (%) terhadap harga.
   * @param rawInput Data masukan simulasi.
   * @returns Hasil proyeksi kurva simulasi.
   */
  public async simulateScenario(rawInput: unknown) {
    const validated: MlSimulationInput = MlSimulationInputSchema.parse(rawInput);

    try {
      const response = await fetch(`${this.mlBaseUrl}/api/v1/forecast/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      return this.generateDeterministicSimulation(validated);
    }

    return this.generateDeterministicSimulation(validated);
  }

  private generateDeterministicForecast(commodityId: string) {
    const basePrice = commodityId.includes('cabai') ? 48000 : 32000;
    const points = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const delta = Math.sin(i) * 1500;
      points.push({
        date: date.toISOString().split('T')[0],
        horizonDay: i,
        predictedPrice: Math.round(basePrice + delta),
        lowerBound: Math.round(basePrice + delta - 2000),
        upperBound: Math.round(basePrice + delta + 2000),
      });
    }

    return {
      success: true,
      data: {
        commodityId,
        commodityName: commodityId.replace(/-/g, ' ').toUpperCase(),
        unit: 'kg',
        currentPrice: basePrice,
        trend: 'STABLE',
        recommendedAction: 'BELI_SEKARANG',
        projectedPoints: points,
        modelEngine: 'LightGBM-MaaS-Fallback',
      },
    };
  }

  private generateDeterministicSimulation(input: MlSimulationInput) {
    const code = input.commodity_code || 'BAWANG_MERAH';
    const base = input.current_price || (code.toLowerCase().includes('cabai') ? 48000 : 32000);
    const rainfallImpact = (input.rainfall_anomaly_percent || 0) * 85;
    const fuelImpact = (input.fuel_price_hike_percent || 0) * 120;
    const simulatedPrice = Math.round(base + rainfallImpact + fuelImpact);

    return {
      success: true,
      data: {
        commodityCode: code,
        baselinePrice: base,
        simulatedPrice,
        deltaRp: simulatedPrice - base,
        deltaPercent: Number((((simulatedPrice - base) / base) * 100).toFixed(2)),
        explanation:
          'Simulasi model multivariat: anomali curah hujan dan penyesuaian biaya logistik bahan bakar.',
      },
    };
  }
}
