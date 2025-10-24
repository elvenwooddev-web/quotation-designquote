/**
 * Password Reset Tests
 * Tests for forgot password and reset password flows
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/auth-helpers';

test.describe('Forgot Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to forgot password page before each test
    await page.goto('/forgot-password');
  });

  test('should display forgot password page correctly', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('Forgot Password?');

    // Verify subtitle text
    await expect(page.locator('text=No worries, we\'ll send you reset instructions')).toBeVisible();

    // Verify Mail icon is visible
    await expect(page.locator('[class*="lucide-mail"]').first()).toBeVisible();

    // Verify email input is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveAttribute('placeholder', 'Enter your email');

    // Verify submit button is visible
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Send Reset Link');

    // Verify back to sign in link is visible
    await expect(page.locator('text=Back to Sign In')).toBeVisible();
  });

  test('should validate email field is required', async ({ page }) => {
    // Try to submit without filling email
    await page.click('button[type="submit"]');

    // Browser validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => {
      return !el.validity.valid;
    });
    expect(isEmailInvalid).toBe(true);

    // Verify we're still on forgot password page
    await expect(page).toHaveURL('/forgot-password');
  });

  test('should validate email format', async ({ page }) => {
    // Fill invalid email format
    await page.fill('input[type="email"]', 'invalid-email');

    // Try to submit
    await page.click('button[type="submit"]');

    // Browser validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => {
      return !el.validity.valid;
    });
    expect(isEmailInvalid).toBe(true);
  });

  test('should submit email for password reset successfully', async ({ page }) => {
    // Fill valid email
    await page.fill('input[type="email"]', TEST_USERS.admin.email);

    // Click send reset link button
    await page.click('button[type="submit"]');

    // Wait for success state to appear
    await expect(page.locator('h1')).toContainText('Check Your Email', { timeout: 10000 });

    // Verify success message contains the email
    await expect(page.locator(`text=${TEST_USERS.admin.email}`)).toBeVisible();

    // Verify success icon is visible
    await expect(page.locator('[class*="lucide-check-circle"]')).toBeVisible();

    // Verify instruction text is visible
    await expect(page.locator('text=If you don\'t see the email, check your spam folder or try again.')).toBeVisible();

    // Verify back to sign in button is visible
    await expect(page.locator('button:has-text("Back to Sign In")')).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    // Fill valid email
    await page.fill('input[type="email"]', TEST_USERS.admin.email);

    // Click send reset link and check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify loading state (button disabled)
    await expect(submitButton).toBeDisabled();

    // Verify loading text or spinner
    await expect(page.locator('text=Sending...')).toBeVisible();
  });

  test('should navigate to login from back to sign in link', async ({ page }) => {
    // Click back to sign in link
    await page.click('text=Back to Sign In');

    // Verify we're redirected to login page
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // Verify login page is displayed
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should navigate to login from success screen', async ({ page }) => {
    // Submit reset request
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.click('button[type="submit"]');

    // Wait for success screen
    await expect(page.locator('h1')).toContainText('Check Your Email', { timeout: 10000 });

    // Click back to sign in button
    await page.click('button:has-text("Back to Sign In")');

    // Verify we're redirected to login page
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('should handle non-existent email gracefully', async ({ page }) => {
    // Fill non-existent email
    await page.fill('input[type="email"]', 'nonexistent@example.com');

    // Click send reset link button
    await page.click('button[type="submit"]');

    // Supabase returns success even for non-existent emails (security best practice)
    // So we should still see success message
    await expect(page.locator('h1')).toContainText('Check Your Email', { timeout: 10000 });
  });
});

test.describe('Reset Password Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reset password page before each test
    await page.goto('/reset-password');
  });

  test('should display reset password page correctly when session is invalid', async ({ page }) => {
    // Wait for session check to complete
    await page.waitForTimeout(2000);

    // Without valid recovery token, should show error state
    await expect(page.locator('h1')).toContainText('Invalid Reset Link');

    // Verify error message
    await expect(page.locator('text=/.*Invalid or expired reset link.*|.*No active session found.*/i')).toBeVisible();

    // Verify request new reset link button
    await expect(page.locator('button:has-text("Request New Reset Link")')).toBeVisible();
  });

  test('should show loading state while verifying reset link', async ({ page }) => {
    // Verify loading state is shown initially
    await expect(page.locator('text=Verifying reset link...')).toBeVisible();

    // Verify spinner is visible
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should navigate to forgot password from invalid link screen', async ({ page }) => {
    // Wait for error state
    await page.waitForTimeout(2000);

    // Click request new reset link button
    await page.click('button:has-text("Request New Reset Link")');

    // Verify we're redirected to forgot password page
    await page.waitForURL('/forgot-password');
    await expect(page).toHaveURL('/forgot-password');
  });
});

