/**
 * @file src/config/auth.ts
 * @description Konfigurasi otentikasi JWT dan sesi cookie terproteksi.
 * Mematuhi Prinsip VI dan Prinsip IX Konstitusi PasokMataram v1.5.0.
 */

import { z } from 'zod';

const authConfigSchema = z.object({
  jwtSecret: z.string().min(32),
  sessionExpiryDays: z.number().int().positive().default(7),
  cookieName: z.string().default('pasok_session'),
  cookieDomain: z.string().default('localhost'),
  cookieSecure: z.boolean().default(false),
  cookieHttpOnly: z.boolean().default(true),
  cookieSameSite: z.enum(['lax', 'strict', 'none']).default('lax'),
  argon2TimeCost: z.number().int().positive().default(2),
  argon2MemoryCost: z.number().int().positive().default(19456),
  argon2Parallelism: z.number().int().positive().default(1),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

export const authConfig: AuthConfig = authConfigSchema.parse({
  jwtSecret: process.env.JWT_SECRET || 'rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars',
  sessionExpiryDays: process.env.SESSION_EXPIRY_DAYS ? Number(process.env.SESSION_EXPIRY_DAYS) : 7,
  cookieName: 'pasok_session',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  cookieHttpOnly: true,
  cookieSameSite: 'lax',
  argon2TimeCost: 2,
  argon2MemoryCost: 19456,
  argon2Parallelism: 1,
});
