import { describe, it, expect } from 'vitest';
import { PresignedUrlRequestSchema, KybDocumentUploadSchema } from '../../../apps/web/src/lib/validations/auth-schemas';

describe('Contract: KYB Upload API Schemas (T019 - kyb-api-contract.md)', () => {
  it('berhasil memvalidasi permintaan presigned upload URL dengan MIME PDF & batas ukuran', () => {
    const validRequest = {
      documentType: 'NIB',
      fileName: 'NIB_Kopi_Mataram.pdf',
      fileMimeType: 'application/pdf',
      fileSizeBytes: 1420580,
    };

    const result = PresignedUrlRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('menolak pengunggahan berkas yang melebihi batas 5 MB (> 5242880 bytes)', () => {
    const oversizedRequest = {
      documentType: 'NIB',
      fileName: 'NIB_Besar.pdf',
      fileMimeType: 'application/pdf',
      fileSizeBytes: 6000000, // 6 MB
    };

    const result = PresignedUrlRequestSchema.safeParse(oversizedRequest);
    expect(result.success).toBe(false);
  });

  it('berhasil memvalidasi metadata konfirmasi dokumen KYB (WebP & PDF)', () => {
    const validMetadata = {
      documentType: 'KTP',
      documentNumber: '3404012345670001',
      fileStorageKey: 'kyb/sample-tenant-id/KTP_12345.webp',
      fileMimeType: 'image/webp',
      fileSizeBytes: 820100,
    };

    const result = KybDocumentUploadSchema.safeParse(validMetadata);
    expect(result.success).toBe(true);
  });
});
