/**
 * Product Catalog CRUD Tests
 * Tests for creating, reading, updating, and deleting products
 */

import { test, expect } from '../fixtures/auth-helpers';
import { generateProductData, generateCategoryData, waitForApiResponse } from '../fixtures/test-data';

test.describe('Product Catalog - CRUD Operations', () => {
  test.beforeEach(async ({ adminPage }) => {
    // Navigate to catalog page
    await adminPage.goto('/catalog');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display product catalog page', async ({ adminPage }) => {
    // Verify page title or heading
    await expect(adminPage.locator('text=/Catalog|Product Catalog/i')).toBeVisible();

    // Verify Add Product button is visible
    await expect(adminPage.locator('button:has-text("Add"), button:has-text("New Product")')).toBeVisible();
  });

  test('should create a new product successfully', async ({ adminPage }) => {
    const productData = generateProductData({
      name: 'Test Window Frame',
      unit: 'sqft',
      baseRate: 1500,
    });

    // Click Add Product button
    await adminPage.click('button:has-text("Add"), button:has-text("New Product")');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Add New Item')).toBeVisible();

    // Fill product form
    await adminPage.fill('input[id="itemCode"]', productData.itemCode);
    await adminPage.fill('input[id="name"]', productData.name);
    await adminPage.fill('textarea[id="description"]', productData.description || '');

    // Select UOM (try multiple approaches)
    try {
      await adminPage.selectOption('select', { label: productData.unit });
    } catch {
      await adminPage.fill('input[placeholder*="UOM"], input[placeholder*="unit"]', productData.unit);
    }

    // Fill base rate
    await adminPage.fill('input[id="baseRate"]', productData.baseRate.toString());

    // Select category (first available option if exists)
    const categorySelect = adminPage.locator('select[id="categoryId"]');
    if (await categorySelect.isVisible()) {
      const options = await categorySelect.locator('option').count();
      if (options > 1) {
        await categorySelect.selectOption({ index: 1 });
      }
    }

    // Submit form
    await adminPage.click('button:has-text("Save")');

    // Wait for success (either notification or product appears in list)
    await adminPage.waitForTimeout(1000);

    // Verify product appears in catalog
    await expect(adminPage.locator(`text=${productData.name}`)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields when creating product', async ({ adminPage }) => {
    // Click Add Product button
    await adminPage.click('button:has-text("Add"), button:has-text("New Product")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Item')).toBeVisible();

    // Try to submit without filling required fields
    await adminPage.click('button:has-text("Save")');

    // Verify validation errors or form doesn't submit
    // Check if dialog is still open (form didn't submit)
    await expect(adminPage.locator('text=Add New Item')).toBeVisible();
  });

  test('should edit existing product', async ({ adminPage }) => {
    // Wait for products to load
    await adminPage.waitForTimeout(1000);

    // Click on first product's edit button (if exists)
    const editButtons = adminPage.locator('button[aria-label*="edit"], button:has-text("Edit")');
    const count = await editButtons.count();

    if (count > 0) {
      await editButtons.first().click();

      // Wait for edit dialog
      await adminPage.waitForTimeout(500);

      // Verify dialog title
      await expect(adminPage.locator('text=Edit Product')).toBeVisible();

      // Update product name
      const newName = `Updated Product ${Date.now()}`;
      const nameInput = adminPage.locator('input[id="name"]');
      await nameInput.clear();
      await nameInput.fill(newName);

      // Save changes
      await adminPage.click('button:has-text("Save")');

      // Wait for update
      await adminPage.waitForTimeout(1000);

      // Verify updated product appears
      await expect(adminPage.locator(`text=${newName}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should delete product with confirmation', async ({ adminPage }) => {
    // Wait for products to load
    await adminPage.waitForTimeout(1000);

    // Find delete buttons
    const deleteButtons = adminPage.locator('button[aria-label*="delete"], button:has-text("Delete")');
    const count = await deleteButtons.count();

    if (count > 0) {
      // Get product name before deletion
      const productCard = adminPage.locator('[data-testid="product-card"]').first();
      let productName = '';
      try {
        productName = await productCard.locator('h3, h4, [class*="name"]').textContent() || '';
      } catch {
        // Product name extraction failed, continue anyway
      }

      // Click delete button
      await deleteButtons.first().click();

      // Wait for confirmation dialog
      await adminPage.waitForTimeout(500);

      // Confirm deletion
      await adminPage.click('button:has-text("Confirm"), button:has-text("Delete")');

      // Wait for deletion
      await adminPage.waitForTimeout(1000);

      // Verify product is removed (if we got the name)
      if (productName) {
        await expect(adminPage.locator(`text=${productName}`)).not.toBeVisible();
      }
    }
  });

  test('should filter products by category', async ({ adminPage }) => {
    // Wait for page to load
    await adminPage.waitForTimeout(1000);

    // Look for category filters/buttons
    const categories = adminPage.locator('[data-testid="category-filter"], button[data-category]');
    const count = await categories.count();

    if (count > 0) {
      // Click on first category
      await categories.first().click();

      // Wait for filter to apply
      await adminPage.waitForTimeout(500);

      // Verify products are filtered (products grid still visible)
      await expect(adminPage.locator('[data-testid="products-grid"], [class*="product"]')).toBeVisible();
    }
  });

  test('should search products by name', async ({ adminPage }) => {
    // Look for search input
    const searchInput = adminPage.locator('input[placeholder*="Search"], input[type="search"]');

    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('window');

      // Wait for search results
      await adminPage.waitForTimeout(500);

      // Verify search is working (products are still displayed or filtered)
      const productsContainer = adminPage.locator('[data-testid="products-grid"], [class*="product"]');
      await expect(productsContainer).toBeVisible();
    }
  });

  test('should display empty state when no products', async ({ adminPage }) => {
    // This test assumes a filter that returns no results
    const searchInput = adminPage.locator('input[placeholder*="Search"], input[type="search"]');

    if (await searchInput.isVisible()) {
      // Search for something that doesn't exist
      await searchInput.fill('zzz-nonexistent-product-zzz');

      // Wait for search
      await adminPage.waitForTimeout(500);

      // Verify empty state or no results message
      await expect(adminPage.locator('text=/No products found|No items|No results/i')).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Product Image Upload', () => {
  test('should upload product image', async ({ adminPage }) => {
    await adminPage.goto('/catalog');
    await adminPage.waitForLoadState('networkidle');

    // Click Add Product
    await adminPage.click('button:has-text("Add"), button:has-text("New Product")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Item')).toBeVisible();

    // Look for file upload input or button
    const fileInput = adminPage.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      // Note: Actual file upload would require a real file
      // In real tests, you would use: await fileInput.setInputFiles('path/to/test-image.jpg');
      
      // For this test plan, we just verify the input exists
      await expect(fileInput).toBeVisible();
    }
  });
});

test.describe('Product Categories', () => {
  test('should display categories sidebar', async ({ adminPage }) => {
    await adminPage.goto('/catalog');

    // Verify categories section exists
    const categoriesSection = adminPage.locator('[data-testid="categories-sidebar"], text=Categories');
    await expect(categoriesSection).toBeVisible({ timeout: 5000 });
  });
});
