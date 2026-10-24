/**
 * @file apps/web/src/lib/telemetry.ts
 * @description Client-side analytics and conversion funnel telemetry dispatcher for PasokMataram ecosystem.
 * Tracks 4 key conversion stages with non-blocking fail-safe beacon transmission.
 */

export type FunnelStep =
  | 'CAMPAIGN_VIEWED'
  | 'QUANTITY_SELECTED'
  | 'RESERVATION_CREATED'
  | 'PAYMENT_COMPLETED';

export interface TelemetryPayload {
  step: FunnelStep;
  campaignId: string;
  buyerTenantId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Mencatat langkah konversi corong reservasi pooling untuk analisis retensi dan efektivitas kampanye.
 * @param step Tahapan corong konversi yang dicapai pengguna.
 * @param campaignId Identifier unik kampanye pooling.
 * @param metadata Informasi kontekstual tambahan (misal perangkat, kuantitas kg, atau nilai transaksi).
 * @param buyerTenantId Identifier penyewa pembeli jika telah login.
 */
export async function trackFunnelStep(
  step: FunnelStep,
  campaignId: string,
  metadata?: Record<string, unknown>,
  buyerTenantId?: string
): Promise<void> {
  const payload: TelemetryPayload = {
    step,
    campaignId,
    buyerTenantId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      await fetch('/api/v1/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch {
    return;
  }
}
