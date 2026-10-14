import { test, expect } from '@playwright/test';

test.describe('Cart & Checkout Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add items to cart and show in drawer with calculations', async ({ page }) => {
    // Locate the first Add to Cart button
    const addButtons = page.getByRole('button', { name: /add to cart/i });
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();

    // Open cart drawer
    const cartBtn = page.getByLabel('open cart');
    await cartBtn.click();

    // Check cart drawer content
    await expect(page.getByText('Your Order Cart')).toBeVisible();
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText('Total Amount')).toBeVisible();
    await expect(page.getByRole('button', { name: /proceed to checkout/i })).toBeVisible();
  });

  test('should validate empty fields on checkout page', async ({ page }) => {
    // Add item first
    const addButtons = page.getByRole('button', { name: /add to cart/i });
    await addButtons.first().click();

    // Go to checkout
    await page.goto('/checkout');
    await expect(page.getByRole('heading', { name: /checkout & delivery/i })).toBeVisible();

    // Click confirm without filling details
    const confirmBtn = page.getByRole('button', { name: /confirm & place order/i });
    await confirmBtn.click();

    // Form errors should be visible
    await expect(page.getByText(/please enter your full recipient name/i)).toBeVisible();
    await expect(page.getByText(/please provide a valid contact phone number/i)).toBeVisible();
    await expect(page.getByText(/please provide your full delivery address/i)).toBeVisible();
  });
});
