/**
 * Authentication Fixtures for Playwright Tests
 * Provides pre-authenticated browser contexts for different user roles
 */

import { test as base, Page } from '@playwright/test';

/**
 * Test user credentials for different roles
 *
 * IMPORTANT: Before running tests, create these users in your Supabase database
 * Use the SQL script at tests/setup-test-users.sql OR create them manually
 *
 * Alternative: Set TEST_PASSWORD environment variable for common password
 */
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@123456';

export const TEST_USERS = {
  admin: {
    email: 'admin@test.designquote.com',
    password: TEST_PASSWORD,
    role: 'Admin',
  },
  salesHead: {
    email: 'saleshead@test.designquote.com',
    password: TEST_PASSWORD,
    role: 'Sales Head',
  },
  salesExecutive: {
    email: 'executive@test.designquote.com',
    password: TEST_PASSWORD,
    role: 'Sales Executive',
  },
  designer: {
    email: 'designer@test.designquote.com',
    password: TEST_PASSWORD,
    role: 'Designer',
  },
  client: {
    email: 'client@test.designquote.com',
    password: TEST_PASSWORD,
    role: 'Client',
  },
};

/**
 * Helper function to perform login
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard after successful login
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Helper function to check remember me checkbox
 * Uses label click to avoid element interception issues
 */
export async function checkRememberMe(page: Page) {
  // Click the label instead of the checkbox to avoid interception
  await page.click('label[for="remember-me"]');
}

/**
 * Helper function to logout
 */
export async function logout(page: Page) {
  // Click on user profile button to open dropdown
  await page.click('[data-testid="user-profile-button"]');

  // Wait for dropdown to open
  await page.waitForTimeout(300);

  // Click logout button
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to login page
  await page.waitForURL('/login');
}

/**
 * Extended test fixture with authenticated contexts
 */
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  salesHeadPage: Page;
  salesExecutivePage: Page;
  designerPage: Page;
};

export const test = base.extend<AuthFixtures>({
  /**
   * Generic authenticated page (uses admin by default)
   */
  authenticatedPage: async ({ page }, use) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
  },

  /**
   * Admin authenticated page
   */
  adminPage: async ({ page }, use) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
  },

  /**
   * Sales Head authenticated page
   */
  salesHeadPage: async ({ page }, use) => {
    await login(page, TEST_USERS.salesHead.email, TEST_USERS.salesHead.password);
    await use(page);
  },

  /**
   * Sales Executive authenticated page
   */
  salesExecutivePage: async ({ page }, use) => {
    await login(page, TEST_USERS.salesExecutive.email, TEST_USERS.salesExecutive.password);
    await use(page);
  },

  /**
   * Designer authenticated page
   */
  designerPage: async ({ page }, use) => {
    await login(page, TEST_USERS.designer.email, TEST_USERS.designer.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
