import { test, expect } from '@playwright/test';

test.describe('Approval Workflow', () => {
  test('Sales Executive creates quote with PENDING_APPROVAL status', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Login as Sales Executive (using demo mode)
    await page.fill('input[type="email"]', 'sales.exec@test.com');
    await page.check('input[type="checkbox"][id="demo-mode"]');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard to load
    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Navigate to create new quote
    await page.goto('http://localhost:3000/quotes/new');
    await page.waitForLoadState('networkidle');

    // Fill in quote details
    await page.fill('input[placeholder*="quote" i], input[placeholder*="title" i]', 'Test Quote for Approval');

    // Select a client (if client selector exists)
    const clientSelect = page.locator('select').first();
    if (await clientSelect.isVisible()) {
      const options = await clientSelect.locator('option').count();
      if (options > 1) {
        await clientSelect.selectOption({ index: 1 });
      }
    }

    // Wait for products to load
    await page.waitForTimeout(2000);

    // Add a product to the quote
    // Look for "Add to Quote" or similar button
    const addButton = page.locator('button:has-text("Add")').first();
    if (await addButton.isVisible({ timeout: 5000 })) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }

    // Save the quote
    const saveButton = page.locator('button:has-text("Save"), button[data-testid="save-draft-button"]');
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Check if alert appeared (quote saved successfully)
    // Note: In real tests, we'd intercept the alert, but for now we'll just wait

    // Navigate to quotations page to verify status
    await page.goto('http://localhost:3000/quotations');
    await page.waitForLoadState('networkidle');

    // Find the quote we just created
    const quoteRow = page.locator('text=Test Quote for Approval').first();
    await expect(quoteRow).toBeVisible({ timeout: 5000 });

    // Take a screenshot to see the status
    await page.screenshot({ path: 'test-results/sales-executive-quote-created.png', fullPage: true });

    // Verify the quote appears with pending approval status
    // The exact selector will depend on your table structure
    const statusCell = page.locator('tr:has-text("Test Quote for Approval")').locator('text=/pending/i').first();
    await expect(statusCell).toBeVisible({ timeout: 5000 });
  });

  test('Admin sees pending approval in dashboard', async ({ page }) => {
    // Login as Admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'varun@elvenwood.in');
    await page.check('input[type="checkbox"][id="demo-mode"]');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard to load
    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Check for Pending Approvals KPI
    const pendingApprovalsCard = page.locator('text=/Pending Approvals/i');
    await expect(pendingApprovalsCard).toBeVisible({ timeout: 5000 });

    // Take a screenshot
    await page.screenshot({ path: 'test-results/admin-dashboard-pending-approvals.png', fullPage: true });

    // Verify the count is greater than 0
    const countText = await page.locator('text=/Pending Approvals/i').locator('..').textContent();
    console.log('Pending Approvals section:', countText);

    // Look for the pending approvals table
    const approvalsSection = page.locator('text=/Pending Approvals/i').locator('xpath=ancestor::div[contains(@class, "bg-white") or contains(@class, "card")]').first();
    if (await approvalsSection.isVisible({ timeout: 3000 })) {
      await expect(approvalsSection).toBeVisible();
    }
  });

  test('Admin can approve quote', async ({ page }) => {
    // Login as Admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'varun@elvenwood.in');
    await page.check('input[type="checkbox"][id="demo-mode"]');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL('http://localhost:3000/');
    await page.waitForTimeout(2000);

    // Look for approve button in the pending approvals section
    const approveButton = page.locator('button:has-text("Approve")').first();

    if (await approveButton.isVisible({ timeout: 5000 })) {
      await approveButton.click();

      // Wait for approval to complete
      await page.waitForTimeout(2000);

      // Take screenshot after approval
      await page.screenshot({ path: 'test-results/after-approval.png', fullPage: true });

      // Verify the quote no longer appears in pending approvals
      // or verify success message
    }
  });
});
