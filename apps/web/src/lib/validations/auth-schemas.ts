/**
 * @file src/lib/validations/auth-schemas.ts
 * @description Skema validasi Zod untuk pendaftaran usaha, login, dan pengunggahan berkas KYB.
 * Mematuhi Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';
import { kybRulesConfig, diyRegenciesConfig } from '../../config';

export const RegisterBusinessSchema = z.object({
  businessName: z.string().min(kybRulesConfig.businessNameMinLength, 'Nama usaha minimal 3 karakter').max(kybRulesConfig.businessNameMaxLength),
  tenantType: z.enum(['HOREKA_BUYER', 'GAPOKTAN_SUPPLIER']),
  regency: z.enum(diyRegenciesConfig),
  ownerName: z.string().min(kybRulesConfig.contactPersonMinLength, 'Nama penanggung jawab minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phoneNumber: z.string().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/, 'Nomor WhatsApp tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

export type RegisterBusinessInput = z.infer<typeof RegisterBusinessSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const PresignedUrlRequestSchema = z.object({
  documentType: z.enum(['NIB', 'KTP', 'SURAT_KETERANGAN_TANI', 'NPWP']),
  fileName: z.string().min(3, 'Nama berkas tidak valid'),
  fileMimeType: z.enum(kybRulesConfig.allowedMimeTypes),
  fileSizeBytes: z.number().max(kybRulesConfig.maxFileSizeBytes, 'Ukuran berkas maksimal 5 MB'),
});

export type PresignedUrlRequestInput = z.infer<typeof PresignedUrlRequestSchema>;

export const KybDocumentUploadSchema = z.object({
  documentType: z.enum(['NIB', 'KTP', 'SURAT_KETERANGAN_TANI', 'NPWP']),
  documentNumber: z.string().min(8, 'Nomor dokumen minimal 8 digit'),
  fileStorageKey: z.string().min(10, 'Kunci penyimpanan tidak valid'),
  fileMimeType: z.enum(kybRulesConfig.allowedMimeTypes),
  fileSizeBytes: z.number().max(kybRulesConfig.maxFileSizeBytes, 'Ukuran berkas maksimal 5 MB'),
});

export type KybDocumentUploadInput = z.infer<typeof KybDocumentUploadSchema>;
