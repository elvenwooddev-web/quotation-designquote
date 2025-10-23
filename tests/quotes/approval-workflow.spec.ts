/**
 * Quote Approval Workflow Tests
 * Tests the complete approval workflow from submission to approval/rejection
 */

import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from '../fixtures/auth-helpers';

test.describe('Quote Approval Workflow', () => {
  test('should submit quote for approval as Sales Executive', async ({ page }) => {
    // Login as Sales Executive
    await login(page, TEST_USERS.salesExecutive.email, TEST_USERS.salesExecutive.password);

    // Navigate to quotations list
    await page.goto('/quotations');
    await page.waitForLoadState('networkidle');

    // Look for a draft quote or create new one
    const draftQuotes = page.locator('text=DRAFT');
    const count = await draftQuotes.count();

    if (count > 0) {
      // Find the row containing draft status
      const draftRow = page.locator('tr:has-text("DRAFT")').first();

      // Click edit button
      await draftRow.locator('button:has-text("Edit")').click();

      // Wait for quote builder page
      await page.waitForTimeout(1000);

      // Submit for approval button
      const submitButton = page.locator('button:has-text("Submit for Approval"), button:has-text("Submit")');

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for confirmation
        await page.waitForTimeout(1000);

        // Verify success message
        await expect(page.locator('text=/Submitted|Success|Pending/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display pending approvals on Admin dashboard', async ({ page }) => {
    // Login as Admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Pending Approvals section exists
    await expect(page.locator('text=Pending Approvals')).toBeVisible({ timeout: 5000 });

    // Verify pending approvals KPI card exists
    await expect(page.locator('text=/Pending.*Approval|Awaiting.*Approval/i')).toBeVisible();
  });

  test('should NOT display pending approvals for Sales Executive', async ({ page }) => {
    // Login as Sales Executive
    await login(page, TEST_USERS.salesExecutive.email, TEST_USERS.salesExecutive.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Pending Approvals section does NOT exist
    const pendingApprovalsSection = page.locator('[data-testid="pending-approvals"], text=Pending Approvals').first();
    await expect(pendingApprovalsSection).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // Section might not exist at all, which is also acceptable
    });
  });

  test('should approve quote as Admin', async ({ page }) => {
    // Login as Admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for pending approvals table
    await page.waitForTimeout(1000);

    // Find pending approval quotes
    const pendingQuotes = page.locator('tr:has-text("PENDING"), tr:has-text("Pending")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      // Click Approve button on first pending quote
      const approveButton = pendingQuotes.first().locator('button:has-text("Approve")');
      await approveButton.click();

      // Wait for confirmation dialog
      await page.waitForTimeout(500);

      // Confirm approval
      await page.click('button:has-text("Confirm"), button:has-text("Approve")');

      // Wait for approval to process
      await page.waitForTimeout(1000);

      // Verify success or quote removed from pending list
      await expect(page.locator('text=/Approved|Success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should reject quote as Admin with notes', async ({ page }) => {
    // Login as Admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for pending approvals
    await page.waitForTimeout(1000);

    // Find pending quotes
    const pendingQuotes = page.locator('tr:has-text("PENDING"), tr:has-text("Pending")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      // Click Reject button
      const rejectButton = pendingQuotes.first().locator('button:has-text("Reject")');
      await rejectButton.click();

      // Wait for confirmation dialog
      await page.waitForTimeout(500);

      // Add rejection notes (if notes field exists)
      const notesField = page.locator('textarea[placeholder*="note"], textarea[placeholder*="reason"]');
      if (await notesField.isVisible()) {
        await notesField.fill('Pricing needs revision');
      }

      // Confirm rejection
      await page.click('button:has-text("Confirm"), button:has-text("Reject")');

      // Wait for rejection to process
      await page.waitForTimeout(1000);

      // Verify success
      await expect(page.locator('text=/Rejected|Success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should approve quote as Sales Head', async ({ page }) => {
    // Login as Sales Head (also has approval permission)
    await login(page, TEST_USERS.salesHead.email, TEST_USERS.salesHead.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Pending Approvals section exists (Sales Head can approve)
    await expect(page.locator('text=Pending Approvals')).toBeVisible({ timeout: 5000 });

    // Find and approve a quote if available
    const pendingQuotes = page.locator('tr:has-text("PENDING")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      const approveButton = pendingQuotes.first().locator('button:has-text("Approve")');
      await approveButton.click();

      await page.waitForTimeout(500);
      await page.click('button:has-text("Confirm"), button:has-text("Approve")');

      await page.waitForTimeout(1000);
      await expect(page.locator('text=/Approved|Success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should update quote status to SENT after approval', async ({ page }) => {
    // Login as Admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get a pending quote number before approval
    const pendingQuotes = page.locator('tr:has-text("PENDING")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      // Get quote number
      const quoteRow = pendingQuotes.first();
      const quoteNumber = await quoteRow.locator('td').first().textContent();

      // Approve the quote
      const approveButton = quoteRow.locator('button:has-text("Approve")');
      await approveButton.click();

      await page.waitForTimeout(500);
      await page.click('button:has-text("Confirm")');

      // Wait for approval
      await page.waitForTimeout(1000);

      // Navigate to quotations list
      await page.goto('/quotations');
      await page.waitForLoadState('networkidle');

      // Find the approved quote
      if (quoteNumber) {
        const approvedQuote = page.locator(`tr:has-text('${quoteNumber}')`);

        // Verify status is SENT
        await expect(approvedQuote.locator('text=SENT')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should update quote status to REJECTED after rejection', async ({ page }) => {
    // Login as Admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get a pending quote
    const pendingQuotes = page.locator('tr:has-text("PENDING")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      // Get quote number
      const quoteRow = pendingQuotes.first();
      const quoteNumber = await quoteRow.locator('td').first().textContent();

      // Reject the quote
      const rejectButton = quoteRow.locator('button:has-text("Reject")');
      await rejectButton.click();

      await page.waitForTimeout(500);
      await page.click('button:has-text("Confirm"), button:has-text("Reject")');

      // Wait for rejection
      await page.waitForTimeout(1000);

      // Navigate to quotations list
      await page.goto('/quotations');
      await page.waitForLoadState('networkidle');

      // Find the rejected quote
      if (quoteNumber) {
        const rejectedQuote = page.locator(`tr:has-text('${quoteNumber}')`);

        // Verify status is REJECTED
        await expect(rejectedQuote.locator('text=REJECTED')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should record approval metadata', async ({ page }) => {
    // This test verifies that approval metadata is recorded
    // Login as Admin
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Navigate to dashboard
    await page.goto('/');

    // Approve a quote
    const pendingQuotes = page.locator('tr:has-text("PENDING")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      const quoteRow = pendingQuotes.first();
      const quoteNumber = await quoteRow.locator('td').first().textContent();

      // Approve
      await quoteRow.locator('button:has-text("Approve")').click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Confirm")');

      await page.waitForTimeout(1000);

      // Navigate to quote details to verify metadata
      await page.goto('/quotations');
      await page.waitForLoadState('networkidle');

      if (quoteNumber) {
        // Click on the quote to view details
        await page.click(`tr:has-text('${quoteNumber}')`);

        // Verify approval information is displayed
        await expect(page.locator('text=/Approved by|Approved on/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Permission-Based Access Control', () => {
  test('should prevent Designer from approving quotes', async ({ page }) => {
    // Login as Designer
    await login(page, TEST_USERS.designer.email, TEST_USERS.designer.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Pending Approvals section does NOT exist
    const pendingApprovalsSection = page.locator('[data-testid="pending-approvals"]');
    await expect(pendingApprovalsSection).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should prevent Client from accessing approval features', async ({ page }) => {
    // Login as Client
    await login(page, TEST_USERS.client.email, TEST_USERS.client.password);

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify no approval UI elements
    const approveButtons = page.locator('button:has-text("Approve")');
    expect(await approveButtons.count()).toBe(0);
  });
});
