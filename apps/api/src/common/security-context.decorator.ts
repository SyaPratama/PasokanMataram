import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { SecurityContext } from '@pasok/domain';
import type { UserSessionClaims } from '@pasok/security';

interface AuthenticatedRequest {
  readonly securityContext?: UserSessionClaims;
}

/**
 * Extracts the verified SecurityContext attached by AuthGuard.
 * @param _data Decorator data, unused.
 * @param executionContext Nest execution context.
 * @returns Tenant and user identity from the verified JWT.
 * @throws UnauthorizedException when AuthGuard did not attach claims.
 */
export const SecurityContextParam = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext): SecurityContext => {
    const request = executionContext.switchToHttp().getRequest<AuthenticatedRequest>();
    const claims = request.securityContext;
    if (!claims) {
      throw new UnauthorizedException('Verified session is required.');
    }
    return {
      tenantId: claims.tenantId,
      userId: claims.userId,
      role: claims.microRole,
      isSuperAdmin: claims.isSuperAdmin,
    };
  },
);
