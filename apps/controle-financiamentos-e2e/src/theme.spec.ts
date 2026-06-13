import { test, expect } from '@playwright/test';

test.describe('Theme persistence', () => {
  test('dark theme persists after reload', async ({ page }) => {
    await page.goto('/login');

    const themeToggle = page.getByRole('button', { name: /tema|theme|dark|claro|escuro/i });
    await themeToggle.click();

    await page.reload();

    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toMatch(/dark/);
  });
});
