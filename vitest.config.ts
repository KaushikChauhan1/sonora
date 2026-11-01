import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts'],
    exclude: ['research/**', 'node_modules/**', 'dist/**'],
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