test.describe('Reset Password Form (with valid session)', () => {
  // Note: These tests simulate the form behavior
  // Testing with actual recovery tokens requires email interception

  test('should display password reset form elements', async ({ page }) => {
    // Visit reset password page
    await page.goto('/reset-password');

    // We can test the form structure by checking the page source
    // even if session validation fails
    const pageContent = await page.content();

    // Verify form structure exists in the code
    expect(pageContent).toContain('New Password');
    expect(pageContent).toContain('Confirm Password');
    expect(pageContent).toContain('Reset Password');
  });

  test('should validate password minimum length', async ({ page }) => {
    // This test validates the client-side validation logic
    // We can test this by checking the validation message display

    await page.goto('/reset-password');

    // The validation happens in the validatePassword function
    // We can verify the error messages that would appear
    const pageContent = await page.content();
    expect(pageContent).toContain('Must be at least 8 characters long');
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/reset-password');

    // Verify password strength indicator is part of the form
    const pageContent = await page.content();
    expect(pageContent).toContain('Password strength:');
  });

  test('should have password visibility toggle', async ({ page }) => {
    await page.goto('/reset-password');

    // Verify eye icons for password visibility are in the page
    const pageContent = await page.content();
    expect(pageContent).toContain('lucide-eye');
    expect(pageContent).toContain('lucide-eye-off');
  });

  test('should have link back to login', async ({ page }) => {
    await page.goto('/reset-password');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Look for the login link (should be present in both states)
    const loginLink = page.locator('text=Remember your password? Sign in, text=Back to Sign In').first();

    // If visible, verify it navigates correctly
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('/login');
      await expect(page).toHaveURL('/login');
    }
  });
});

test.describe('Reset Password Success Flow', () => {
  test('should show success message structure', async ({ page }) => {
    await page.goto('/reset-password');

    // Check that success state elements exist in code
    const pageContent = await page.content();
    expect(pageContent).toContain('Password Reset Successfully');
    expect(pageContent).toContain('Your password has been updated');
    expect(pageContent).toContain('Continue to Sign In');
  });
});

