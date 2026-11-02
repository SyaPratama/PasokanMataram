/**
 * @file src/services/tenant-service.ts
 * @description Layanan domain untuk pendaftaran bisnis, autentikasi, dan kepatuhan hukum KYB.
 * Mematuhi Prinsip II, VI, dan VII Konstitusi PasokMataram v1.4.0 (3NF, RLS, Transaksional).
 */

import crypto from 'crypto';
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
      const [existingRows] = await client.query<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [input.email.toLowerCase()]
      );
      if (Array.isArray(existingRows) && existingRows.length > 0) {
        throw new Error('Alamat email sudah terdaftar dalam sistem.');
      }

      const tenantId = asTenantId(crypto.randomUUID());
      const userId = asUserId(crypto.randomUUID());
      const now = new Date();

      await client.query(
        `INSERT INTO tenants (id, business_name, tenant_type, regency, kyb_status)
         VALUES (?, ?, ?, ?, 'PENDING_VERIFICATION')`,
        [tenantId, input.businessName, input.tenantType, input.regency]
      );

      const passwordHash = await hashPassword(input.password);

      await client.query(
        `INSERT INTO users (id, tenant_id, email, password_hash, full_name, phone_number, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 'OWNER', true)`,
        [userId, tenantId, input.email.toLowerCase(), passwordHash, input.ownerName, input.phoneNumber]
      );

      const tokenPayload: TokenPayload = {
        tenantId,
        userId,
        role: 'OWNER',
        isSuperAdmin: false,
        email: input.email.toLowerCase(),
        businessName: input.businessName,
      };
      const sessionToken = issueSessionToken(tokenPayload);

      return {
        tenant: {
          id: tenantId,
          businessName: input.businessName,
          tenantType: input.tenantType,
          regency: input.regency,
          kybStatus: 'PENDING_VERIFICATION',
          rejectionReason: null,
          verifiedAt: null,
          verifiedBy: null,
          createdAt: now,
          updatedAt: now,
        },
        user: {
          id: userId,
          tenantId,
          email: input.email.toLowerCase(),
          fullName: input.ownerName,
          phoneNumber: input.phoneNumber,
          role: 'OWNER',
          isActive: true,
          createdAt: now,
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
       WHERE u.email = ? AND u.is_active = true`,
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
        const [dupRows] = await client.query<any[]>(
          `SELECT id FROM kyb_documents 
           WHERE document_type = 'NIB' AND document_number = ? AND status = 'VERIFIED' AND tenant_id != ?`,
          [input.documentNumber, context.tenantId]
        );
        if (Array.isArray(dupRows) && dupRows.length > 0) {
          throw new Error('Nomor NIB tersebut sudah terdaftar dan diverifikasi pada entitas usaha lain.');
        }
      }

      const docId = asKybDocumentId(crypto.randomUUID());
      const now = new Date();

      await client.query(
        `INSERT INTO kyb_documents (id, tenant_id, document_type, document_number, file_storage_key, file_mime_type, file_size_bytes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_VERIFICATION')`,
        [
          docId,
          context.tenantId,
          input.documentType,
          input.documentNumber,
          input.fileStorageKey,
          input.fileMimeType,
          input.fileSizeBytes,
        ]
      );

      return {
        id: docId,
        tenantId: asTenantId(context.tenantId),
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        fileStorageKey: input.fileStorageKey,
        fileMimeType: input.fileMimeType,
        fileSizeBytes: input.fileSizeBytes,
        status: 'PENDING_VERIFICATION',
        rejectionNote: null,
        uploadedAt: now,
      };
    });
  }

  /**
   * Mengambil daftar dokumen KYB milik tenant yang terotentikasi.
   */
  static async getTenantKybDocuments(context: SecurityContext): Promise<KybDocument[]> {
    return await withTenantContext(context, async (client) => {
      const [rows] = await client.query<any[]>(
        'SELECT * FROM kyb_documents WHERE tenant_id = ? ORDER BY uploaded_at DESC',
        [context.tenantId]
      );

      const docRows = Array.isArray(rows) ? (rows as KybDocumentDbRow[]) : [];
      return docRows.map((row) => ({
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
      'SELECT COUNT(*) as total FROM tenants WHERE kyb_status = ?',
      [status]
    );
    const totalItems = Number(countRes.rows[0]?.total ?? 0);
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
        COUNT(d.id) as documents_count
       FROM tenants t
       LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'OWNER'
       LEFT JOIN kyb_documents d ON d.tenant_id = t.id
       WHERE t.kyb_status = ?
       GROUP BY t.id, u.id
       ORDER BY t.created_at ASC
       LIMIT ? OFFSET ?`,
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
        const [tenantRows] = await client.query<any[]>(
          'SELECT id, kyb_status FROM tenants WHERE id = ?',
          [input.tenantId]
        );
        const rowsList = Array.isArray(tenantRows) ? tenantRows : [];
        const tenantRow = rowsList[0] as { id: string; kyb_status: string } | undefined;
        if (!tenantRow) {
          throw new Error('Entitas usaha (tenant) tidak ditemukan.');
        }

        const newStatus = input.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
        const now = new Date();

        if (input.decision === 'APPROVED') {
          await client.query(
            `UPDATE tenants
             SET kyb_status = 'VERIFIED',
                 verified_at = ?,
                 verified_by = ?,
                 rejection_reason = NULL,
                 updated_at = ?
             WHERE id = ?`,
            [now, context.userId, now, input.tenantId]
          );

          await client.query(
            `UPDATE kyb_documents
             SET status = 'VERIFIED'
             WHERE tenant_id = ?`,
            [input.tenantId]
          );
        } else {
          await client.query(
            `UPDATE tenants
             SET kyb_status = 'REJECTED',
                 rejection_reason = ?,
                 updated_at = ?
             WHERE id = ?`,
            [input.rejectionReason, now, input.tenantId]
          );

          await client.query(
            `UPDATE kyb_documents
             SET status = 'REJECTED',
                 rejection_note = ?
             WHERE tenant_id = ?`,
            [input.rejectionReason, input.tenantId]
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
       WHERE t.id = ?`,
      [tenantId]
    );

    const t = tRes.rows[0];
    if (!t) {
      throw new Error('Entitas usaha tidak ditemukan.');
    }

    const docsRes = await query<KybDocumentDbRow>(
      'SELECT * FROM kyb_documents WHERE tenant_id = ? ORDER BY uploaded_at DESC',
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
