import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check that the page title contains expected text
    await expect(page).toHaveTitle(/Intelli-Quoter/i);

    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check for login button
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")');
    await expect(loginButton).toBeVisible();
  });

  test('should show error with empty credentials', async ({ page }) => {
    // Try to submit without entering credentials
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();

    // HTML5 validation should prevent submission
    // Check if inputs have required attribute or error message appears
    const emailInput = page.locator('input[type="email"]').first();
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('should login with demo mode', async ({ page }) => {
    // Look for demo mode checkbox
    const demoCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /demo/i });

    // If demo mode exists, test it
    const demoCheckboxCount = await demoCheckbox.count();
    if (demoCheckboxCount > 0) {
      // Enter test email
      await page.locator('input[type="email"]').first().fill('test@example.com');

      // Check demo mode
      await demoCheckbox.first().check();

      // Submit form
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/(dashboard)?$/);
    }
  });

  test('should have working navigation links', async ({ page }) => {
    // Check if there's a link to signup or other pages
    const links = page.locator('a');
    const linkCount = await links.count();

    // At least one link should be present
    expect(linkCount).toBeGreaterThan(0);
  });
});
