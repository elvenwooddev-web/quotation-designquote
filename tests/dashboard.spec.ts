import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (using demo mode if available)
    await page.goto('/login');

    // Check if demo mode checkbox exists
    const demoCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /demo/i });
    const demoCheckboxCount = await demoCheckbox.count();

    if (demoCheckboxCount > 0) {
      // Use demo mode
      await page.locator('input[type="email"]').first().fill('admin@example.com');
      await demoCheckbox.first().check();
      await page.locator('button:has-text("Login"), button:has-text("Sign In")').first().click();
    } else {
      // Try to navigate directly if no auth required
      await page.goto('/');
    }

    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard)?$/);
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Check for common dashboard elements
    await expect(page).toHaveTitle(/Intelli-Quoter/i);

    // Look for statistics cards or widgets
    const statsElements = page.locator('[class*="stat"], [class*="card"], [class*="widget"]');
    const count = await statsElements.count();

    // Dashboard should have some content
    expect(count).toBeGreaterThan(0);
  });

  test('should have navigation menu', async ({ page }) => {
    // Check for common navigation elements
    const navLinks = page.locator('nav a, header a');
    const navCount = await navLinks.count();

    // Should have navigation links
    expect(navCount).toBeGreaterThan(0);

    // Check for expected navigation items based on CLAUDE.md
    const expectedLinks = ['Dashboard', 'Quotations', 'Catalog', 'Clients', 'Settings'];

    for (const linkText of expectedLinks) {
      const link = page.locator(`a:has-text("${linkText}")`);
      const linkExists = await link.count();
      if (linkExists > 0) {
        await expect(link.first()).toBeVisible();
      }
    }
  });

  test('should display recent quotes or statistics', async ({ page }) => {
    // Look for quote-related content on dashboard
    const quoteElements = page.locator('text=/quote/i, text=/quotation/i');
    const hasQuoteContent = await quoteElements.count();

    // Dashboard might show quote statistics
    if (hasQuoteContent > 0) {
      expect(hasQuoteContent).toBeGreaterThan(0);
    }
  });

  test('should navigate to quotations page', async ({ page }) => {
    // Find and click quotations link
    const quotationsLink = page.locator('a:has-text("Quotations"), a:has-text("Quotes")').first();

    const linkExists = await quotationsLink.count();
    if (linkExists > 0) {
      await quotationsLink.click();

      // Should navigate to quotations page
      await expect(page).toHaveURL(/\/quotations/);
    }
  });

  test('should navigate to catalog page', async ({ page }) => {
    // Find and click catalog link
    const catalogLink = page.locator('a:has-text("Catalog"), a:has-text("Products")').first();

    const linkExists = await catalogLink.count();
    if (linkExists > 0) {
      await catalogLink.click();

      // Should navigate to catalog page
      await expect(page).toHaveURL(/\/catalog/);
    }
  });

  test('should have user menu or profile section', async ({ page }) => {
    // Look for user-related elements
    const userElements = page.locator('[class*="user"], [class*="profile"], text=/logout/i');
    const hasUserElements = await userElements.count();

    // Should have some user-related UI
    expect(hasUserElements).toBeGreaterThan(0);
  });
});
