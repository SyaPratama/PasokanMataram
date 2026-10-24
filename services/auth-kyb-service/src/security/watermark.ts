/**
 * @file services/auth-kyb-service/src/security/watermark.ts
 * @description Dynamic watermarking and AES-256 symmetric encryption for KYB legal documents.
 * Complies with UU PDP No. 27/2022 Article 20 and Constitution Principle VIII.
 */

import crypto from 'crypto';
import { authConfig } from '@pasok/config';

export const DEFAULT_KYB_WATERMARK = 'HANYA UNTUK VERIFIKASI KYB PASOKMATARAM';

export interface EncryptedDocumentPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  algorithm: 'aes-256-gcm';
}

export interface WatermarkedDocumentResult {
  watermarkedBuffer: Buffer;
  watermarkNotice: string;
  signature: string;
  timestamp: string;
}

function resolveEncryptionKey(customKey?: string): Buffer {
  const secret = customKey || authConfig.jwtSecret || 'default-pasokmataram-kyb-aes256-key-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Menerapkan watermark kepemilikan dan integritas digital pada berkas dokumen KYB.
 * @param buffer Buffer mentah berkas dokumen yang diunggah.
 * @param notice Teks watermark legalitas (default: HANYA UNTUK VERIFIKASI KYB PASOKMATARAM).
 * @returns Buffer ber-watermark beserta tanda tangan kriptografi.
 */
export async function applyKybWatermark(
  buffer: Buffer,
  notice: string = DEFAULT_KYB_WATERMARK
): Promise<WatermarkedDocumentResult> {
  const timestamp = new Date().toISOString();
  const metadataNotice = `${notice} | ${timestamp}`;

  const hmac = crypto.createHmac('sha256', resolveEncryptionKey());
  hmac.update(buffer);
  hmac.update(metadataNotice);
  const signature = hmac.digest('hex');

  const metadataHeader = Buffer.from(
    `<!-- PASOKMATARAM_KYB_WATERMARK: ${metadataNotice} | SIG: ${signature} -->\n`,
    'utf-8'
  );

  const watermarkedBuffer = Buffer.concat([metadataHeader, buffer]);

  return {
    watermarkedBuffer,
    watermarkNotice: metadataNotice,
    signature,
    timestamp,
  };
}

/**
 * Mengenkripsi dokumen identitas KYB menggunakan cipher simetris AES-256-GCM.
 * @param buffer Data berkas mentah.
 * @param customKey Kunci rahasia opsional (menggunakan jwtSecret jika tidak diisi).
 * @returns Payload terenkripsi dengan ciphertext, iv, dan authTag.
 */
export function encryptDocument(
  buffer: Buffer,
  customKey?: string
): EncryptedDocumentPayload {
  const key = resolveEncryptionKey(customKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv,
    authTag,
    algorithm: 'aes-256-gcm',
  };
}

/**
 * Mendekripsi dokumen identitas KYB menggunakan cipher simetris AES-256-GCM.
 * @param payload Objek payload berisi ciphertext, iv, dan authTag.
 * @param customKey Kunci rahasia opsional.
 * @returns Buffer dokumen asli yang terdekripsi.
 */
export function decryptDocument(
  payload: { ciphertext: Buffer; iv: Buffer; authTag: Buffer },
  customKey?: string
): Buffer {
  const key = resolveEncryptionKey(customKey);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, payload.iv);
  decipher.setAuthTag(payload.authTag);

  return Buffer.concat([decipher.update(payload.ciphertext), decipher.final()]);
}
