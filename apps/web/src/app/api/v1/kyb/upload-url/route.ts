import { NextResponse } from 'next/server';
import { PresignedUrlRequestSchema } from '@/lib/validations/auth-schemas';
import { generatePresignedUploadUrl } from '@/lib/storage';
import { verifySessionToken } from '@/lib/auth';

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
    const parseResult = PresignedUrlRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parameter dokumen tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { uploadUrl, fileStorageKey, expiresInSeconds } = await generatePresignedUploadUrl(
      session.tenantId,
      parseResult.data.documentType,
      parseResult.data.fileName,
      parseResult.data.fileMimeType,
      parseResult.data.fileSizeBytes
    );

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        fileStorageKey,
        expiresInSeconds,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan URL upload dokumen.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
