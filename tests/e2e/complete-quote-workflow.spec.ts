/**
 * End-to-End Complete Quote Workflow Test
 * Tests the full lifecycle: Create product → Create client → Create quote → Approve → Generate PDF
 */

import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS } from '../fixtures/auth-helpers';
import { generateProductData, generateClientData } from '../fixtures/test-data';

test.describe('E2E: Complete Quote Workflow', () => {
  test('should complete full quote workflow from creation to PDF', async ({ page }) => {
    /* ========== STEP 1: Login as Sales Executive ========== */
    console.log('Step 1: Login as Sales Executive');
    await login(page, TEST_USERS.salesExecutive.email, TEST_USERS.salesExecutive.password);
    await expect(page).toHaveURL('/');

    /* ========== STEP 2: Create a Test Product ========== */
    console.log('Step 2: Create a test product');
    const productData = generateProductData({
      name: `E2E Test Product ${Date.now()}`,
      unit: 'sqft',
      baseRate: 2500,
    });

    // Navigate to catalog
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    // Create product
    await page.click('button:has-text("Add"), button:has-text("New Product")');
    await page.waitForTimeout(500);

    await page.fill('input[id="itemCode"]', productData.itemCode);
    await page.fill('input[id="name"]', productData.name);
    await page.fill('input[id="baseRate"]', productData.baseRate.toString());

    // Select first available category
    const categorySelect = page.locator('select[id="categoryId"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }

    // Save product
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Verify product created
    await expect(page.locator(`text=${productData.name}`)).toBeVisible({ timeout: 5000 });
    console.log('Product created successfully');

    /* ========== STEP 3: Create a Test Client ========== */
    console.log('Step 3: Create a test client');
    const clientData = generateClientData({
      name: `E2E Test Client ${Date.now()}`,
    });

    // Navigate to clients
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Create client
    await page.click('button:has-text("Add Client"), button:has-text("New Client")');
    await page.waitForTimeout(500);

    await page.fill('input[id="name"], input[placeholder*="Name"]', clientData.name);
    await page.fill('input[id="email"], input[type="email"]', clientData.email);
    await page.fill('input[id="phone"], input[type="tel"]', clientData.phone);

    // Save client
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);

    // Verify client created
    await expect(page.locator(`text=${clientData.name}`)).toBeVisible({ timeout: 5000 });
    console.log('Client created successfully');

    /* ========== STEP 4: Create a New Quote ========== */
    console.log('Step 4: Create a new quote');
    await page.goto('/quotes/new');
    await page.waitForLoadState('networkidle');

    // Set quote title
    const quoteTitle = `E2E Test Quote ${Date.now()}`;
    const titleInput = page.locator('input[placeholder*="title"], input[id*="title"]');
    await titleInput.fill(quoteTitle);

    // Select client
    await page.click('button:has-text("Select Client")');
    await page.waitForTimeout(500);

    // Find and select our created client
    const clientRow = page.locator(`text=${clientData.name}`);
    if (await clientRow.isVisible()) {
      await clientRow.click();
    }

    await page.waitForTimeout(500);

    // Add product to quote
    await page.click('button:has-text("Add Item"), button:has-text("Add Product")');
    await page.waitForTimeout(500);

    // Find and select our created product
    const productCard = page.locator(`text=${productData.name}`);
    if (await productCard.isVisible()) {
      await productCard.click();
    }

    await page.waitForTimeout(1000);

    // Update quantity
    const quantityInput = page.locator('input[type="number"][placeholder*="quantity"]').first();
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('10');
    }

    // Set tax rate
    const taxInput = page.locator('input[id*="tax"], input[placeholder*="tax"]');
    if (await taxInput.isVisible()) {
      await taxInput.fill('18');
    }

    await page.waitForTimeout(500);

    /* ========== STEP 5: Submit for Approval ========== */
    console.log('Step 5: Submit quote for approval');
    const submitButton = page.locator('button:has-text("Submit for Approval"), button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1500);
      console.log('Quote submitted for approval');
    } else {
      // Save as draft if no submit button
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(1500);
      console.log('Quote saved as draft');
    }

    /* ========== STEP 6: Logout and Login as Admin ========== */
    console.log('Step 6: Switch to Admin user');
    await logout(page);
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await expect(page).toHaveURL('/');

    /* ========== STEP 7: View Pending Approvals ========== */
    console.log('Step 7: View pending approvals');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify pending approvals section exists
    await expect(page.locator('text=Pending Approvals')).toBeVisible({ timeout: 5000 });

    // Find our quote in pending approvals
    const pendingQuotes = page.locator('tr:has-text("PENDING"), tr:has-text("Pending")');
    const count = await pendingQuotes.count();
    console.log(`Found ${count} pending approvals`);

    /* ========== STEP 8: Approve the Quote ========== */
    if (count > 0) {
      console.log('Step 8: Approve the quote');
      const quoteRow = pendingQuotes.first();

      // Get quote number for verification
      const quoteNumber = await quoteRow.locator('td').first().textContent();
      console.log(`Approving quote: ${quoteNumber}`);

      // Click approve
      await quoteRow.locator('button:has-text("Approve")').click();
      await page.waitForTimeout(500);

      // Confirm approval
      await page.click('button:has-text("Confirm"), button:has-text("Approve")');
      await page.waitForTimeout(1500);

      // Verify success
      await expect(page.locator('text=/Approved|Success/i')).toBeVisible({ timeout: 5000 });
      console.log('Quote approved successfully');

      /* ========== STEP 9: Generate PDF ========== */
      console.log('Step 9: Generate PDF');
      // Navigate to quotations list
      await page.goto('/quotations');
      await page.waitForLoadState('networkidle');

      if (quoteNumber) {
        // Find the approved quote
        const approvedQuote = page.locator(`tr:has-text('${quoteNumber}')`);

        // Verify status is SENT
        await expect(approvedQuote.locator('text=SENT')).toBeVisible({ timeout: 5000 });

        // Click PDF button
        const pdfButton = approvedQuote.locator('button[aria-label*="PDF"], button:has-text("PDF")');
        if (await pdfButton.isVisible()) {
          // Listen for download
          const downloadPromise = page.waitForEvent('download');

          await pdfButton.click();

          // Wait for download
          const download = await downloadPromise;
          console.log(`PDF downloaded: ${download.suggestedFilename()}`);

          // Verify download started
          expect(download.suggestedFilename()).toContain('.pdf');
          console.log('PDF generated successfully');
        }
      }

      /* ========== STEP 10: Verify Quote Details ========== */
      console.log('Step 10: Verify quote details');
      // Click on quote to view details
      if (quoteNumber) {
        await page.click(`tr:has-text('${quoteNumber}')`);
        await page.waitForTimeout(1000);

        // Verify quote details are displayed
        await expect(page.locator(`text=${quoteTitle}`)).toBeVisible();
        await expect(page.locator(`text=${clientData.name}`)).toBeVisible();
        await expect(page.locator(`text=${productData.name}`)).toBeVisible();

        console.log('Quote details verified successfully');
      }
    }

    console.log('E2E workflow completed successfully!');
  });

  test('should handle approval rejection workflow', async ({ page }) => {
    /* ========== Login as Sales Executive and create quote ========== */
    console.log('Step 1: Create quote as Sales Executive');
    await login(page, TEST_USERS.salesExecutive.email, TEST_USERS.salesExecutive.password);

    await page.goto('/quotes/new');
    await page.waitForLoadState('networkidle');

    const quoteTitle = `Rejection Test ${Date.now()}`;
    const titleInput = page.locator('input[placeholder*="title"]');
    await titleInput.fill(quoteTitle);

    // Submit for approval
    const submitButton = page.locator('button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1500);
    }

    /* ========== Login as Admin and reject ========== */
    console.log('Step 2: Reject as Admin');
    await logout(page);
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const pendingQuotes = page.locator('tr:has-text("PENDING")');
    const count = await pendingQuotes.count();

    if (count > 0) {
      const quoteRow = pendingQuotes.first();
      const quoteNumber = await quoteRow.locator('td').first().textContent();

      // Reject
      await quoteRow.locator('button:has-text("Reject")').click();
      await page.waitForTimeout(500);

      // Add notes
      const notesField = page.locator('textarea');
      if (await notesField.isVisible()) {
        await notesField.fill('Pricing needs revision - E2E test rejection');
      }

      // Confirm
      await page.click('button:has-text("Confirm"), button:has-text("Reject")');
      await page.waitForTimeout(1500);

      // Verify rejection
      await page.goto('/quotations');
      await page.waitForLoadState('networkidle');

      if (quoteNumber) {
        const rejectedQuote = page.locator(`tr:has-text('${quoteNumber}')`);
        await expect(rejectedQuote.locator('text=REJECTED')).toBeVisible({ timeout: 5000 });
        console.log('Rejection workflow completed successfully');
      }
    }
  });
});
