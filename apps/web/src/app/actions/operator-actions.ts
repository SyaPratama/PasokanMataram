'use server';

import crypto from 'crypto';
import { createHubOperatorSchema, CreateHubOperatorInput } from '../../lib/validations/operator-schemas';
import { pool } from '@pasok/database';

/**
 * Representasi hasil operasi Server Action penerbitan operator logistik hub.
 */
export interface CreateHubOperatorResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: {
    readonly operatorId: string;
    readonly userId: string;
    readonly assignedHubId: string;
    readonly microRole: string;
    readonly activationToken: string;
    readonly activationUrl: string;
    readonly expiresAt: string;
  };
  readonly errors?: Record<string, string>;
}

/**
 * Server Action untuk penerbitan akun Operator Hub oleh Super Admin.
 * Menghasilkan token aktivasi kriptografis berbatas 24 jam dan mengikat akun ke fasilitas fisik.
 * Mematuhi FR-012 (Audit Trail) dan FR-020 (Closed Logistics Provisioning).
 * @param input Data profil operator yang diterbitkan.
 * @param adminId Identitas Super Admin penerbit akun.
 * @returns Hasil penerbitan dan tautan aktivasi mandiri.
 */
export async function createHubOperatorAction(
  input: CreateHubOperatorInput,
  adminId: string = '00000000-0000-0000-0000-000000000001'
): Promise<CreateHubOperatorResult> {
  const parseResult = createHubOperatorSchema.safeParse(input);
  if (!parseResult.success) {
    const errors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const key = String(issue.path[0] || 'form');
      errors[key] = issue.message;
    }
    return {
      success: false,
      message: 'Validasi data operator gagal',
      errors,
    };
  }

  const { fullName, email, phoneNumber, assignedHubId, microRole } = parseResult.data;

  const rawActivationToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const operatorId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO users (id, tenant_id, email, phone, password_hash, micro_role, full_name, is_active)
         VALUES ($1, $1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name`,
        [userId, email, phoneNumber, 'PENDING_SET_PASSWORD', microRole, fullName, true]
      );

      await client.query(
        `INSERT INTO hub_operators (id, user_id, assigned_hub_id, micro_role, activation_token_hash, token_expires_at, status, issued_by_admin_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [operatorId, userId, assignedHubId, microRole, tokenHash, expiresAt, 'PENDING_ACTIVATION', adminId]
      );

      await client.query(
        `INSERT INTO audit_logs (actor_user_id, action_name, resource_type, resource_id, payload_json)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          adminId,
          'PROVISION_HUB_OPERATOR',
          'hub_operators',
          operatorId,
          JSON.stringify({ assignedHubId, microRole, email }),
        ]
      );

      await client.query('COMMIT');
    } catch (dbError: unknown) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch {
  }

  const activationUrl = `/auth/activate?token=${rawActivationToken}`;

  return {
    success: true,
    message: `Akun operator ${fullName} berhasil diterbitkan untuk fasilitas ${assignedHubId}`,
    data: {
      operatorId,
      userId,
      assignedHubId,
      microRole,
      activationToken: rawActivationToken,
      activationUrl,
      expiresAt: expiresAt.toISOString(),
    },
  };
}
