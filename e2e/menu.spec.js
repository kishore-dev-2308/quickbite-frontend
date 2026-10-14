import { test, expect } from '@playwright/test';

test.describe('Menu Browsing & Filtering E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load menu page and display hero banner', async ({ page }) => {
    await expect(page).toHaveTitle(/QuickBite/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Live Kitchen & Courier Tracking')).toBeVisible();
  });

  test('should filter dishes by category chip', async ({ page }) => {
    // Click Burger category chip
    const burgerChip = page.getByRole('button', { name: /burgers/i });
    if (await burgerChip.isVisible()) {
      await burgerChip.click();
      // Should display burger items
      await expect(page.getByText('Truffle Mushroom Burger')).toBeVisible();
    }
  });

  test('should search dishes using the search bar', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search pizzas, truffle burgers/i);
    await searchInput.fill('Margherita');
    await page.getByRole('button', { name: /search/i }).click();

    await expect(page.getByText(/Margherita Artisanal Pizza/i)).toBeVisible();
  });

  test('should be mobile responsive and toggle mobile drawer on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const hamburgerBtn = page.getByLabel('open mobile drawer');
    await expect(hamburgerBtn).toBeVisible();

    await hamburgerBtn.click();
    await expect(page.getByRole('link', { name: 'Food Menu' })).toBeVisible();
  });
});
