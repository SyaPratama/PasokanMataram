import jwt from 'jsonwebtoken';
import { authConfig } from '@pasok/config';
import type { UserSessionClaims } from './edge';

export * from './edge';

/**
 * Menerbitkan token sesi JWT bertanda tangan digital.
 * @param claims Data profil dan wewenang pengguna.
 * @returns String JWT bertanda tangan digital.
 */
export function createSessionToken(claims: UserSessionClaims): string {
  return jwt.sign(claims, authConfig.jwtSecret, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

/**
 * Memverifikasi dan mendekode token sesi JWT di Node runtime.
 * @param token String token JWT.
 */
export function verifySessionToken(token: string): UserSessionClaims | null {
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret, {
      algorithms: ['HS256'],
    });
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'macroRole' in decoded) {
      return decoded as unknown as UserSessionClaims;
    }
    return null;
  } catch {
    return null;
  }
}
