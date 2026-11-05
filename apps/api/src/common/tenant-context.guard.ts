/**
 * @file apps/api/src/common/tenant-context.guard.ts
 * @description Enforces tenant isolation by setting RLS context before queries.
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { withTenantContext } from '@pasok/database';
import type { UserSessionClaims } from '@pasok/security';
import type { SecurityContext } from '@pasok/domain';

@Injectable()
export class TenantContextGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserSessionClaims | undefined = request.securityContext;
    
    if (!user) return true; // AuthGuard already rejected

    // Attach tenant context wrapper to request for services to use
    request.tenantContext = async <T>(fn: (client: any) => Promise<T>): Promise<T> => {
      const securityContext: SecurityContext = {
        tenantId: user.tenantId,
        userId: user.userId,
        role: user.macroRole,
        isSuperAdmin: user.macroRole === 'SUPER_ADMIN',
      };
      return withTenantContext(securityContext, fn);
    };

    return true;
  }
}
