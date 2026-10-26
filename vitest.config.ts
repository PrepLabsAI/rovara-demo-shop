import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
 environment: 'jsdom',
 coverage: { provider: 'v8', include: ['api/**/*.ts', 'web/**/*.ts', 'web/**/*.tsx'],
 exclude: ['api/server.ts','web/main.tsx'], thresholds: { lines: 75, functions: 75, statements: 75, branches: 70 } }
} });
