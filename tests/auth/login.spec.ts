/**
 * Authentication Tests
 * Tests for login, logout, session persistence, and password visibility
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout, checkRememberMe } from '../fixtures/auth-helpers';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Verify email input is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Verify password input is visible
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verify submit button is visible
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify remember me checkbox is visible
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/');

    // Verify dashboard content is visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error with invalid email', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=/.*Login failed.*|.*Invalid credentials.*/i')).toBeVisible({ timeout: 5000 });

    // Verify we're still on login page
    await expect(page).toHaveURL('/login');
  });

  test('should show error with wrong password', async ({ page }) => {
    // Fill in credentials with wrong password
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', 'wrongpassword123');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=/.*Login failed.*|.*Invalid credentials.*/i')).toBeVisible({ timeout: 5000 });

    // Verify we're still on login page
    await expect(page).toHaveURL('/login');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Browser validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => {
      return !el.validity.valid;
    });
    expect(isEmailInvalid).toBe(true);
  });

  test('should toggle password visibility', async ({ page }) => {
    // Fill password
    await page.fill('input[type="password"]', 'testpassword');

    // Initially password should be hidden (type=password)
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Click eye icon to show password
    await page.click('button:has([class*="eye"])');

    // Now password should be visible (type=text)
    await page.waitForTimeout(500); // Wait for toggle
    const textInput = page.locator('input[type="text"]');
    await expect(textInput).toBeVisible();
  });

  test('should remember email when remember me is checked', async ({ page }) => {
    // Check remember me using label click to avoid interception
    await checkRememberMe(page);

    // Fill credentials
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/');

    // Logout
    await page.click('button:has-text("varun"), button:has-text("admin"), [data-testid="user-profile"]');
    await page.click('text=Logout');

    // Wait for login page
    await page.waitForURL('/login');

    // Verify email is remembered
    const emailValue = await page.locator('input[type="email"]').inputValue();
    expect(emailValue).toBe(TEST_USERS.admin.email);

    // Verify remember me is checked
    await expect(page.locator('input[type="checkbox"]#remember-me')).toBeChecked();
  });

  test('should show loading state during login', async ({ page }) => {
    // Fill credentials
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);

    // Click sign in and immediately check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify loading state (button disabled or loading text)
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Logout Flow', () => {
  test('should logout successfully', async ({ page }) => {
    // Login first
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Verify we're on dashboard
    await expect(page).toHaveURL('/');

    // Click user profile button to open dropdown
    await page.click('[data-testid="user-profile-button"]');

    // Wait for dropdown
    await page.waitForTimeout(300);

    // Click logout button
    await page.click('[data-testid="logout-button"]');

    // Wait for redirect to login
    await page.waitForURL('/login', { timeout: 10000 });

    // Verify we're on login page
    await expect(page).toHaveURL('/login');

    // Verify login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should clear session after logout', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Verify we're logged in
    await expect(page).toHaveURL('/');

    // Logout using helper function
    await logout(page);

    // Verify on login page
    await expect(page).toHaveURL('/login');

    // Try to access protected route directly
    await page.goto('/');

    // Should redirect back to login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Session Persistence', () => {
  test('should persist session on page reload', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Verify we're on dashboard
    await expect(page).toHaveURL('/');

    // Reload page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL('/');
  });

  test('should protect routes when not authenticated', async ({ page }) => {
    // Try to access protected routes directly
    const protectedRoutes = [
      '/',
      '/catalog',
      '/clients',
      '/quotations',
      '/quotes/new',
      '/settings',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // Should redirect to login
      await page.waitForURL('/login', { timeout: 10000 });
      await expect(page).toHaveURL('/login');
    }
  });

  test('should allow access to public routes when not authenticated', async ({ page }) => {
    // Login page should be accessible
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Forgot password should be accessible
    await page.goto('/forgot-password');
    await expect(page).toHaveURL('/forgot-password');
  });
});
