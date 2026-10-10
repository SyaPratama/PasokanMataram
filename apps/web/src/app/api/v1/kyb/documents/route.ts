import { NextResponse } from 'next/server';
import { KybDocumentUploadSchema } from '@/lib/validations/auth-schemas';
import { TenantService } from '@/services/tenant-service';
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
    const parseResult = KybDocumentUploadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Metadata dokumen tidak valid.',
            details: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const document = await TenantService.submitKybDocument(session, parseResult.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          documentId: document.id,
          documentType: document.documentType,
          status: document.status,
          uploadedAt: document.uploadedAt,
        },
        message: 'Dokumen berhasil diserahkan untuk verifikasi kepatuhan.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan dokumen legalitas.';
    const isConflict = message.includes('sudah terdaftar');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: isConflict ? 'NIB_ALREADY_VERIFIED' : 'SUBMIT_FAILED',
          message,
        },
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
