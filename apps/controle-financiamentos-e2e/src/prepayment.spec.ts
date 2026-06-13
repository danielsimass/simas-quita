import { test, expect } from '@playwright/test';
import { registerAndLogin, seedDemoFinancing } from './fixtures/auth.fixture';

test.describe('Prepayment with backward installment payment', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    await seedDemoFinancing(page);
  });

  test('shows discount when prepaying last installments', async ({ page }) => {
    await page.goto('/app/prepayments');

    await page.getByRole('button', { name: /nova|adicionar|new/i }).click();
    await page.getByLabel(/valor total|amount/i).first().fill('1900');
    await page.getByLabel(/quantidade|parcelas/i).fill('2');
    await page.getByLabel(/data|date/i).fill('2024-06-10');

    await page.getByRole('button', { name: /salvar|save|criar/i }).click();

    await expect(page.getByText(/desconto/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
