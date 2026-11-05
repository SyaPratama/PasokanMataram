/**
 * @file apps/api/src/common/csrf.middleware.ts
 * @description Double-submit cookie CSRF protection middleware.
 */

import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // For safe methods, seed XSRF-TOKEN cookie if missing
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (!req.cookies?.['XSRF-TOKEN']) {
        const token = generateCsrfToken();
        res.cookie('XSRF-TOKEN', token, {
          httpOnly: false,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });
      }
      return next();
    }
    // Skip for webhooks (external callbacks use HMAC signatures)
    if (req.path.startsWith('/api/v1/webhooks/')) {
      return next();
    }

    const cookieToken = req.cookies?.['XSRF-TOKEN'];
    const headerToken = req.headers['x-csrf-token'] as string;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    next();
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
