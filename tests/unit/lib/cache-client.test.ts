import { afterAll, describe, expect, it, vi } from 'vitest';

const originalEnvironment = vi.hoisted(() => {
  const original = {
    REDIS_PATH: process.env.REDIS_PATH,
    REDIS_SOCKET: process.env.REDIS_SOCKET,
    REDIS_URL: process.env.REDIS_URL,
  };
  delete process.env.REDIS_PATH;
  delete process.env.REDIS_SOCKET;
  process.env.REDIS_URL = 'unix:///tmp/pasok-redis.sock';
  return original;
});

import { client } from '../../../packages/cache/src/index';

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe('cache client transport', () => {
  it('maps a unix Redis URL to a socket path', () => {
    expect(client.options?.socket).toMatchObject({ path: '/tmp/pasok-redis.sock' });
  });
});
