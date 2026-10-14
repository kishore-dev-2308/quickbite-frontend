import { test, expect } from '@playwright/test';

test.describe('Complete Food Delivery End-to-End Workflow', () => {
  test('Complete Customer Order Placement & Real-Time Tracking Lifecycle', async ({ page }) => {
    // 1. Visit homepage and sign in as verified customer
    await page.goto('/');
    await expect(page).toHaveTitle(/QuickBite/i);

    const signInBtn = page.getByRole('button', { name: /sign in/i });
    await signInBtn.click();
    await page.getByText(/👤 customer/i).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 2. Add first item to cart
    const addButtons = page.getByRole('button', { name: /add to cart/i });
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();

    // 3. Open cart and proceed to checkout
    const cartBtn = page.getByLabel('open cart');
    await cartBtn.click();
    await expect(page.getByText('Your Order Cart')).toBeVisible();

    const checkoutBtn = page.getByRole('button', { name: /proceed to checkout/i });
    await checkoutBtn.click();

    // 4. On Checkout Page: fill delivery details
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole('heading', { name: /checkout & delivery/i })).toBeVisible();

    await page.getByLabel(/recipient full name/i).fill('Kishore Kumar');
    await page.getByLabel(/contact phone number/i).fill('+1 555-0199');
    await page.getByLabel(/complete delivery address/i).fill('42 Innovation Parkway, Tech Hub');

    // 5. Submit order
    const submitBtn = page.getByRole('button', { name: /confirm & place order/i });
    await submitBtn.click();

    // 6. Redirected to Live Order Tracking page (/orders/:id)
    await expect(page).toHaveURL(/\/orders\/[a-f0-9]{24}/);
    await expect(page.getByText(/order #/i)).toBeVisible();
    await expect(page.getByText('Kishore Kumar')).toBeVisible();
    await expect(page.getByText('42 Innovation Parkway, Tech Hub')).toBeVisible();

    // 7. Check Order Timeline initial state
    await expect(page.getByText('Live Order State')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order Received' })).toBeVisible();

    // 8. Verify order remains in "Order Received" (not automatically advancing)
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Order Received' })).toBeVisible();

    // 9. Kitchen staff manually updates status to "Preparing"
    const orderUrl = page.url();
    const orderIdMatch = orderUrl.match(/\/orders\/([a-f0-9]{24})/);
    expect(orderIdMatch).toBeTruthy();
    const orderId = orderIdMatch[1];

    const adminLoginRes = await page.request.post('http://localhost:5000/api/auth/login', {
      data: { email: 'admin@quickbite.com', password: 'admin123' },
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.data.token;

    await page.request.patch(`http://localhost:5000/api/orders/${orderId}/status`, {
      data: { status: 'Preparing' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    // 10. Status updates to Preparing in real-time on customer's screen via WebSocket
    await expect(page.getByRole('heading', { name: 'Preparing' }).first()).toBeVisible({ timeout: 10000 });
  });
});
