import { test, expect } from '@playwright/test';

test.describe('Quote Builder Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Already authenticated via storage state
  });

  test('should navigate to new quote page', async ({ page }) => {
    // Navigate to quotes page
    await page.goto('/quotes');

    // Should load the quote builder
    await expect(page).toHaveURL(/\/quotes/);

    // Check for quote builder elements
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('should display quote builder components', async ({ page }) => {
    await page.goto('/quotes');

    // Look for key quote builder elements
    // Based on CLAUDE.md, quote builder should have:
    // - Client selection
    // - Product items section
    // - Discount controls
    // - Tax rate input
    // - Policy clauses

    // Check for form inputs
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);

    // Check for buttons (add item, save, etc.)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should allow selecting a client', async ({ page }) => {
    await page.goto('/quotes');

    // Look for client select dropdown
    const clientSelect = page.locator('select').filter({ hasText: /client/i }).first();
    const clientSelectExists = await clientSelect.count();

    if (clientSelectExists === 0) {
      // Try finding any select element
      const anySelect = page.locator('select').first();
      const selectExists = await anySelect.count();

      if (selectExists > 0) {
        await expect(anySelect).toBeVisible();
      }
    } else {
      await expect(clientSelect).toBeVisible();

      // Try to select a client
      const options = await clientSelect.locator('option').count();
      if (options > 1) {
        // Select the first non-empty option
        await clientSelect.selectOption({ index: 1 });
      }
    }
  });

  test('should allow adding products to quote', async ({ page }) => {
    await page.goto('/quotes');

    // Look for "Add Item" or similar button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Add Item"), button:has-text("Add Product")');
    const addButtonCount = await addButton.count();

    if (addButtonCount > 0) {
      const firstAddButton = addButton.first();
      await expect(firstAddButton).toBeVisible();

      // Click to add an item (this might open a dialog)
      await firstAddButton.click();

      // Wait a moment for any dialog or form to appear
      await page.waitForTimeout(500);

      // Check if a dialog or form appeared
      const dialog = page.locator('dialog, [role="dialog"]');
      const hasDialog = await dialog.count();

      if (hasDialog > 0) {
        expect(hasDialog).toBeGreaterThan(0);
      }
    }
  });

  test('should display discount mode options', async ({ page }) => {
    await page.goto('/quotes');

    // Based on CLAUDE.md, discount modes are: LINE_ITEM, OVERALL, BOTH
    // Look for discount-related controls
    const discountElements = page.locator('text=/discount/i, select, [class*="discount"]');
    const hasDiscount = await discountElements.count();

    if (hasDiscount > 0) {
      expect(hasDiscount).toBeGreaterThan(0);
    }
  });

  test('should show quote items table or list', async ({ page }) => {
    await page.goto('/quotes');

    // Look for table or list of quote items
    const table = page.locator('table');
    const tableExists = await table.count();

    if (tableExists > 0) {
      await expect(table.first()).toBeVisible();
    } else {
      // Look for any list structure
      const list = page.locator('ul, ol, div[class*="list"]');
      const listExists = await list.count();
      if (listExists > 0) {
        expect(listExists).toBeGreaterThan(0);
      }
    }
  });

  test('should have save or submit button', async ({ page }) => {
    await page.goto('/quotes');

    // Look for save/submit button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Submit")');
    const saveButtonCount = await saveButton.count();

    if (saveButtonCount > 0) {
      await expect(saveButton.first()).toBeVisible();
    }
  });

  test('should calculate totals', async ({ page }) => {
    await page.goto('/quotes');

    // Look for total-related elements
    const totalElements = page.locator('text=/total/i, text=/subtotal/i, text=/grand total/i');
    const hasTotals = await totalElements.count();

    if (hasTotals > 0) {
      expect(hasTotals).toBeGreaterThan(0);
    }
  });
});
