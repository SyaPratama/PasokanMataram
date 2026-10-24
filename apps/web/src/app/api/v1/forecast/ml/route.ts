/**
 * @file apps/web/src/app/api/v1/forecast/ml/route.ts
 * @description Route handler Next.js API untuk integrasi FastAPI ML Direct Multi-Horizon D:/MLPasokanMataram.
 */

import { NextResponse } from 'next/server';
import { MlSimulationInputSchema } from '@pasok/domain';
import {
  fetchMlForecastList,
  fetchMlSingleForecast,
  simulateMlScenario,
  adaptMlToDomainForecast,
} from '@/lib/ml-forecast-client';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code') || searchParams.get('commodity_code');
  const category = searchParams.get('category') || undefined;
  const shouldAdapt = searchParams.get('adapt') === 'domain';

  try {
    if (code) {
      const result = await fetchMlSingleForecast(code);
      if (shouldAdapt) {
        return NextResponse.json({
          success: true,
          source: result.source,
          data: adaptMlToDomainForecast(result.data),
        });
      }
      return NextResponse.json({
        success: true,
        source: result.source,
        data: result.data,
      });
    }

    const result = await fetchMlForecastList(category);
    if (shouldAdapt) {
      return NextResponse.json({
        success: true,
        source: result.source,
        count: result.data.count,
        data: result.data.data.map(adaptMlToDomainForecast),
      });
    }

    return NextResponse.json({
      success: true,
      source: result.source,
      count: result.data.count,
      data: result.data.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kesalahan internal ML route';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Payload JSON tidak valid' },
      { status: 400 }
    );
  }

  const parseResult = MlSimulationInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validasi skema simulasi gagal',
        details: parseResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const shouldAdapt = searchParams.get('adapt') === 'domain';

  try {
    const result = await simulateMlScenario(parseResult.data);
    if (shouldAdapt) {
      return NextResponse.json({
        success: true,
        source: result.source,
        data: adaptMlToDomainForecast(result.data),
      });
    }

    return NextResponse.json({
      success: true,
      source: result.source,
      data: result.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengeksekusi simulasi skenario ML';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
