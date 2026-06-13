import { Page, expect } from '@playwright/test';

const DEFAULT_EMAIL = 'admin@local.dev';
const DEFAULT_PASSWORD = 'changeme123';
const SETUP_EMAIL = 'e2e@example.com';
const SETUP_PASSWORD = 'password12345';

export async function loginWithDefaultUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/e-mail|email/i).fill(SETUP_EMAIL);
  await page.getByLabel(/^senha$/i).fill(SETUP_PASSWORD);
  await page.getByRole('button', { name: /entrar/i }).click();

  try {
    await page.waitForURL(/\/app\//, { timeout: 5000 });
    return;
  } catch {
    await page.goto('/login');
    await page.getByLabel(/e-mail|email/i).fill(DEFAULT_EMAIL);
    await page.getByLabel(/^senha$/i).fill(DEFAULT_PASSWORD);
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/\/app\//);
  }
}

export async function completeProfileSetup(page: Page): Promise<void> {
  if (!page.url().includes('/app/profile')) {
    return;
  }

  await page.getByLabel(/nome/i).fill('E2E User');
  await page.getByLabel(/e-mail|email/i).fill(SETUP_EMAIL);
  await page.getByLabel(/^senha$/i).fill(SETUP_PASSWORD);
  await page.getByRole('button', { name: /salvar/i }).click();
  await page.waitForURL(/\/app\/dashboard/, { timeout: 15000 });
}

export async function registerAndLogin(page: Page): Promise<void> {
  await loginWithDefaultUser(page);
  await completeProfileSetup(page);
}

export async function seedDemoFinancing(page: Page): Promise<void> {
  await page.goto('/app/dashboard');
  const seedButton = page.getByRole('button', { name: /demo|exemplo|seed/i });
  if (await seedButton.isVisible()) {
    await seedButton.click();
    await expect(page.getByText(/45\.000|45000/i)).toBeVisible({ timeout: 15000 });
  }
}

export { expect };
