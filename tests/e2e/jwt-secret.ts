/**
 * @file tests/e2e/jwt-secret.ts
 * @description Resolves the JWT secret the running web server loaded, so browser tests can forge valid role sessions.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const WEB_DIR = path.resolve(__dirname, '../../apps/web');
const ENV_FILES = ['.env.production.local', '.env.local', '.env.production', '.env'] as const;
const FALLBACK_SECRET = 'rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars';

function readSecret(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const match = fs.readFileSync(filePath, 'utf-8').match(/^JWT_SECRET=(.+)$/m);
    const secret = match?.[1]?.trim();
    return secret && secret.length > 0 ? secret : null;
  } catch {
    return null;
  }
}

/**
 * Returns the secret used by the Next.js process, matching its env-file precedence.
 * @returns JWT HMAC secret.
 */
export function resolveServerJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  for (const envFile of ENV_FILES) {
    const secret = readSecret(path.join(WEB_DIR, envFile));
    if (secret) return secret;
  }
  return FALLBACK_SECRET;
}
