import { test, expect } from '@playwright/test';
import { completeProfileSetup, loginWithDefaultUser } from './fixtures/auth.fixture';

test.describe('Onboarding flow', () => {
  test('login, setup profile and dashboard loads', async ({ page }) => {
    await loginWithDefaultUser(page);
    await completeProfileSetup(page);

    const seedButton = page.getByRole('button', { name: /demo|exemplo|seed/i });
    if (await seedButton.isVisible()) {
      await seedButton.click();
    }

    await expect(page.getByText(/dashboard|financiado|parcelas/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
