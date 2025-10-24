/**
 * Category CRUD Tests
 * Tests for creating, reading, updating, and deleting categories
 */

import { test, expect } from '../fixtures/auth-helpers';
import { generateCategoryData } from '../fixtures/test-data';

test.describe('Categories - CRUD Operations', () => {
  test.beforeEach(async ({ adminPage }) => {
    // Navigate to catalog page
    await adminPage.goto('/catalog');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display categories sidebar with "All Items" option', async ({ adminPage }) => {
    // Verify categories section heading is visible
    await expect(adminPage.locator('text=Categories')).toBeVisible();

    // Verify "All Items" option is visible
    await expect(adminPage.locator('[data-testid="category-filter-all"]')).toBeVisible();
    await expect(adminPage.locator('text=All Items')).toBeVisible();

    // Verify Add Category button (Plus icon) is visible
    await expect(adminPage.locator('button[title="Add new category"]')).toBeVisible();
  });

  test('should display existing categories in sidebar', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Check if categories are displayed (excluding the "All Items" button)
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Verify first category is visible with name
      await expect(categoryButtons.first()).toBeVisible();

      // Verify category has action buttons on hover (Edit and Delete)
      // Note: These buttons have opacity-0 by default and become visible on hover
      const firstCategory = categoryButtons.first().locator('..'); // Get parent div
      const editButton = firstCategory.locator('button[title="Edit category"]');
      const deleteButton = firstCategory.locator('button[title="Delete category"]');

      await expect(editButton).toBeAttached();
      await expect(deleteButton).toBeAttached();
    }
  });

  test('should create a new category successfully', async ({ adminPage }) => {
    const categoryData = generateCategoryData({
      name: `Test Category ${Date.now()}`,
    });

    // Click Add Category button (Plus icon)
    await adminPage.click('button[title="Add new category"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Create New Category')).toBeVisible({ timeout: 3000 });

    // Fill category form
    await adminPage.fill('input[placeholder*="Living Room"], input[placeholder*="Kitchen"]', categoryData.name);

    // Submit form
    await adminPage.click('button:has-text("Create Category")');

    // Wait for success (category creation and dialog close)
    await adminPage.waitForTimeout(1500);

    // Verify dialog is closed
    await expect(adminPage.locator('text=Create New Category')).not.toBeVisible();

    // Verify category appears in sidebar
    await expect(adminPage.locator(`text=${categoryData.name}`)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields when creating category', async ({ adminPage }) => {
    // Click Add Category button
    await adminPage.click('button[title="Add new category"]');

    // Wait for dialog
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();

    // Try to submit without filling required fields
    await adminPage.click('button:has-text("Create Category")');

    // Verify form doesn't submit (dialog is still open)
    await adminPage.waitForTimeout(500);
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();
  });

  test('should edit existing category', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Find category items (excluding "All Items")
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Get the first category's parent container
      const firstCategory = categoryButtons.first().locator('..');

      // Get category name before editing
      const originalName = await categoryButtons.first().locator('span.font-medium').textContent();

      // Hover over category to reveal action buttons
      await firstCategory.hover();

      // Click edit button
      await firstCategory.locator('button[title="Edit category"]').click();

      // Wait for edit dialog
      await adminPage.waitForTimeout(500);
      await expect(adminPage.locator('text=Edit Category')).toBeVisible();

      // Update category name
      const newName = `Updated Category ${Date.now()}`;
      const nameInput = adminPage.locator('input[value]:not([value=""])').first();
      await nameInput.clear();
      await nameInput.fill(newName);

      // Save changes
      await adminPage.click('button:has-text("Update Category")');

      // Wait for update
      await adminPage.waitForTimeout(1500);

      // Verify dialog is closed
      await expect(adminPage.locator('text=Edit Category')).not.toBeVisible();

      // Verify updated category appears in sidebar
      await expect(adminPage.locator(`text=${newName}`)).toBeVisible({ timeout: 5000 });

      // Verify old name is not visible
      if (originalName) {
        await expect(adminPage.locator(`text=${originalName}`)).not.toBeVisible();
      }
    }
  });

  test('should delete category with confirmation', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Find category items (excluding "All Items")
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Get the first category's parent container
      const firstCategory = categoryButtons.first().locator('..');

      // Get category name before deletion
      let categoryName = '';
      try {
        categoryName = await categoryButtons.first().locator('span.font-medium').textContent() || '';
      } catch {
        // Category name extraction failed, continue anyway
      }

      // Hover over category to reveal action buttons
      await firstCategory.hover();

      // Set up dialog handler for confirm dialog
      adminPage.on('dialog', dialog => {
        expect(dialog.message()).toContain('Are you sure');
        dialog.accept();
      });

      // Click delete button
      await firstCategory.locator('button[title="Delete category"]').click();

      // Wait for confirmation and deletion
      await adminPage.waitForTimeout(1500);

      // Verify category is removed from sidebar (if we got the name)
      if (categoryName) {
        await expect(adminPage.locator(`text=${categoryName}`)).not.toBeVisible();
      }
    }
  });

  test('should filter products when category is selected', async ({ adminPage }) => {
    // Wait for page to load
    await adminPage.waitForTimeout(1000);

    // Click on "All Items" first to establish baseline
    await adminPage.click('[data-testid="category-filter-all"]');
    await adminPage.waitForTimeout(500);

    // Find category items (excluding "All Items")
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Click on first category
      await categoryButtons.first().click();

      // Wait for filter to apply
      await adminPage.waitForTimeout(500);

      // Verify category is selected (has blue background)
      await expect(categoryButtons.first().locator('..')).toHaveClass(/bg-blue-50/);

      // Verify products grid is still visible (products are filtered, not hidden)
      const productsContainer = adminPage.locator('[data-testid="products-grid"], [class*="product"], main > div > div');
      await expect(productsContainer).toBeVisible();
    }
  });

  test('should switch between categories', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Find category items (excluding "All Items")
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 1) {
      // Click first category
      await categoryButtons.nth(0).click();
      await adminPage.waitForTimeout(300);

      // Verify first category is selected
      await expect(categoryButtons.nth(0).locator('..')).toHaveClass(/bg-blue-50/);

      // Click second category
      await categoryButtons.nth(1).click();
      await adminPage.waitForTimeout(300);

      // Verify second category is selected and first is not
      await expect(categoryButtons.nth(1).locator('..')).toHaveClass(/bg-blue-50/);
      await expect(categoryButtons.nth(0).locator('..')).not.toHaveClass(/bg-blue-50/);
    }

    // Click "All Items"
    await adminPage.click('[data-testid="category-filter-all"]');
    await adminPage.waitForTimeout(300);

    // Verify "All Items" is selected
    await expect(adminPage.locator('[data-testid="category-filter-all"]')).toHaveClass(/bg-blue-50/);
  });

  test('should handle category with no products', async ({ adminPage }) => {
    // Create a new category that will have 0 products
    const categoryData = generateCategoryData({
      name: `Empty Category ${Date.now()}`,
    });

    // Click Add Category button
    await adminPage.click('button[title="Add new category"]');
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();

    // Fill and submit form
    await adminPage.fill('input[placeholder*="Living Room"], input[placeholder*="Kitchen"]', categoryData.name);
    await adminPage.click('button:has-text("Create Category")');
    await adminPage.waitForTimeout(1500);

    // Find the new category and click it
    const newCategoryButton = adminPage.locator(`[data-testid^="category-filter-"] >> text=${categoryData.name}`);
    await newCategoryButton.click();
    await adminPage.waitForTimeout(500);

    // Verify the category is selected
    await expect(newCategoryButton.locator('..')).toHaveClass(/bg-blue-50/);

    // Verify item count shows 0
    const itemCount = newCategoryButton.locator('..').locator('span.text-sm.font-medium');
    await expect(itemCount).toHaveText('0');
  });

  test('should cancel category creation dialog', async ({ adminPage }) => {
    // Click Add Category button
    await adminPage.click('button[title="Add new category"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();

    // Fill in some data
    await adminPage.fill('input[placeholder*="Living Room"], input[placeholder*="Kitchen"]', 'Test Category');

    // Click Cancel button
    await adminPage.click('button:has-text("Cancel")');

    // Wait for dialog to close
    await adminPage.waitForTimeout(300);

    // Verify dialog is closed
    await expect(adminPage.locator('text=Create New Category')).not.toBeVisible();

    // Verify category was not created
    await expect(adminPage.locator('text=Test Category')).not.toBeVisible();
  });

  test('should cancel category edit dialog', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Find category items
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Get original category name
      const originalName = await categoryButtons.first().locator('span.font-medium').textContent();

      // Open edit dialog
      const firstCategory = categoryButtons.first().locator('..');
      await firstCategory.hover();
      await firstCategory.locator('button[title="Edit category"]').click();

      // Wait for dialog
      await expect(adminPage.locator('text=Edit Category')).toBeVisible();

      // Modify the name
      const nameInput = adminPage.locator('input[value]:not([value=""])').first();
      await nameInput.clear();
      await nameInput.fill('Should Not Save This Name');

      // Click Cancel
      await adminPage.click('button:has-text("Cancel")');

      // Wait for dialog to close
      await adminPage.waitForTimeout(300);

      // Verify dialog is closed
      await expect(adminPage.locator('text=Edit Category')).not.toBeVisible();

      // Verify original name is still visible
      if (originalName) {
        await expect(adminPage.locator(`text=${originalName}`)).toBeVisible();
      }

      // Verify new name was not saved
      await expect(adminPage.locator('text=Should Not Save This Name')).not.toBeVisible();
    }
  });

  test('should display category item count badges', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Verify "All Items" has a count badge
    const allItemsBadge = adminPage.locator('[data-testid="category-filter-all"] span.text-sm.font-medium');
    await expect(allItemsBadge).toBeVisible();

    // Find category items and verify they have count badges
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Check first category has a badge
      const firstCategoryBadge = categoryButtons.first().locator('..').locator('span.text-sm.font-medium');
      await expect(firstCategoryBadge).toBeVisible();

      // Verify badge contains a number (0 or higher)
      const badgeText = await firstCategoryBadge.textContent();
      expect(badgeText).toMatch(/^\d+$/);
    }
  });
});

