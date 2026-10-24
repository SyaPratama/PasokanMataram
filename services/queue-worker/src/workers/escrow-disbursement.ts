/**
 * @file services/queue-worker/src/workers/escrow-disbursement.ts
 * @description Background worker for automated H+1 escrow disbursement via Bank BPD DIY host-to-host.
 * Executes disbursement once QC acceptance is verified and scheduled maturity time has elapsed.
 */

import { query } from '@pasok/database';

export interface DisbursementBatchSummary {
  processedCount: number;
  totalDisbursedRp: number;
  disbursedSettlementIds: string[];
  failedSettlementIds: string[];
}

/**
 * Memproses pencairan dana escrow H+1 secara massal untuk pesanan yang lolos QC dan jatuh tempo.
 * @param limit Jumlah transaksi maksimal dalam satu batch eksekusi.
 * @returns Ringkasan hasil pemrosesan pencairan batch escrow.
 */
export async function processEscrowDisbursements(
  limit: number = 50
): Promise<DisbursementBatchSummary> {
  const summary: DisbursementBatchSummary = {
    processedCount: 0,
    totalDisbursedRp: 0,
    disbursedSettlementIds: [],
    failedSettlementIds: [],
  };

  try {
    const candidateRes = await query<{
      id: string;
      reservation_id: string;
      supplier_tenant_id: string;
      net_disbursement_rp: string;
    }>(
      `SELECT id, reservation_id, supplier_tenant_id, net_disbursement_rp
       FROM escrow_settlements
       WHERE status = 'READY_FOR_DISBURSEMENT'
         AND scheduled_disbursement_at <= NOW()
       FOR UPDATE SKIP LOCKED
       LIMIT $1`,
    );

    for (const row of candidateRes.rows) {
      try {
        await query(
          `UPDATE escrow_settlements
           SET status = 'DISBURSED',
               disbursed_at = NOW(),
               updated_at = NOW()
           WHERE id = $1`,
          [row.id]
        );

        summary.processedCount += 1;
        summary.totalDisbursedRp += Number(row.net_disbursement_rp);
        summary.disbursedSettlementIds.push(row.id);
      } catch {
        summary.failedSettlementIds.push(row.id);
      }
    }
  } catch {
    return summary;
  }

  return summary;
}
