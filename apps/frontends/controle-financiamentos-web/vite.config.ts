/// <reference types="vitest/config" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/frontends/controle-financiamentos-web',
  server: {
    port: 5173,
    host: 'localhost',
  },
  preview: {
    port: 5173,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths()],
  build: {
    outDir: '../../../dist/apps/frontends/controle-financiamentos-web',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/apps/frontends/controle-financiamentos-web',
      provider: 'v8',
    },
  },
});
