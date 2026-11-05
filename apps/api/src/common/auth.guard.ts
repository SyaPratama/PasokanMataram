/**
 * @file apps/api/src/common/auth.guard.ts
 * @description Global JWT authentication guard. Validates Bearer tokens, attaches SecurityContext.
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifySessionToken } from '@pasok/security';
import type { UserSessionClaims } from '@pasok/security';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);
    const claims = verifySessionToken(token);
    if (!claims) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }

    request.securityContext = claims;
    return true;
  }
}
