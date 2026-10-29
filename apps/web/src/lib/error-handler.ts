/**
 * @file apps/web/src/lib/error-handler.ts
 * Production error sanitizer untuk prevent information disclosure.
 * MEDIUM FIX: Pentest finding #10 - Error stack trace exposure.
 */

export interface SafeErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Sanitize error untuk production - hilangkan stack trace dan internal paths.
 */
export function sanitizeError(error: unknown): SafeErrorResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (error instanceof Error) {
    if (isProduction) {
      return {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan sistem. Silakan coba lagi atau hubungi administrator.',
      };
    }
    
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      details: {
        stack: error.stack,
        name: error.name,
      },
    };
  }
  
  if (isProduction) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Terjadi kesalahan tidak terduga.',
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
  };
}

/**
 * Create safe error response untuk API routes.
 */
export function createErrorResponse(error: unknown, status: number = 500) {
  return {
    success: false,
    error: sanitizeError(error),
  };
}
