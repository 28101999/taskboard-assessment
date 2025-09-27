import { test, expect } from '@playwright/test';

test('user can create and toggle todo', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'demo@local.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  
  // Add todo
  await page.fill('input[placeholder="Add a new task"]', 'Playwright todo');
  await page.click('button:has-text("Add")');
  await expect(page.getByText('Playwright todo')).toBeVisible();

  // Toggle todo
  await page.click('text=Playwright todo');
  await expect(page.getByText('Playwright todo')).toHaveClass(/completed/);
});
