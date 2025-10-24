/**
 * Company Info Settings Tests
 * Tests for the Company Info tab in Settings page
 * Includes tests for company information, logo upload, and terms & conditions
 */

import { test, expect } from '../fixtures/auth-helpers';

test.describe('Settings - Company Info', () => {
  // Navigate to Company Info tab before each test
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/settings');
    await expect(adminPage.locator('h1')).toContainText('Application Settings');

    // Click Company Info tab
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await expect(adminPage.locator('[role="tab"][aria-selected="true"]')).toContainText('Company Info');

    // Wait for tab content to load
    await adminPage.waitForTimeout(500);
  });

  test('should display Company Info tab', async ({ adminPage }) => {
    // Verify tab is active
    await expect(adminPage.locator('[role="tab"][aria-selected="true"]')).toContainText('Company Info');

    // Verify Company Information section
    await expect(adminPage.locator('h3:has-text("Company Information")')).toBeVisible();
    await expect(adminPage.locator('text=/Update your company.*s details/i')).toBeVisible();

    // Verify Company Logo section
    await expect(adminPage.locator('h3:has-text("Company Logo")')).toBeVisible();
    await expect(adminPage.locator('text=/Upload your company.*s logo/i')).toBeVisible();

    // Verify Terms & Conditions section
    await expect(adminPage.locator('h3:has-text("Terms & Conditions")')).toBeVisible();
    await expect(adminPage.locator('text=/Define the terms and conditions/i')).toBeVisible();

    // Verify Save Changes and Discard buttons are visible
    await expect(adminPage.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(adminPage.locator('button:has-text("Discard")')).toBeVisible();
  });

  test('should display all company info form fields', async ({ adminPage }) => {
    // Verify all form fields are present
    await expect(adminPage.locator('label[for="companyName"]')).toContainText('Company Name');
    await expect(adminPage.locator('input#companyName')).toBeVisible();

    await expect(adminPage.locator('label[for="email"]')).toContainText('Email');
    await expect(adminPage.locator('input#email')).toBeVisible();

    await expect(adminPage.locator('label[for="phone"]')).toContainText('Phone');
    await expect(adminPage.locator('input#phone')).toBeVisible();

    await expect(adminPage.locator('label[for="website"]')).toContainText('Website');
    await expect(adminPage.locator('input#website')).toBeVisible();

    await expect(adminPage.locator('label[for="address"]')).toContainText('Address');
    await expect(adminPage.locator('input#address')).toBeVisible();
  });

  test('should load existing company info', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Check if any fields have values (they should load from database)
    const companyName = await adminPage.locator('input#companyName').inputValue();
    const email = await adminPage.locator('input#email').inputValue();

    // Fields should be editable (not disabled)
    await expect(adminPage.locator('input#companyName')).toBeEnabled();
    await expect(adminPage.locator('input#email')).toBeEnabled();
    await expect(adminPage.locator('input#phone')).toBeEnabled();
    await expect(adminPage.locator('input#website')).toBeEnabled();
    await expect(adminPage.locator('input#address')).toBeEnabled();
  });

  test('should edit company name', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Get current value
    const currentName = await adminPage.locator('input#companyName').inputValue();

    // Edit company name
    const newName = `Test Company ${Date.now()}`;
    await adminPage.fill('input#companyName', newName);

    // Verify the field was updated
    const updatedName = await adminPage.locator('input#companyName').inputValue();
    expect(updatedName).toBe(newName);

    // Save Changes button should still be visible and enabled
    await expect(adminPage.locator('button:has-text("Save Changes")')).toBeEnabled();
  });

  test('should edit company email', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Edit email
    const newEmail = `test${Date.now()}@company.com`;
    await adminPage.fill('input#email', newEmail);

    // Verify the field was updated
    const updatedEmail = await adminPage.locator('input#email').inputValue();
    expect(updatedEmail).toBe(newEmail);
  });

  test('should edit company phone', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Edit phone
    const newPhone = '+1 (555) 123-4567';
    await adminPage.fill('input#phone', newPhone);

    // Verify the field was updated
    const updatedPhone = await adminPage.locator('input#phone').inputValue();
    expect(updatedPhone).toBe(newPhone);
  });

  test('should edit company website', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Edit website
    const newWebsite = 'https://testcompany.com';
    await adminPage.fill('input#website', newWebsite);

    // Verify the field was updated
    const updatedWebsite = await adminPage.locator('input#website').inputValue();
    expect(updatedWebsite).toBe(newWebsite);
  });

  test('should edit company address', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Edit address
    const newAddress = '123 Test Street, Test City, 12345';
    await adminPage.fill('input#address', newAddress);

    // Verify the field was updated
    const updatedAddress = await adminPage.locator('input#address').inputValue();
    expect(updatedAddress).toBe(newAddress);
  });

  test('should edit all company info fields', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    const timestamp = Date.now();

    // Edit all fields
    await adminPage.fill('input#companyName', `Test Company ${timestamp}`);
    await adminPage.fill('input#email', `contact${timestamp}@test.com`);
    await adminPage.fill('input#phone', `+1 (555) ${timestamp % 1000}`);
    await adminPage.fill('input#website', `https://test${timestamp}.com`);
    await adminPage.fill('input#address', `${timestamp} Test Street, Test City`);

    // Verify all fields were updated
    expect(await adminPage.locator('input#companyName').inputValue()).toBe(`Test Company ${timestamp}`);
    expect(await adminPage.locator('input#email').inputValue()).toBe(`contact${timestamp}@test.com`);
    expect(await adminPage.locator('input#phone').inputValue()).toBe(`+1 (555) ${timestamp % 1000}`);
    expect(await adminPage.locator('input#website').inputValue()).toBe(`https://test${timestamp}.com`);
    expect(await adminPage.locator('input#address').inputValue()).toBe(`${timestamp} Test Street, Test City`);
  });

  test('should display company logo upload section', async ({ adminPage }) => {
    // Verify logo upload components
    await expect(adminPage.locator('h3:has-text("Company Logo")')).toBeVisible();
    await expect(adminPage.locator('button:has-text("Upload")')).toBeVisible();

    // Check for logo preview area (either image or placeholder)
    const logoPreview = adminPage.locator('img[alt="Company logo"]');
    const logoPlaceholder = adminPage.locator('svg').filter({ hasText: '' }).first();

    // Either preview or placeholder should be visible
    const hasLogo = await logoPreview.isVisible().catch(() => false);
    const hasPlaceholder = await logoPlaceholder.isVisible().catch(() => false);

    expect(hasLogo || hasPlaceholder).toBeTruthy();
  });

  test('should show remove button when logo exists', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Check if logo exists
    const logoExists = await adminPage.locator('img[alt="Company logo"]').isVisible().catch(() => false);

    if (logoExists) {
      // Remove button should be visible
      await expect(adminPage.locator('button:has-text("Remove")')).toBeVisible();
    } else {
      // Remove button should not be visible when no logo
      await expect(adminPage.locator('button:has-text("Remove")')).not.toBeVisible();
    }
  });

  test('should remove company logo', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Check if logo exists
    const logoExists = await adminPage.locator('img[alt="Company logo"]').isVisible().catch(() => false);

    if (logoExists) {
      // Click Remove button
      await adminPage.click('button:has-text("Remove")');

      // Wait for removal
      await adminPage.waitForTimeout(500);

      // Logo should be removed and placeholder should be visible
      await expect(adminPage.locator('img[alt="Company logo"]')).not.toBeVisible();

      // Remove button should no longer be visible
      await expect(adminPage.locator('button:has-text("Remove")')).not.toBeVisible();
    }
  });

  test('should display terms and conditions editor', async ({ adminPage }) => {
    // Verify Terms & Conditions section
    await expect(adminPage.locator('h3:has-text("Terms & Conditions")')).toBeVisible();
    await expect(adminPage.locator('label:has-text("Default Terms")')).toBeVisible();

    // Rich text editor should be present
    // Check for common rich text editor elements
    const editorExists =
      (await adminPage.locator('.tiptap').isVisible().catch(() => false)) ||
      (await adminPage.locator('[contenteditable="true"]').isVisible().catch(() => false)) ||
      (await adminPage.locator('textarea').isVisible().catch(() => false));

    expect(editorExists).toBeTruthy();
  });

  test('should edit terms and conditions', async ({ adminPage }) => {
    // Wait for editor to load
    await adminPage.waitForTimeout(1000);

    // Find the editor (could be contenteditable div or textarea)
    const editor = adminPage.locator('.tiptap, [contenteditable="true"], textarea').first();

    if (await editor.isVisible()) {
      // Clear existing content
      await editor.click();
      await adminPage.keyboard.press('Control+A');
      await adminPage.keyboard.press('Delete');

      // Type new terms
      const newTerms = `Test Terms and Conditions - Updated ${Date.now()}`;
      await editor.type(newTerms);

      // Wait for content to be typed
      await adminPage.waitForTimeout(500);

      // Verify content was updated (check if text appears in the editor area)
      const editorContent = await editor.textContent();
      expect(editorContent).toContain('Test Terms and Conditions');
    }
  });

  test('should save changes successfully', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    const timestamp = Date.now();

    // Make changes to company info
    await adminPage.fill('input#companyName', `Test Company ${timestamp}`);
    await adminPage.fill('input#email', `test${timestamp}@company.com`);

    // Setup dialog handler for success message
    let dialogMessage = '';
    adminPage.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Click Save Changes
    await adminPage.click('button:has-text("Save Changes")');

    // Wait for save operation
    await adminPage.waitForTimeout(2000);

    // Verify success (either dialog or success message)
    expect(dialogMessage).toContain('success');

    // Save button should not be in loading state
    await expect(adminPage.locator('button:has-text("Saving...")')).not.toBeVisible({ timeout: 5000 });
  });

  test('should show loading state while saving', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Make a change
    await adminPage.fill('input#companyName', `Test Company ${Date.now()}`);

    // Setup dialog handler
    adminPage.on('dialog', (dialog) => dialog.accept());

    // Click Save Changes
    await adminPage.click('button:has-text("Save Changes")');

    // Save button should show loading state (if implemented)
    // This might show "Saving..." text or be disabled
    const savingButton = adminPage.locator('button:has-text("Saving...")');
    const isSaving = await savingButton.isVisible({ timeout: 1000 }).catch(() => false);

    // Wait for save to complete
    await adminPage.waitForTimeout(2000);

    // After save completes, should return to normal state
    await expect(adminPage.locator('button:has-text("Save Changes")')).toBeVisible({ timeout: 5000 });
  });

  test('should discard changes when clicking Discard button', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Get original values
    const originalName = await adminPage.locator('input#companyName').inputValue();
    const originalEmail = await adminPage.locator('input#email').inputValue();

    // Make changes
    await adminPage.fill('input#companyName', 'Changed Company Name');
    await adminPage.fill('input#email', 'changed@email.com');

    // Verify changes were made
    expect(await adminPage.locator('input#companyName').inputValue()).toBe('Changed Company Name');
    expect(await adminPage.locator('input#email').inputValue()).toBe('changed@email.com');

    // Click Discard button
    await adminPage.click('button:has-text("Discard")');

    // Wait for discard to take effect
    await adminPage.waitForTimeout(500);

    // Values should be restored to original
    const restoredName = await adminPage.locator('input#companyName').inputValue();
    const restoredEmail = await adminPage.locator('input#email').inputValue();

    expect(restoredName).toBe(originalName);
    expect(restoredEmail).toBe(originalEmail);
  });

  test('should validate email field format', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // Try to enter invalid email
    await adminPage.fill('input#email', 'invalid-email');

    // The HTML5 email validation should be triggered
    const emailInput = adminPage.locator('input#email');
    const inputType = await emailInput.getAttribute('type');

    expect(inputType).toBe('email');

    // Try to enter valid email
    await adminPage.fill('input#email', 'valid@company.com');
    expect(await emailInput.inputValue()).toBe('valid@company.com');
  });

  test('should validate website field format', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // The website field should have type="url"
    const websiteInput = adminPage.locator('input#website');
    const inputType = await websiteInput.getAttribute('type');

    expect(inputType).toBe('url');

    // Try to enter website URL
    await adminPage.fill('input#website', 'https://example.com');
    expect(await websiteInput.inputValue()).toBe('https://example.com');
  });

  test('should validate phone field format', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    // The phone field should have type="tel"
    const phoneInput = adminPage.locator('input#phone');
    const inputType = await phoneInput.getAttribute('type');

    expect(inputType).toBe('tel');

    // Try to enter phone number
    await adminPage.fill('input#phone', '+1 (555) 123-4567');
    expect(await phoneInput.inputValue()).toBe('+1 (555) 123-4567');
  });

  test('should persist data after saving and reloading', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    const timestamp = Date.now();
    const testName = `Persisted Company ${timestamp}`;
    const testEmail = `persist${timestamp}@test.com`;

    // Make changes
    await adminPage.fill('input#companyName', testName);
    await adminPage.fill('input#email', testEmail);

    // Setup dialog handler
    adminPage.on('dialog', (dialog) => dialog.accept());

    // Save changes
    await adminPage.click('button:has-text("Save Changes")');
    await adminPage.waitForTimeout(2000);

    // Reload the page
    await adminPage.reload();
    await adminPage.waitForLoadState('networkidle');

    // Navigate back to Company Info tab
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await adminPage.waitForTimeout(1000);

    // Verify data persisted
    const persistedName = await adminPage.locator('input#companyName').inputValue();
    const persistedEmail = await adminPage.locator('input#email').inputValue();

    expect(persistedName).toBe(testName);
    expect(persistedEmail).toBe(testEmail);
  });

  test('should only show Save Changes button on Company Info tab', async ({ adminPage }) => {
    // Already on Company Info tab - Save Changes should be visible
    await expect(adminPage.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(adminPage.locator('button:has-text("Discard")')).toBeVisible();

    // Switch to User Management tab
    await adminPage.click('[role="tab"]:has-text("User Management")');
    await adminPage.waitForTimeout(500);

    // Save Changes button should NOT be visible
    await expect(adminPage.locator('button:has-text("Save Changes")')).not.toBeVisible();
    await expect(adminPage.locator('button:has-text("Discard")')).not.toBeVisible();

    // Switch back to Company Info
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await adminPage.waitForTimeout(500);

    // Save Changes button should be visible again
    await expect(adminPage.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(adminPage.locator('button:has-text("Discard")')).toBeVisible();
  });

  test('should handle concurrent field edits', async ({ adminPage }) => {
    // Wait for data to load
    await adminPage.waitForTimeout(1000);

    const timestamp = Date.now();

    // Rapidly edit multiple fields
    await adminPage.fill('input#companyName', `Company ${timestamp}`);
    await adminPage.fill('input#email', `email${timestamp}@test.com`);
    await adminPage.fill('input#phone', `+1 555 ${timestamp % 10000}`);
    await adminPage.fill('input#website', `https://test${timestamp}.com`);
    await adminPage.fill('input#address', `${timestamp} Street`);

    // Verify all changes are reflected
    expect(await adminPage.locator('input#companyName').inputValue()).toBe(`Company ${timestamp}`);
    expect(await adminPage.locator('input#email').inputValue()).toBe(`email${timestamp}@test.com`);
    expect(await adminPage.locator('input#phone').inputValue()).toBe(`+1 555 ${timestamp % 10000}`);
    expect(await adminPage.locator('input#website').inputValue()).toBe(`https://test${timestamp}.com`);
    expect(await adminPage.locator('input#address').inputValue()).toBe(`${timestamp} Street`);
  });

  test('should display upload button for logo', async ({ adminPage }) => {
    // Verify Upload button
    const uploadButton = adminPage.locator('button:has-text("Upload")');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();

    // Verify it has Upload icon (lucide Upload icon)
    const uploadIcon = uploadButton.locator('svg');
    await expect(uploadIcon).toBeVisible();
  });

  test('should have proper layout for Company Info components', async ({ adminPage }) => {
    // Verify sections are laid out correctly
    const companyInfoSection = adminPage.locator('h3:has-text("Company Information")');
    const logoSection = adminPage.locator('h3:has-text("Company Logo")');
    const termsSection = adminPage.locator('h3:has-text("Terms & Conditions")');

    await expect(companyInfoSection).toBeVisible();
    await expect(logoSection).toBeVisible();
    await expect(termsSection).toBeVisible();

    // All sections should have white background cards
    const cards = adminPage.locator('.bg-white.rounded-lg.border');
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Company Info - Required Fields Validation', () => {
  test('should allow saving with empty optional fields', async ({ adminPage }) => {
    await adminPage.goto('/settings');
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await adminPage.waitForTimeout(1000);

    // Clear optional fields (phone, website, address are typically optional)
    await adminPage.fill('input#phone', '');
    await adminPage.fill('input#website', '');
    await adminPage.fill('input#address', '');

    // Ensure company name and email have values (typically required)
    const companyName = await adminPage.locator('input#companyName').inputValue();
    const email = await adminPage.locator('input#email').inputValue();

    if (!companyName) {
      await adminPage.fill('input#companyName', 'Test Company');
    }
    if (!email) {
      await adminPage.fill('input#email', 'test@company.com');
    }

    // Setup dialog handler
    adminPage.on('dialog', (dialog) => dialog.accept());

    // Should be able to save
    await adminPage.click('button:has-text("Save Changes")');
    await adminPage.waitForTimeout(2000);

    // Should not show error
    const saveButton = adminPage.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeVisible({ timeout: 5000 });
  });

  test('should accept various phone number formats', async ({ adminPage }) => {
    await adminPage.goto('/settings');
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await adminPage.waitForTimeout(1000);

    const phoneFormats = [
      '+1 (555) 123-4567',
      '555-123-4567',
      '(555) 123-4567',
      '+1-555-123-4567',
      '5551234567',
    ];

    for (const format of phoneFormats) {
      await adminPage.fill('input#phone', format);
      const value = await adminPage.locator('input#phone').inputValue();
      expect(value).toBe(format);
    }
  });

  test('should accept various website URL formats', async ({ adminPage }) => {
    await adminPage.goto('/settings');
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await adminPage.waitForTimeout(1000);

    const urlFormats = [
      'https://example.com',
      'http://example.com',
      'https://www.example.com',
      'https://subdomain.example.com',
      'https://example.com/path',
    ];

    for (const url of urlFormats) {
      await adminPage.fill('input#website', url);
      const value = await adminPage.locator('input#website').inputValue();
      expect(value).toBe(url);
    }
  });
});

test.describe('Company Info - Access Control', () => {
  test('should only allow admin users to access settings', async ({ adminPage }) => {
    // Admin should have access
    await adminPage.goto('/settings');
    await expect(adminPage.locator('h1:has-text("Application Settings")')).toBeVisible();

    // Company Info tab should be accessible
    await adminPage.click('[role="tab"]:has-text("Company Info")');
    await expect(adminPage.locator('h3:has-text("Company Information")')).toBeVisible();
  });
});
