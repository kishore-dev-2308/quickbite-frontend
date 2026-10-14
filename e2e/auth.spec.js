import { test, expect } from '@playwright/test';

test.describe('Authentication Modal E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should open auth modal and login using 1-click demo customer', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: /sign in/i });
    await signInBtn.click();

    // Modal dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible();

    // Click Customer Demo Fill (autofills inputs)
    const demoCustBtn = page.getByText(/👤 customer/i);
    await demoCustBtn.click();

    // Verify form fields are populated
    await expect(page.getByLabel(/email address/i)).toHaveValue('customer@quickbite.com');
    await expect(page.getByLabel(/password/i)).toHaveValue('password123');

    // Click Sign In button inside modal dialog
    const submitBtn = page.getByRole('dialog').getByRole('button', { name: 'Sign In' });
    await submitBtn.click();

    // Success alert is visible
    await expect(page.getByText(/signed in successfully/i)).toBeVisible();

    // After success delay, modal closes and customer avatar initial appears in navbar
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('A', { exact: true })).toBeVisible();
  });
});
