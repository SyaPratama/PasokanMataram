/**
 * @file apps/web/src/app/api/v1/kyb/documents/validate/route.ts
 * Validasi magic bytes file upload untuk prevent MIME spoofing.
 * CRITICAL FIX: Pentest finding #2 - File upload RCE prevention.
 */

import { NextResponse } from 'next/server';
import { fileTypeFromBuffer } from 'file-type';
import { getStorageClient } from '@/lib/storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { verifySessionToken } from '@/lib/auth';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'] as const;

export async function POST(request: Request) {
  try {
    const sessionCookie = request.headers.get('cookie')
      ?.split('; ')
      .find((row) => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid.' } },
        { status: 401 }
      );
    }

    const session = verifySessionToken(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Sesi telah kedaluwarsa.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileStorageKey, declaredMimeType } = body;

    if (!fileStorageKey || typeof fileStorageKey !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'fileStorageKey wajib diisi.' } },
        { status: 400 }
      );
    }

    const cloudinary = getStorageClient();

    const imageUrl = cloudinary.url(fileStorageKey, {
      secure: true,
      sign_url: true,
      type: 'authenticated',
    });

    const response = await fetch(imageUrl, {
      headers: { Range: 'bytes=0-4095' }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: { code: 'STORAGE_ERROR', message: 'File tidak ditemukan.' } },
        { status: 404 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileTypeResult = await fileTypeFromBuffer(buffer);

    if (!fileTypeResult) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_FILE_TYPE', 
            message: 'File tidak memiliki magic bytes yang valid. File mungkin corrupt atau berbahaya.' 
          } 
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(fileTypeResult.mime as any)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'FORBIDDEN_FILE_TYPE', 
            message: `Tipe file ${fileTypeResult.mime} tidak diizinkan. Hanya PDF dan gambar (JPEG, PNG, WebP).`,
            detectedMime: fileTypeResult.mime,
            declaredMime: declaredMimeType,
          } 
        },
        { status: 400 }
      );
    }

    if (declaredMimeType && fileTypeResult.mime !== declaredMimeType) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MIME_MISMATCH', 
            message: 'MIME type file tidak sesuai dengan deklarasi. Possible malware or spoofing attempt.',
            detectedMime: fileTypeResult.mime,
            declaredMime: declaredMimeType,
          } 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        fileStorageKey,
        validatedMimeType: fileTypeResult.mime,
        extension: fileTypeResult.ext,
        isValid: true,
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memvalidasi file upload.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
