/**
 * @file src/services/tenant-service.ts
 * @description Layanan domain untuk pendaftaran bisnis, autentikasi, dan kepatuhan hukum KYB.
 * Mematuhi Prinsip II, VI, dan VII Konstitusi PasokMataram v1.4.0 (3NF, RLS, Transaksional).
 */

import { query, withTransaction, withTenantContext } from '../lib/db';
import { hashPassword, verifyPassword, issueSessionToken, type TokenPayload } from '../lib/auth';
import { withLock } from '../lib/redis-lock';
import { asTenantId, asUserId, asKybDocumentId, type Tenant, type User, type KybDocument } from '../types/tenant';
import type { RegisterBusinessInput, KybDocumentUploadInput } from '../lib/validations/auth-schemas';
import type { AuditKybPendingQuery, AuditKybReviewInput } from '../lib/validations/kyb-audit-schemas';
import type { SecurityContext } from '../types/api';

interface TenantDbRow {
  id: string;
  business_name: string;
  tenant_type: Tenant['tenantType'];
  regency: Tenant['regency'];
  kyb_status: Tenant['kybStatus'];
  rejection_reason: string | null;
  verified_at: Date | null;
  verified_by: string | null;
  created_at: Date;
  updated_at: Date;
}

interface UserDbRow {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone_number: string;
  role: User['role'];
  is_active: boolean;
  created_at: Date;
}

interface UserAuthRow extends UserDbRow {
  business_name: string;
  tenant_type: Tenant['tenantType'];
  regency: Tenant['regency'];
  kyb_status: Tenant['kybStatus'];
  rejection_reason: string | null;
  verified_at: Date | null;
  verified_by: string | null;
  updated_at: Date;
}

interface KybDocumentDbRow {
  id: string;
  tenant_id: string;
  document_type: KybDocument['documentType'];
  document_number: string;
  file_storage_key: string;
  file_mime_type: string;
  file_size_bytes: number;
  status: KybDocument['status'];
  rejection_note: string | null;
  uploaded_at: Date;
}

interface CountRow {
  total: number;
}

interface PendingKybQueueRow {
  tenant_id: string;
  business_name: string;
  tenant_type: 'HOREKA_BUYER' | 'GAPOKTAN_SUPPLIER';
  regency: 'SLEMAN' | 'BANTUL' | 'KULON_PROGO' | 'GUNUNGKIDUL' | 'KOTA_YOGYAKARTA';
  kyb_status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  submitted_at: Date | string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  documents_count: number;
}

interface TenantDetailRow {
  id: string;
  business_name: string;
  tenant_type: string;
  regency: string;
  kyb_status: string;
  rejection_reason: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
}

export class TenantService {
  /**
   * Mendaftarkan entitas bisnis baru (HoReKa / Gapoktan) beserta akun pemilik pertamanya secara atomik.
   */
  static async registerBusiness(input: RegisterBusinessInput): Promise<{
    tenant: Tenant;
    user: Omit<User, 'passwordHash'>;
    sessionToken: string;
  }> {
    return await withTransaction(async (client) => {
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
      if (existingUser.rows.length > 0) {
        throw new Error('Alamat email sudah terdaftar dalam sistem.');
      }

      const tenantRes = await client.query(
        `INSERT INTO tenants (business_name, tenant_type, regency, kyb_status)
         VALUES ($1, $2, $3, 'PENDING_VERIFICATION')
         RETURNING *`,
        [input.businessName, input.tenantType, input.regency]
      );
      const tenantRow = tenantRes.rows[0];
      if (!tenantRow) {
        throw new Error('Gagal membuat entitas bisnis.');
      }
      const tenantId = asTenantId(tenantRow.id);

      const passwordHash = await hashPassword(input.password);

      const userRes = await client.query(
        `INSERT INTO users (tenant_id, email, password_hash, full_name, phone_number, role, is_active)
         VALUES ($1, $2, $3, $4, $5, 'OWNER', true)
         RETURNING *`,
        [tenantId, input.email.toLowerCase(), passwordHash, input.ownerName, input.phoneNumber]
      );
      const userRow = userRes.rows[0];
      if (!userRow) {
        throw new Error('Gagal membuat akun pemilik.');
      }
      const userId = asUserId(userRow.id);

      const tokenPayload: TokenPayload = {
        tenantId,
        userId,
        role: 'OWNER',
        isSuperAdmin: false,
        email: userRow.email,
        businessName: tenantRow.business_name,
      };
      const sessionToken = issueSessionToken(tokenPayload);

      return {
        tenant: {
          id: tenantId,
          businessName: tenantRow.business_name,
          tenantType: tenantRow.tenant_type,
          regency: tenantRow.regency,
          kybStatus: tenantRow.kyb_status,
          rejectionReason: tenantRow.rejection_reason,
          verifiedAt: tenantRow.verified_at,
          verifiedBy: tenantRow.verified_by ? asUserId(tenantRow.verified_by) : null,
          createdAt: tenantRow.created_at,
          updatedAt: tenantRow.updated_at,
        },
        user: {
          id: userId,
          tenantId,
          email: userRow.email,
          fullName: userRow.full_name,
          phoneNumber: userRow.phone_number,
          role: userRow.role,
          isActive: userRow.is_active,
          createdAt: userRow.created_at,
        },
        sessionToken,
      };
    });
  }

