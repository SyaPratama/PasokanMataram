import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    alias: {
      '@pasok/config': path.resolve(__dirname, './packages/config/src/index.ts'),
      '@pasok/domain': path.resolve(__dirname, './packages/domain/src/index.ts'),
      '@pasok/repository-contracts': path.resolve(__dirname, './packages/repository-contracts/src/index.ts'),
      '@pasok/security/edge': path.resolve(__dirname, './packages/security/src/edge.ts'),
      '@pasok/security/tokens': path.resolve(__dirname, './packages/security/src/tokens.ts'),
      '@pasok/security/passwords': path.resolve(__dirname, './packages/security/src/passwords.ts'),
      '@pasok/security': path.resolve(__dirname, './packages/security/src/index.ts'),
      '@pasok/database': path.resolve(__dirname, './packages/database/src/index.ts'),
      '@pasok/queue': path.resolve(__dirname, './packages/queue/src/index.ts'),
      '@pasok/auth-kyb-service': path.resolve(__dirname, './services/auth-kyb-service/src/index.ts'),
      '@pasok/queue-worker': path.resolve(__dirname, './services/queue-worker/src/index.ts'),
      '@': path.resolve(__dirname, './apps/web/src'),
    },
  },
});
