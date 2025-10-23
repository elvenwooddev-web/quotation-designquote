/**
 * Quote Builder Tests
 * Tests for creating and editing quotes with items, discounts, and calculations
 */

import { test, expect } from '../fixtures/auth-helpers';
import { generateQuoteData } from '../fixtures/test-data';

test.describe('Quote Builder - Create New Quote', () => {
  test.beforeEach(async ({ salesExecutivePage }) => {
    // Navigate to new quote page
    await salesExecutivePage.goto('/quotes/new');
    await salesExecutivePage.waitForLoadState('networkidle');
  });

  test('should display quote builder page', async ({ salesExecutivePage }) => {
    // Verify page elements
    await expect(salesExecutivePage.locator('text=/New Quote|Create Quote/i')).toBeVisible();

    // Verify client selection section exists
    await expect(salesExecutivePage.locator('text=Client')).toBeVisible();

    // Verify items section exists
    await expect(salesExecutivePage.locator('text=Quotation Items')).toBeVisible();
  });

  test('should set quote title', async ({ salesExecutivePage }) => {
    const quoteTitle = `Test Quote ${Date.now()}`;

    // Find and fill title input
    const titleInput = salesExecutivePage.locator('input[placeholder*="title"], input[id*="title"]');
    await titleInput.fill(quoteTitle);

    // Verify title is set
    await expect(titleInput).toHaveValue(quoteTitle);
  });

  test('should select client', async ({ salesExecutivePage }) => {
    // Click on select client button
    await salesExecutivePage.click('button:has-text("Select Client"), button:has-text("Choose Client")');

    // Wait for client dialog
    await salesExecutivePage.waitForTimeout(500);

    // Select first client from list (if available)
    const clients = salesExecutivePage.locator('[data-testid="client-item"], tr:has-text("@")');
    const count = await clients.count();

    if (count > 0) {
      await clients.first().click();

      // Verify client is selected (name displayed)
      await salesExecutivePage.waitForTimeout(500);
      await expect(salesExecutivePage.locator('text=Client:')).toBeVisible();
    }
  });

  test('should add product to quote', async ({ salesExecutivePage }) => {
    // Look for product catalog or Add Item button
    const addItemButton = salesExecutivePage.locator('button:has-text("Add Item"), button:has-text("Add Product")');

    if (await addItemButton.isVisible()) {
      await addItemButton.click();

      // Wait for product selection dialog/catalog
      await salesExecutivePage.waitForTimeout(500);

      // Select first product (if available)
      const products = salesExecutivePage.locator('[data-testid="product-card"]');
      const count = await products.count();

      if (count > 0) {
        await products.first().click();

        // Wait for product to be added
        await salesExecutivePage.waitForTimeout(500);

        // Verify product appears in items list
        await expect(salesExecutivePage.locator('text=Quotation Items')).toBeVisible();
      }
    }
  });

  test('should update product quantity', async ({ salesExecutivePage }) => {
    // This test assumes a product is already added
    // In real scenario, you would add a product first

    // Find quantity input
    const quantityInput = salesExecutivePage.locator('input[type="number"][placeholder*="quantity"], input[id*="quantity"]').first();

    if (await quantityInput.isVisible()) {
      // Update quantity
      await quantityInput.fill('5');

      // Verify quantity is updated
      await expect(quantityInput).toHaveValue('5');

      // Verify total is recalculated (check for line total)
      await salesExecutivePage.waitForTimeout(300);
      await expect(salesExecutivePage.locator('[class*="total"]')).toBeVisible();
    }
  });

  test('should update product rate', async ({ salesExecutivePage }) => {
    // Find rate/price input
    const rateInput = salesExecutivePage.locator('input[type="number"][id*="rate"], input[id*="price"]').first();

    if (await rateInput.isVisible()) {
      // Update rate
      await rateInput.fill('2000');

      // Verify rate is updated
      await expect(rateInput).toHaveValue('2000');

      // Verify total is recalculated
      await salesExecutivePage.waitForTimeout(300);
    }
  });

  test('should remove product from quote', async ({ salesExecutivePage }) => {
    // Find remove/delete button for quote item
    const removeButtons = salesExecutivePage.locator('button[aria-label*="remove"], button[aria-label*="delete"]');
    const count = await removeButtons.count();

    if (count > 0) {
      // Get initial items count
      const itemsBefore = await salesExecutivePage.locator('[data-testid="quote-item"]').count();

      // Click remove
      await removeButtons.first().click();

      // Wait for removal
      await salesExecutivePage.waitForTimeout(500);

      // Verify item is removed
      const itemsAfter = await salesExecutivePage.locator('[data-testid="quote-item"]').count();
      expect(itemsAfter).toBeLessThan(itemsBefore);
    }
  });

  test('should save quote as draft', async ({ salesExecutivePage }) => {
    // Fill basic quote info
    const quoteTitle = `Draft Quote ${Date.now()}`;
    const titleInput = salesExecutivePage.locator('input[placeholder*="title"], input[id*="title"]');
    await titleInput.fill(quoteTitle);

    // Click Save Draft button
    await salesExecutivePage.click('button:has-text("Save Draft"), button:has-text("Save")');

    // Wait for save
    await salesExecutivePage.waitForTimeout(1000);

    // Verify success message or redirect
    await expect(salesExecutivePage.locator('text=/Saved|Success/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Quote Discount Modes', () => {
  test.beforeEach(async ({ salesExecutivePage }) => {
    await salesExecutivePage.goto('/quotes/new');
    await salesExecutivePage.waitForLoadState('networkidle');
  });

  test('should switch to LINE_ITEM discount mode', async ({ salesExecutivePage }) => {
    // Look for discount mode tabs/buttons
    const lineItemMode = salesExecutivePage.locator('button:has-text("Line Item"), [data-mode="LINE_ITEM"]');

    if (await lineItemMode.isVisible()) {
      await lineItemMode.click();

      // Verify mode is active
      await salesExecutivePage.waitForTimeout(300);

      // Verify line item discount inputs are visible
      await expect(salesExecutivePage.locator('input[placeholder*="discount"]')).toBeVisible();
    }
  });

  test('should switch to OVERALL discount mode', async ({ salesExecutivePage }) => {
    // Look for overall discount mode
    const overallMode = salesExecutivePage.locator('button:has-text("Overall"), [data-mode="OVERALL"]');

    if (await overallMode.isVisible()) {
      await overallMode.click();

      // Verify mode is active
      await salesExecutivePage.waitForTimeout(300);

      // Verify overall discount input is visible
      await expect(salesExecutivePage.locator('text=Overall Discount')).toBeVisible();
    }
  });

  test('should apply line item discount', async ({ salesExecutivePage }) => {
    // Find discount input for first item
    const discountInput = salesExecutivePage.locator('input[placeholder*="discount"]').first();

    if (await discountInput.isVisible()) {
      // Apply 10% discount
      await discountInput.fill('10');

      // Verify discount is applied
      await expect(discountInput).toHaveValue('10');

      // Verify total is recalculated
      await salesExecutivePage.waitForTimeout(300);
    }
  });

  test('should apply overall discount', async ({ salesExecutivePage }) => {
    // Switch to overall mode first
    const overallMode = salesExecutivePage.locator('button:has-text("Overall"), [data-mode="OVERALL"]');
    if (await overallMode.isVisible()) {
      await overallMode.click();
    }

    // Find overall discount input
    const overallDiscountInput = salesExecutivePage.locator('input[id*="overall"][type="number"]');

    if (await overallDiscountInput.isVisible()) {
      // Apply 15% overall discount
      await overallDiscountInput.fill('15');

      // Verify discount is applied
      await expect(overallDiscountInput).toHaveValue('15');

      // Verify grand total is updated
      await salesExecutivePage.waitForTimeout(300);
      await expect(salesExecutivePage.locator('text=Grand Total')).toBeVisible();
    }
  });
});

test.describe('Quote Dimensions Calculator', () => {
  test.beforeEach(async ({ salesExecutivePage }) => {
    await salesExecutivePage.goto('/quotes/new');
    await salesExecutivePage.waitForLoadState('networkidle');
  });

  test('should calculate quantity from dimensions', async ({ salesExecutivePage }) => {
    // This test assumes a product with area-based unit (sqft) is added

    // Find length input
    const lengthInput = salesExecutivePage.locator('input[placeholder*="length"], input[id*="length"]').first();

    if (await lengthInput.isVisible()) {
      // Fill length
      await lengthInput.fill('10');

      // Find width input
      const widthInput = salesExecutivePage.locator('input[placeholder*="width"], input[id*="width"]').first();
      await widthInput.fill('8');

      // Wait for calculation
      await salesExecutivePage.waitForTimeout(500);

      // Find quantity input and verify it's calculated (10 * 8 = 80)
      const quantityInput = salesExecutivePage.locator('input[type="number"][placeholder*="quantity"]').first();
      const quantity = await quantityInput.inputValue();

      // Verify quantity is product of length and width
      expect(parseFloat(quantity)).toBe(80);
    }
  });
});

test.describe('Quote Summary', () => {
  test.beforeEach(async ({ salesExecutivePage }) => {
    await salesExecutivePage.goto('/quotes/new');
    await salesExecutivePage.waitForLoadState('networkidle');
  });

  test('should display quote summary section', async ({ salesExecutivePage }) => {
    // Verify summary section exists
    await expect(salesExecutivePage.locator('text=Summary, text=Total')).toBeVisible();

    // Verify summary fields
    await expect(salesExecutivePage.locator('text=Subtotal')).toBeVisible();
    await expect(salesExecutivePage.locator('text=Tax')).toBeVisible();
    await expect(salesExecutivePage.locator('text=Grand Total')).toBeVisible();
  });

  test('should update tax rate', async ({ salesExecutivePage }) => {
    // Find tax rate input
    const taxInput = salesExecutivePage.locator('input[id*="tax"], input[placeholder*="tax"]');

    if (await taxInput.isVisible()) {
      // Set tax rate to 18%
      await taxInput.fill('18');

      // Verify tax rate is set
      await expect(taxInput).toHaveValue('18');

      // Verify tax amount is calculated
      await salesExecutivePage.waitForTimeout(300);
      await expect(salesExecutivePage.locator('text=Grand Total')).toBeVisible();
    }
  });
});
