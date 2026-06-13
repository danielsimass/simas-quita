import { test, expect } from '@playwright/test';

test.describe('Mobile layout', () => {
  test.use({
    viewport: { width: 390, height: 844 },
  });

  test('shows bottom navigation on mobile', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('nav').filter({ hasText: /dashboard|parcelas|amortiza/i })).toBeVisible();
  });
});
