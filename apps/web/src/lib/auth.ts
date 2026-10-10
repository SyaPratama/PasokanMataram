/**
 * @file src/lib/auth.ts
 * @description Modul keamanan autentikasi kata sandi (Argon2id) dan pengelolaan token sesi JWT (SecurityContext).
 * Mematuhi Prinsip VI dan IX Konstitusi PasokMataram v1.5.0.
 */

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config';
import type { SecurityContext } from '../types/api';

export interface TokenPayload extends SecurityContext {
  readonly email: string;
  readonly businessName: string;
}

/**
 * Melakukan hashing kata sandi aman menggunakan algoritma Argon2id berbasis konfigurasi.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return await argon2.hash(plainText, {
    type: argon2.argon2id,
    memoryCost: authConfig.argon2MemoryCost,
    timeCost: authConfig.argon2TimeCost,
    parallelism: authConfig.argon2Parallelism,
  });
}

/**
 * Memverifikasi kecocokan kata sandi dengan hash tersimpan.
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainText);
  } catch {
    return false;
  }
}

/**
 * Menerbitkan token JWT bertanda tangan berisi klaim SecurityContext.
 */
export function issueSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: `${authConfig.sessionExpiryDays}d`,
    algorithm: 'HS256',
  });
}

/**
 * Memverifikasi dan mengekstrak klaim SecurityContext dari token JWT.
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret, { algorithms: ['HS256'] });
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Menghasilkan konfigurasi cookie sesi HttpOnly yang aman berbasis konfigurasi terpusat.
 */
export function getSessionCookieOptions() {
  return {
    name: authConfig.cookieName,
    httpOnly: authConfig.cookieHttpOnly,
    secure: authConfig.cookieSecure,
    sameSite: authConfig.cookieSameSite,
    domain: authConfig.cookieDomain !== 'localhost' ? authConfig.cookieDomain : undefined,
    path: '/',
    maxAge: authConfig.sessionExpiryDays * 24 * 60 * 60,
  };
}
