import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';
const apiURL = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm exec nx serve controle-financiamentos-api',
      url: `${apiURL}/health`,
      reuseExistingServer: !process.env.CI,
      cwd: '../../..',
      timeout: 120000,
    },
    {
      command: 'pnpm exec vite --host 127.0.0.1 --port 5173',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      cwd: '../frontends/controle-financiamentos-web',
      timeout: 120000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
