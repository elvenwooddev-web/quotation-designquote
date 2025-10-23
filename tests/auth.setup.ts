/**
 * Global Authentication Setup for Playwright Tests
 * This script runs once before all tests and saves authenticated state
 * to avoid logging in for every test.
 */

import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

/**
 * Test user credentials
 * Update these to match your test environment
 */
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@test.designquote.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@123456';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);

  // Submit login form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (successful login)
  await page.waitForURL('/', { timeout: 10000 });

  // Verify we're logged in by checking for dashboard content
  await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

  // Save signed-in state to 'playwright/.auth/user.json'
  await page.context().storageState({ path: authFile });

  console.log('✓ Authentication setup complete - session saved to', authFile);
});
