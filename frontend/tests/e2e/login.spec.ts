import { test, expect } from '@playwright/test';

test('user can login with demo credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'demo@local.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:3000/');
});