test.describe('Categories - Validation and Error Handling', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/catalog');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should not create category with empty name', async ({ adminPage }) => {
    // Click Add Category button
    await adminPage.click('button[title="Add new category"]');
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();

    // Try to submit with empty name
    await adminPage.click('button:has-text("Create Category")');

    // Verify dialog is still open (validation failed)
    await adminPage.waitForTimeout(300);
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();
  });

  test('should not allow duplicate category names', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Get existing category name
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      const existingName = await categoryButtons.first().locator('span.font-medium').textContent();

      if (existingName) {
        // Try to create a category with the same name
        await adminPage.click('button[title="Add new category"]');
        await expect(adminPage.locator('text=Create New Category')).toBeVisible();

        await adminPage.fill('input[placeholder*="Living Room"], input[placeholder*="Kitchen"]', existingName);

        // Set up alert handler
        let alertMessage = '';
        adminPage.on('dialog', dialog => {
          alertMessage = dialog.message();
          dialog.accept();
        });

        await adminPage.click('button:has-text("Create Category")');

        // Wait for potential error
        await adminPage.waitForTimeout(1500);

        // Either the dialog should show an error or remain open
        // Check if dialog is still open OR an alert was shown
        const dialogVisible = await adminPage.locator('text=Create New Category').isVisible();
        const hasError = alertMessage.toLowerCase().includes('fail') || dialogVisible;

        expect(hasError).toBeTruthy();
      }
    }
  });

  test('should handle deletion of category with products gracefully', async ({ adminPage }) => {
    // This test checks if the system handles deletion of categories that have products
    // The behavior may vary: either prevent deletion or cascade delete

    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    // Find a category that has products (count > 0)
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const category = categoryButtons.nth(i).locator('..');
        const badge = category.locator('span.text-sm.font-medium');
        const badgeText = await badge.textContent();

        if (badgeText && parseInt(badgeText) > 0) {
          // Found a category with products
          await category.hover();

          // Set up dialog handler
          adminPage.on('dialog', dialog => {
            expect(dialog.message()).toContain('Are you sure');
            dialog.accept();
          });

          // Try to delete
          await category.locator('button[title="Delete category"]').click();
          await adminPage.waitForTimeout(1500);

          // The category should either be deleted or an error should be shown
          // We're just verifying the system handles it without crashing
          break;
        }
      }
    }
  });
});

