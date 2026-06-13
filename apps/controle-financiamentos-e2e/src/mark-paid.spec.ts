import { test, expect } from '@playwright/test';
import { registerAndLogin, seedDemoFinancing } from './fixtures/auth.fixture';

test.describe('Installment payment flow', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedDemoFinancing(page);
  });

  test('mark installment paid updates KPIs', async ({ page }) => {
    await page.goto('/app/installments');
    const markPaidButton = page.getByRole('button', { name: /marcar paga|mark paid|pagar/i }).first();
    await markPaidButton.click();

    await page.goto('/app/dashboard');
    await expect(page.getByText(/pago|paid|parcelas pagas/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