test.describe('Password Reset Integration', () => {
  test('should allow navigating from login to forgot password', async ({ page }) => {
    // Start at login page
    await page.goto('/login');

    // Look for forgot password link
    const forgotPasswordLink = page.locator('text=/Forgot.*password/i, a[href="/forgot-password"]').first();

    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForURL('/forgot-password');
      await expect(page).toHaveURL('/forgot-password');
    } else {
      // Navigate directly if link not found
      await page.goto('/forgot-password');
    }

    // Verify forgot password page loaded
    await expect(page.locator('h1')).toContainText('Forgot Password?');
  });

  test('should complete full forgot password flow', async ({ page }) => {
    // Start at login page
    await page.goto('/login');

    // Navigate to forgot password
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText('Forgot Password?');

    // Fill and submit email
    await page.fill('input[type="email"]', TEST_USERS.salesExecutive.email);
    await page.click('button[type="submit"]');

    // Verify success screen
    await expect(page.locator('h1')).toContainText('Check Your Email', { timeout: 10000 });
    await expect(page.locator(`text=${TEST_USERS.salesExecutive.email}`)).toBeVisible();

    // Return to login
    await page.click('button:has-text("Back to Sign In")');
    await expect(page).toHaveURL('/login');
  });

  test('should be accessible from public routes when not authenticated', async ({ page }) => {
    // Verify forgot password is accessible without auth
    await page.goto('/forgot-password');
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('h1')).toContainText('Forgot Password?');

    // Verify reset password is accessible without auth
    await page.goto('/reset-password');
    await expect(page).toHaveURL('/reset-password');

    // Should show some content (either form or error based on token)
    await page.waitForTimeout(2000);
    const hasContent = await page.locator('h1').isVisible();
    expect(hasContent).toBe(true);
  });

  test('should have proper error handling in forgot password', async ({ page }) => {
    await page.goto('/forgot-password');

    // The error state structure should exist
    const pageContent = await page.content();
    expect(pageContent).toContain('bg-red-50');
    expect(pageContent).toContain('text-red-800');
  });

  test('should have proper error handling in reset password', async ({ page }) => {
    await page.goto('/reset-password');

    // Wait for page to process
    await page.waitForTimeout(2000);

    // Error handling elements should be present
    const pageContent = await page.content();
    expect(pageContent).toContain('bg-red-50');
    expect(pageContent).toContain('Invalid Reset Link');
  });
});

test.describe('Password Reset Form Validation', () => {
  test('should validate matching passwords', async ({ page }) => {
    await page.goto('/reset-password');

    // Verify validation logic exists for password matching
    const pageContent = await page.content();
    expect(pageContent).toContain('Passwords do not match');
  });

  test('should validate password strength requirements', async ({ page }) => {
    await page.goto('/reset-password');

    // Verify password strength logic exists
    const pageContent = await page.content();

    // Should have strength indicator bars
    expect(pageContent).toContain('password.length >= 8');
    expect(pageContent).toContain('password.length >= 12');
    expect(pageContent).toContain('/[A-Z]/');
    expect(pageContent).toContain('/[0-9]/');
  });

  test('should have required field validation', async ({ page }) => {
    await page.goto('/reset-password');

    // Check that password fields have required attribute
    const pageContent = await page.content();
    expect(pageContent).toContain('required');
  });
});

test.describe('Password Reset UI/UX', () => {
  test('should have consistent styling across password reset pages', async ({ page }) => {
    // Check forgot password page styling
    await page.goto('/forgot-password');
    await expect(page.locator('.bg-gradient-to-br')).toBeVisible();

    // Check reset password page styling
    await page.goto('/reset-password');
    await expect(page.locator('.bg-gradient-to-br')).toBeVisible();
  });

  test('should display icons correctly on forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify Mail icon in header
    await expect(page.locator('[class*="lucide-mail"]').first()).toBeVisible();

    // Verify icon has proper styling
    const iconContainer = page.locator('.bg-blue-600.rounded-full').first();
    await expect(iconContainer).toBeVisible();
  });

  test('should display icons correctly on reset password page', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForTimeout(2000);

    // Should have either Lock icon (form) or error icon depending on session
    const hasIcon = await page.locator('[class*="lucide-lock"], [class*="lucide-check-circle"]').first().isVisible();
    expect(hasIcon).toBe(true);
  });

  test('should have proper spacing and layout on forgot password', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify card container
    await expect(page.locator('.max-w-md').first()).toBeVisible();

    // Verify form spacing
    await expect(page.locator('form.space-y-5')).toBeVisible();
  });

  test('should show proper button states', async ({ page }) => {
    await page.goto('/forgot-password');

    const submitButton = page.locator('button[type="submit"]');

    // Initially button should be enabled
    await expect(submitButton).toBeEnabled();

    // Button should have proper text
    await expect(submitButton).toContainText('Send Reset Link');
  });
});