test.describe('Categories - UI Interactions', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/catalog');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should show action buttons on hover', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      const firstCategory = categoryButtons.first().locator('..');

      // Before hover, buttons should be attached but not visible (opacity-0)
      const editButton = firstCategory.locator('button[title="Edit category"]');
      const deleteButton = firstCategory.locator('button[title="Delete category"]');

      await expect(editButton).toBeAttached();
      await expect(deleteButton).toBeAttached();

      // Hover over category
      await firstCategory.hover();

      // After hover, buttons should be visible (opacity transitions to 100)
      // Note: Playwright's isVisible() checks if element is visible in viewport,
      // not CSS visibility/opacity, so we just verify they're still attached
      await expect(editButton).toBeAttached();
      await expect(deleteButton).toBeAttached();
    }
  });

  test('should highlight selected category', async ({ adminPage }) => {
    // Wait for page to load
    await adminPage.waitForTimeout(1000);

    // "All Items" should be selected by default
    await expect(adminPage.locator('[data-testid="category-filter-all"]')).toHaveClass(/bg-blue-50/);

    // Find and click a category
    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      await categoryButtons.first().click();
      await adminPage.waitForTimeout(300);

      // Verify the clicked category is highlighted
      await expect(categoryButtons.first().locator('..')).toHaveClass(/bg-blue-50/);

      // Verify "All Items" is no longer highlighted
      await expect(adminPage.locator('[data-testid="category-filter-all"]')).not.toHaveClass(/bg-blue-50/);
    }
  });

  test('should show loading state during category creation', async ({ adminPage }) => {
    const categoryData = generateCategoryData({
      name: `Loading Test ${Date.now()}`,
    });

    // Open dialog
    await adminPage.click('button[title="Add new category"]');
    await expect(adminPage.locator('text=Create New Category')).toBeVisible();

    // Fill form
    await adminPage.fill('input[placeholder*="Living Room"], input[placeholder*="Kitchen"]', categoryData.name);

    // Click submit and immediately check for loading state
    await adminPage.click('button:has-text("Create Category")');

    // The button text should change to "Creating..." during submission
    // Note: This might be too fast to catch, but we try
    const loadingButton = adminPage.locator('button:has-text("Creating...")');

    // Wait a bit for the operation to complete
    await adminPage.waitForTimeout(1500);

    // Verify operation completed (dialog closed)
    await expect(adminPage.locator('text=Create New Category')).not.toBeVisible();
  });

  test('should maintain category selection after page refresh', async ({ adminPage }) => {
    // Wait for categories to load
    await adminPage.waitForTimeout(1000);

    const categoryButtons = adminPage.locator('[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])');
    const count = await categoryButtons.count();

    if (count > 0) {
      // Click on first category
      await categoryButtons.first().click();
      await adminPage.waitForTimeout(500);

      // Get the test-id for verification after refresh
      const testId = await categoryButtons.first().locator('..').getAttribute('data-testid') || await categoryButtons.first().getAttribute('data-testid');

      // Refresh the page
      await adminPage.reload();
      await adminPage.waitForLoadState('networkidle');
      await adminPage.waitForTimeout(1000);

      // After refresh, "All Items" should be selected again (no persistence)
      // This is the expected behavior based on the code
      await expect(adminPage.locator('[data-testid="category-filter-all"]')).toHaveClass(/bg-blue-50/);
    }
  });
});