  /**
   * Autentikasi kredensial pengguna dan penerbitan token sesi baru.
   */
  static async authenticateUser(email: string, plainPassword: string): Promise<{
    user: Omit<User, 'passwordHash'>;
    tenant: Tenant;
    sessionToken: string;
  }> {
    const res = await query<UserAuthRow>(
      `SELECT u.*, t.business_name, t.tenant_type, t.regency, t.kyb_status, t.rejection_reason, t.verified_at, t.verified_by, t.updated_at
       FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase()]
    );

    const row = res.rows[0];
    if (!row) {
      throw new Error('Kredensial tidak valid atau akun tidak aktif.');
    }

    const passwordMatch = await verifyPassword(plainPassword, row.password_hash);
    if (!passwordMatch) {
      throw new Error('Kredensial tidak valid.');
    }

    const tenantId = asTenantId(row.tenant_id);
    const userId = asUserId(row.id);
    const isSuperAdmin = row.role === 'SUPER_ADMIN';

    const tokenPayload: TokenPayload = {
      tenantId,
      userId,
      role: row.role,
      isSuperAdmin,
      email: row.email,
      businessName: row.business_name,
    };
    const sessionToken = issueSessionToken(tokenPayload);

    return {
      user: {
        id: userId,
        tenantId,
        email: row.email,
        fullName: row.full_name,
        phoneNumber: row.phone_number,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at,
      },
      tenant: {
        id: tenantId,
        businessName: row.business_name,
        tenantType: row.tenant_type,
        regency: row.regency,
        kybStatus: row.kyb_status,
        rejectionReason: row.rejection_reason,
        verifiedAt: row.verified_at,
        verifiedBy: row.verified_by ? asUserId(row.verified_by) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      sessionToken,
    };
  }

  /**
   * Menyimpan metadata dokumen legalitas KYB yang berhasil diunggah ke MinIO.
   */
  static async submitKybDocument(
    context: SecurityContext,
    input: KybDocumentUploadInput
  ): Promise<KybDocument> {
    return await withTenantContext(context, async (client) => {
      if (input.documentType === 'NIB') {
        const dupCheck = await client.query<{ id: string }>(
          `SELECT id FROM kyb_documents 
           WHERE document_type = 'NIB' AND document_number = $1 AND status = 'VERIFIED' AND tenant_id != $2`,
          [input.documentNumber, context.tenantId]
        );
        if (dupCheck.rows.length > 0) {
          throw new Error('Nomor NIB tersebut sudah terdaftar dan diverifikasi pada entitas usaha lain.');
        }
      }

      const res = await client.query<KybDocumentDbRow>(
        `INSERT INTO kyb_documents (tenant_id, document_type, document_number, file_storage_key, file_mime_type, file_size_bytes, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_VERIFICATION')
         RETURNING *`,
        [
          context.tenantId,
          input.documentType,
          input.documentNumber,
          input.fileStorageKey,
          input.fileMimeType,
          input.fileSizeBytes,
        ]
      );

      const row = res.rows[0];
      if (!row) {
        throw new Error('Gagal menyimpan dokumen legalitas.');
      }

      return {
        id: asKybDocumentId(row.id),
        tenantId: asTenantId(row.tenant_id),
        documentType: row.document_type,
        documentNumber: row.document_number,
        fileStorageKey: row.file_storage_key,
        fileMimeType: row.file_mime_type,
        fileSizeBytes: row.file_size_bytes,
        status: row.status,
        rejectionNote: row.rejection_note,
        uploadedAt: row.uploaded_at,
      };
    });
  }

  /**
   * Mengambil daftar dokumen KYB milik tenant yang terotentikasi.
   */
  static async getTenantKybDocuments(context: SecurityContext): Promise<KybDocument[]> {
    return await withTenantContext(context, async (client) => {
      const res = await client.query<KybDocumentDbRow>(
        'SELECT * FROM kyb_documents WHERE tenant_id = $1 ORDER BY uploaded_at DESC',
        [context.tenantId]
      );

      return res.rows.map((row) => ({
        id: asKybDocumentId(row.id),
        tenantId: asTenantId(row.tenant_id),
        documentType: row.document_type,
        documentNumber: row.document_number,
        fileStorageKey: row.file_storage_key,
        fileMimeType: row.file_mime_type,
        fileSizeBytes: row.file_size_bytes,
        status: row.status,
        rejectionNote: row.rejection_note,
        uploadedAt: row.uploaded_at,
      }));
    });
  }

  /**
   * Mengambil antrean pendaftaran tenant yang menunggu verifikasi KYB (Khusus SUPER_ADMIN).
   */
  static async getPendingKybQueue(
    context: SecurityContext,
    queryParams?: Partial<AuditKybPendingQuery>
  ): Promise<{
    items: Array<{
      tenantId: string;
      businessName: string;
      tenantType: 'HOREKA_BUYER' | 'GAPOKTAN_SUPPLIER';
      regency: 'SLEMAN' | 'BANTUL' | 'KULON_PROGO' | 'GUNUNGKIDUL' | 'KOTA_YOGYAKARTA';
      kybStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
      submittedAt: string;
      owner: {
        fullName: string;
        email: string;
        phoneNumber: string;
      };
      documentsCount: number;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  }> {
    if (!context.isSuperAdmin) {
      throw new Error('Akses ditolak: Memerlukan wewenang Super Admin.');
    }

    const status = queryParams?.status || 'PENDING_VERIFICATION';
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 25;
    const offset = (page - 1) * limit;

    const countRes = await query<CountRow>(
      'SELECT COUNT(*)::int as total FROM tenants WHERE kyb_status = $1',
      [status]
    );
    const totalItems = countRes.rows[0]?.total ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    const itemsRes = await query<PendingKybQueueRow>(
      `SELECT 
        t.id as tenant_id,
        t.business_name,
        t.tenant_type,
        t.regency,
        t.kyb_status,
        t.created_at as submitted_at,
        u.full_name as owner_name,
        u.email as owner_email,
        u.phone_number as owner_phone,
        COUNT(d.id)::int as documents_count
       FROM tenants t
       LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'OWNER'
       LEFT JOIN kyb_documents d ON d.tenant_id = t.id
       WHERE t.kyb_status = $1
       GROUP BY t.id, u.id
       ORDER BY t.created_at ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const items = itemsRes.rows.map((r) => ({
      tenantId: r.tenant_id,
      businessName: r.business_name,
      tenantType: r.tenant_type,
      regency: r.regency,
      kybStatus: r.kyb_status,
      submittedAt: new Date(r.submitted_at).toISOString(),
      owner: {
        fullName: r.owner_name || 'Tidak diketahui',
        email: r.owner_email || '',
        phoneNumber: r.owner_phone || '',
      },
      documentsCount: r.documents_count || 0,
    }));

    return {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
    };
  }

  /**
   * Mengeksekusi keputusan audit verifikasi KYB (APPROVED / REJECTED) berpelindung Redis mutex lock.
   */
  static async reviewKybSubmission(
    context: SecurityContext,
    input: AuditKybReviewInput
  ): Promise<{
    tenantId: string;
    kybStatus: 'VERIFIED' | 'REJECTED';
    verifiedAt: string;
  }> {
    if (!context.isSuperAdmin) {
      throw new Error('Akses ditolak: Memerlukan wewenang Super Admin.');
    }

    return await withLock(`audit:tenant:${input.tenantId}`, async () => {
      return await withTransaction(async (client) => {
        const tenantRes = await client.query<{ id: string; kyb_status: string }>(
          'SELECT id, kyb_status FROM tenants WHERE id = $1',
          [input.tenantId]
        );
        const tenantRow = tenantRes.rows[0];
        if (!tenantRow) {
          throw new Error('Entitas usaha (tenant) tidak ditemukan.');
        }

        const newStatus = input.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
        const now = new Date();

        if (input.decision === 'APPROVED') {
          await client.query(
            `UPDATE tenants
             SET kyb_status = 'VERIFIED',
                 verified_at = $2,
                 verified_by = $3,
                 rejection_reason = NULL,
                 updated_at = $2
             WHERE id = $1`,
            [input.tenantId, now, context.userId]
          );

          await client.query(
            `UPDATE kyb_documents
             SET status = 'VERIFIED'
             WHERE tenant_id = $1`,
            [input.tenantId]
          );
        } else {
          await client.query(
            `UPDATE tenants
             SET kyb_status = 'REJECTED',
                 rejection_reason = $2,
                 updated_at = $3
             WHERE id = $1`,
            [input.tenantId, input.rejectionReason, now]
          );

          await client.query(
            `UPDATE kyb_documents
             SET status = 'REJECTED',
                 rejection_note = $2
             WHERE tenant_id = $1`,
            [input.tenantId, input.rejectionReason]
          );
        }

        return {
          tenantId: input.tenantId,
          kybStatus: newStatus,
          verifiedAt: now.toISOString(),
        };
      });
    });
  }

  /**
   * Mengambil detail profil bisnis dan berkas legalitas untuk ditinjau oleh Admin.
   */
  static async getTenantKybDetailsForAdmin(
    context: SecurityContext,
    tenantId: string
  ): Promise<{
    tenantId: string;
    businessName: string;
    tenantType: string;
    regency: string;
    kybStatus: string;
    rejectionReason: string | null;
    owner: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    documents: Array<{
      documentId: string;
      documentType: string;
      documentNumber: string;
      status: string;
      fileStorageKey: string;
      fileMimeType: string;
      fileSizeBytes: number;
      rejectionNote: string | null;
      uploadedAt: string;
    }>;
  }> {
    if (!context.isSuperAdmin) {
      throw new Error('Akses ditolak: Memerlukan wewenang Super Admin.');
    }

    const tRes = await query<TenantDetailRow>(
      `SELECT t.*, u.full_name as owner_name, u.email as owner_email, u.phone_number as owner_phone
       FROM tenants t
       LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'OWNER'
       WHERE t.id = $1`,
      [tenantId]
    );

    const t = tRes.rows[0];
    if (!t) {
      throw new Error('Entitas usaha tidak ditemukan.');
    }

    const docsRes = await query<KybDocumentDbRow>(
      'SELECT * FROM kyb_documents WHERE tenant_id = $1 ORDER BY uploaded_at DESC',
      [tenantId]
    );

    return {
      tenantId: t.id,
      businessName: t.business_name,
      tenantType: t.tenant_type,
      regency: t.regency,
      kybStatus: t.kyb_status,
      rejectionReason: t.rejection_reason,
      owner: {
        fullName: t.owner_name || '',
        email: t.owner_email || '',
        phoneNumber: t.owner_phone || '',
      },
      documents: docsRes.rows.map((d) => ({
        documentId: d.id,
        documentType: d.document_type,
        documentNumber: d.document_number,
        status: d.status,
        fileStorageKey: d.file_storage_key,
        fileMimeType: d.file_mime_type,
        fileSizeBytes: d.file_size_bytes,
        rejectionNote: d.rejection_note,
        uploadedAt: new Date(d.uploaded_at).toISOString(),
      })),
    };
  }
}
