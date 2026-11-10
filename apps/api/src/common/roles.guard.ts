/**
 * @file apps/api/src/common/roles.guard.ts
 * @description RBAC guard checking user role from SecurityContext against route requirements.
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { UserSessionClaims } from '@pasok/security';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const classRoles = this.reflector.get<string[]>(ROLES_KEY, context.getClass()) ?? [];
    const handlerRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) ?? [];
    if (classRoles.length === 0 && handlerRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserSessionClaims | undefined = request.securityContext;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (classRoles.length > 0 && !classRoles.includes(user.macroRole)) {
      throw new ForbiddenException(`Requires macro role: ${classRoles.join(', ')}`);
    }
    if (handlerRoles.length > 0 && !handlerRoles.some((role) => user.macroRole === role || user.microRole === role)) {
      throw new ForbiddenException(`Requires role: ${handlerRoles.join(', ')}`);
    }
    return true;
  }
}
