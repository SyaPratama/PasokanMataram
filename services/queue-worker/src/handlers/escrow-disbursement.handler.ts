/**
 * @file services/queue-worker/src/handlers/escrow-disbursement.handler.ts
 * @description Auto-disbursement handler for H+1 escrow settlements
 */

import { query } from '@pasok/database';

interface EscrowDisbursementPayload {
  settlementId: string;
  reservationId: string;
}

export async function handleEscrowDisbursement(payload: EscrowDisbursementPayload): Promise<void> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload object');
  }
  const { settlementId } = payload;
  if (!settlementId || typeof settlementId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(settlementId)) {
    throw new Error(`Invalid settlementId format: ${settlementId}`);
  }
  // Check if settlement is ready for disbursement
  const result = await query(
    'SELECT id, locked_amount_rp, status FROM escrow_settlements WHERE id = ? AND status = ?',
    [settlementId, 'READY_FOR_DISBURSEMENT']
  );

  if (!result.rows || result.rows.length === 0) {
    console.log(`[Escrow Handler] Settlement ${settlementId} not ready for disbursement`);
    return;
  }

  const row = result.rows[0];
  const lockedAmount = row && typeof row === 'object' && 'locked_amount_rp' in row 
    ? Number(row.locked_amount_rp) 
    : 0;

  if (lockedAmount === 0) {
    console.error(`[Escrow Handler] Invalid amount for settlement ${settlementId}`);
    return;
  }

  try {
    // Update settlement to DISBURSED
    await query(
      'UPDATE escrow_settlements SET status = ?, disbursed_amount_rp = ?, disbursed_at = NOW(), updated_at = NOW() WHERE id = ?',
      ['DISBURSED', lockedAmount, settlementId]
    );

    console.log(`[Escrow Handler] Disbursed Rp ${lockedAmount.toLocaleString()} for settlement ${settlementId}`);

    // TODO: Integrate with Bank BPD DIY API for actual fund transfer
    // For now, we just update the database status
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Escrow Handler] Failed to disburse settlement ${settlementId}:`, errorMsg);
    throw err;
  }
}
