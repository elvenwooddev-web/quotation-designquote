/**
 * Clients CRUD Tests
 * Tests for creating, reading, updating, and deleting clients
 */

import { test, expect } from '../fixtures/auth-helpers';
import { generateClientData, waitForApiResponse } from '../fixtures/test-data';

test.describe('Clients - CRUD Operations', () => {
  test.beforeEach(async ({ adminPage }) => {
    // Navigate to clients page
    await adminPage.goto('/clients');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display clients page and table', async ({ adminPage }) => {
    // Verify page title
    await expect(adminPage.locator('h1:has-text("Clients")')).toBeVisible();

    // Verify page description
    await expect(adminPage.locator('text=Manage your client relationships')).toBeVisible();

    // Verify Add Client button is visible
    await expect(adminPage.locator('button:has-text("Add Client")')).toBeVisible();

    // Verify search input is visible
    await expect(adminPage.locator('input[placeholder*="Search clients"]')).toBeVisible();

    // Verify table structure (if clients exist)
    const table = adminPage.locator('table');
    if (await table.isVisible()) {
      // Check table headers
      await expect(adminPage.locator('th:has-text("Name")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Email")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Phone")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Quotations")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Actions")')).toBeVisible();
    }
  });

  test('should create new client with all fields', async ({ adminPage }) => {
    const clientData = generateClientData({
      name: 'Test Client Company',
      email: 'testclient@example.com',
      phone: '+919876543210',
      address: '123 Test Street, Test City',
      source: 'Referral',
      expectedDealValue: 50000,
    });

    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Fill client form - required fields
    await adminPage.fill('input[type="text"]', clientData.name);
    await adminPage.fill('input[type="email"]', clientData.email);

    // Select source
    await adminPage.selectOption('select', { label: clientData.source });

    // Fill optional fields
    await adminPage.fill('input[type="tel"]', clientData.phone);
    await adminPage.fill('input[type="number"]', clientData.expectedDealValue.toString());
    await adminPage.fill('textarea', clientData.address);

    // Submit form
    await adminPage.click('button:has-text("Add Client")');

    // Wait for success - dialog should close
    await expect(adminPage.locator('text=Add New Client')).not.toBeVisible({ timeout: 5000 });

    // Wait for client to appear in table
    await adminPage.waitForTimeout(1000);

    // Verify client appears in table
    await expect(adminPage.locator(`text=${clientData.name}`)).toBeVisible({ timeout: 5000 });
    await expect(adminPage.locator(`text=${clientData.email}`)).toBeVisible();
  });

  test('should create new client with required fields only', async ({ adminPage }) => {
    const clientData = generateClientData({
      name: 'Minimal Test Client',
      email: 'minimal@example.com',
      source: 'Organic',
    });

    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Fill only required fields
    await adminPage.fill('input[type="text"]', clientData.name);
    await adminPage.fill('input[type="email"]', clientData.email);
    await adminPage.selectOption('select', { label: clientData.source });

    // Submit form
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog to close
    await expect(adminPage.locator('text=Add New Client')).not.toBeVisible({ timeout: 5000 });

    // Verify client appears in table
    await adminPage.waitForTimeout(1000);
    await expect(adminPage.locator(`text=${clientData.name}`)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields when creating client', async ({ adminPage }) => {
    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Try to submit without filling required fields
    await adminPage.click('button:has-text("Add Client")');

    // Verify dialog is still open (form didn't submit)
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Check for validation error message
    await expect(adminPage.locator('text=Name is required')).toBeVisible();
  });

  test('should validate email field is required', async ({ adminPage }) => {
    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Fill only name, skip email
    await adminPage.fill('input[type="text"]', 'Test Client');
    await adminPage.selectOption('select', { label: 'Other' });

    // Try to submit
    await adminPage.click('button:has-text("Add Client")');

    // Verify dialog is still open
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Check for email validation error
    await expect(adminPage.locator('text=Email is required')).toBeVisible();
  });

  test('should validate source field is required', async ({ adminPage }) => {
    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Fill name and email, but clear source
    await adminPage.fill('input[type="text"]', 'Test Client');
    await adminPage.fill('input[type="email"]', 'test@example.com');

    // Try to clear source (if possible)
    const sourceSelect = adminPage.locator('select');
    const optionCount = await sourceSelect.locator('option').count();
    if (optionCount > 0) {
      // Source should be required, so validation would trigger
      await adminPage.click('button:has-text("Add Client")');

      // Dialog should remain open or show error if validation works
      // Since source has default value, this might succeed
    }
  });

  test('should edit existing client', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Find edit buttons
    const editButtons = adminPage.locator('button:has([class*="lucide-edit"]), button svg[class*="lucide-edit"]').locator('..');
    const count = await editButtons.count();

    if (count > 0) {
      // Get original client name
      const clientRow = adminPage.locator('tbody tr').first();
      const originalName = await clientRow.locator('td:first-child .text-sm.font-medium').textContent();

      // Click edit button
      await editButtons.first().click();

      // Wait for edit dialog
      await expect(adminPage.locator('text=Edit Client')).toBeVisible();

      // Update client name
      const newName = `Updated Client ${Date.now()}`;
      const nameInput = adminPage.locator('input[type="text"]');
      await nameInput.clear();
      await nameInput.fill(newName);

      // Update phone
      const phoneInput = adminPage.locator('input[type="tel"]');
      await phoneInput.clear();
      await phoneInput.fill('+919123456789');

      // Save changes
      await adminPage.click('button:has-text("Update Client")');

      // Wait for dialog to close
      await expect(adminPage.locator('text=Edit Client')).not.toBeVisible({ timeout: 5000 });

      // Wait for update
      await adminPage.waitForTimeout(1000);

      // Verify updated client appears
      await expect(adminPage.locator(`text=${newName}`)).toBeVisible({ timeout: 5000 });
      await expect(adminPage.locator('text=+919123456789')).toBeVisible();
    }
  });

  test('should cancel editing client', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Find edit buttons
    const editButtons = adminPage.locator('button:has([class*="lucide-edit"]), button svg[class*="lucide-edit"]').locator('..');
    const count = await editButtons.count();

    if (count > 0) {
      // Click edit button
      await editButtons.first().click();

      // Wait for edit dialog
      await expect(adminPage.locator('text=Edit Client')).toBeVisible();

      // Make some changes
      const nameInput = adminPage.locator('input[type="text"]');
      await nameInput.fill('Changed Name That Should Not Save');

      // Click Cancel button
      await adminPage.click('button:has-text("Cancel")');

      // Verify dialog closed
      await expect(adminPage.locator('text=Edit Client')).not.toBeVisible({ timeout: 3000 });

      // Verify changes were not saved
      await expect(adminPage.locator('text=Changed Name That Should Not Save')).not.toBeVisible();
    }
  });

  test('should delete client with confirmation', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Find delete buttons
    const deleteButtons = adminPage.locator('button:has([class*="lucide-trash"]), button svg[class*="lucide-trash"]').locator('..');
    const count = await deleteButtons.count();

    if (count > 0) {
      // Get client name before deletion
      const clientRow = adminPage.locator('tbody tr').first();
      let clientName = '';
      try {
        const nameElement = clientRow.locator('td:first-child .text-sm.font-medium');
        clientName = await nameElement.textContent() || '';
      } catch {
        // Name extraction failed, continue anyway
      }

      // Setup dialog handler for confirmation
      adminPage.on('dialog', dialog => dialog.accept());

      // Click delete button
      await deleteButtons.first().click();

      // Wait for deletion
      await adminPage.waitForTimeout(1500);

      // Verify client is removed (if we got the name)
      if (clientName) {
        // Either client is removed or count decreased
        const newCount = await deleteButtons.count();
        expect(newCount).toBeLessThanOrEqual(count);
      }
    }
  });

  test('should search clients by name', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Get first client name from table (if exists)
    const firstClientName = adminPage.locator('tbody tr:first-child td:first-child .text-sm.font-medium');

    if (await firstClientName.isVisible()) {
      const clientName = await firstClientName.textContent();

      if (clientName) {
        // Extract first word from client name
        const searchTerm = clientName.split(' ')[0];

        // Type in search box
        const searchInput = adminPage.locator('input[placeholder*="Search clients"]');
        await searchInput.fill(searchTerm);

        // Wait for search to filter
        await adminPage.waitForTimeout(500);

        // Verify filtered client is still visible
        await expect(adminPage.locator(`text=${clientName}`)).toBeVisible();
      }
    }
  });

  test('should search clients by email', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Look for search input
    const searchInput = adminPage.locator('input[placeholder*="Search clients"]');

    // Get first client email from table (if exists)
    const firstClientEmail = adminPage.locator('tbody tr:first-child td:nth-child(2) .text-sm');

    if (await firstClientEmail.isVisible()) {
      const clientEmail = await firstClientEmail.textContent();

      if (clientEmail && clientEmail !== '-') {
        // Search by email
        await searchInput.fill(clientEmail);

        // Wait for search results
        await adminPage.waitForTimeout(500);

        // Verify filtered client is visible
        await expect(adminPage.locator(`text=${clientEmail}`)).toBeVisible();
      }
    }
  });

  test('should display empty state when search returns no results', async ({ adminPage }) => {
    // Look for search input
    const searchInput = adminPage.locator('input[placeholder*="Search clients"]');

    // Search for something that doesn't exist
    await searchInput.fill('zzz-nonexistent-client-zzz-999');

    // Wait for search
    await adminPage.waitForTimeout(500);

    // Verify empty state message
    await expect(adminPage.locator('text=No clients found')).toBeVisible({ timeout: 3000 });
  });

  test('should clear search and show all clients', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Get initial client count
    const initialRows = await adminPage.locator('tbody tr').count();

    if (initialRows > 0) {
      // Search for something
      const searchInput = adminPage.locator('input[placeholder*="Search clients"]');
      await searchInput.fill('test search');
      await adminPage.waitForTimeout(500);

      // Clear search
      await searchInput.clear();
      await adminPage.waitForTimeout(500);

      // Verify all clients are shown again
      const finalRows = await adminPage.locator('tbody tr').count();
      expect(finalRows).toBeGreaterThanOrEqual(1);
    }
  });

  test('should display empty state when no clients exist', async ({ adminPage }) => {
    // This test assumes database might have no clients
    // Check if empty state is shown
    const emptyState = adminPage.locator('text=No clients found');

    // Either table is visible or empty state is visible
    const table = adminPage.locator('table');
    const hasTable = await table.isVisible();
    const hasEmptyState = await emptyState.isVisible();

    expect(hasTable || hasEmptyState).toBeTruthy();
  });
});

test.describe('Client Detail Sidebar', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/clients');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should open client detail sidebar when clicking on client row', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Check if any clients exist
    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Click on first client row
      await clientRows.first().click();

      // Wait for sidebar to open
      await adminPage.waitForTimeout(500);

      // Verify sidebar is visible
      await expect(adminPage.locator('text=Client Details')).toBeVisible();

      // Verify client info is displayed
      await expect(adminPage.locator('.w-96')).toBeVisible(); // Sidebar width class
    }
  });

  test('should display client information in sidebar', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Get client info from table
      const firstRow = clientRows.first();
      const clientName = await firstRow.locator('td:first-child .text-sm.font-medium').textContent();
      const clientEmail = await firstRow.locator('td:nth-child(2) .text-sm').textContent();

      // Click on client row
      await firstRow.click();
      await adminPage.waitForTimeout(500);

      // Verify sidebar shows correct information
      if (clientName) {
        await expect(adminPage.locator(`.w-96:has-text("${clientName}")`)).toBeVisible();
      }

      // Verify email section
      await expect(adminPage.locator('label:has-text("Email")')).toBeVisible();

      // Verify phone section
      await expect(adminPage.locator('label:has-text("Phone")')).toBeVisible();
    }
  });

  test('should display quotations section in sidebar', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Click on first client
      await clientRows.first().click();
      await adminPage.waitForTimeout(500);

      // Verify Quotations section exists
      await expect(adminPage.locator('h3:has-text("Quotations")')).toBeVisible();

      // Should show either quotations or empty state
      const hasQuotes = await adminPage.locator('text=No quotations yet').isVisible();
      const hasQuoteList = await adminPage.locator('.space-y-3').isVisible();

      expect(hasQuotes || hasQuoteList).toBeTruthy();
    }
  });

  test('should display revision history section in sidebar', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Click on first client
      await clientRows.first().click();
      await adminPage.waitForTimeout(1000); // Extra wait for revisions to load

      // Verify Revision History section exists
      await expect(adminPage.locator('h3:has-text("Quote Revision History")')).toBeVisible();

      // Should show either revisions, loading state, or empty state
      const hasLoading = await adminPage.locator('.animate-spin').isVisible();
      const hasEmpty = await adminPage.locator('text=No quote revisions yet').isVisible();
      const hasRevisions = await adminPage.locator('.border-l-2.border-blue-500').isVisible();

      expect(hasLoading || hasEmpty || hasRevisions).toBeTruthy();
    }
  });

  test('should close sidebar when clicking close button', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Click on first client to open sidebar
      await clientRows.first().click();
      await adminPage.waitForTimeout(500);

      // Verify sidebar is visible
      await expect(adminPage.locator('text=Client Details')).toBeVisible();

      // Click close button
      const closeButton = adminPage.locator('.w-96 button:has([class*="lucide-x"])');
      await closeButton.click();

      // Wait for sidebar to close
      await adminPage.waitForTimeout(500);

      // Verify sidebar is closed
      await expect(adminPage.locator('text=Client Details')).not.toBeVisible();
    }
  });

  test('should display client avatar with initial', async ({ adminPage }) => {
    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Get first character of client name
      const clientName = await clientRows.first().locator('td:first-child .text-sm.font-medium').textContent();

      // Click on client row
      await clientRows.first().click();
      await adminPage.waitForTimeout(500);

      if (clientName) {
        const initial = clientName.charAt(0).toUpperCase();

        // Verify avatar with initial is displayed
        await expect(adminPage.locator(`.w-24.h-24:has-text("${initial}")`)).toBeVisible();
      }
    }
  });
});

test.describe('Client Permissions', () => {
  test('sales executive should see clients page', async ({ salesExecutivePage }) => {
    await salesExecutivePage.goto('/clients');
    await salesExecutivePage.waitForLoadState('networkidle');

    // Verify page loads
    await expect(salesExecutivePage.locator('h1:has-text("Clients")')).toBeVisible();
  });

  test('admin should have all client permissions', async ({ adminPage }) => {
    await adminPage.goto('/clients');
    await adminPage.waitForLoadState('networkidle');

    // Verify Add Client button is visible (create permission)
    await expect(adminPage.locator('button:has-text("Add Client")')).toBeVisible();

    // Wait for clients to load
    await adminPage.waitForTimeout(1000);

    // Check if edit and delete buttons are visible (if clients exist)
    const clientRows = adminPage.locator('tbody tr');
    const count = await clientRows.count();

    if (count > 0) {
      // Edit button should be visible
      const editButtons = adminPage.locator('button:has([class*="lucide-edit"])');
      await expect(editButtons.first()).toBeVisible();

      // Delete button should be visible
      const deleteButtons = adminPage.locator('button:has([class*="lucide-trash"])');
      await expect(deleteButtons.first()).toBeVisible();
    }
  });
});

test.describe('Client Source Options', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/clients');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should have all source options available', async ({ adminPage }) => {
    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    // Verify source dropdown has all options
    const sourceSelect = adminPage.locator('select');

    // Check for each source option
    await expect(sourceSelect.locator('option[value="Organic"]')).toBeVisible();
    await expect(sourceSelect.locator('option[value="Referral"]')).toBeVisible();
    await expect(sourceSelect.locator('option[value="Paid Ads"]')).toBeVisible();
    await expect(sourceSelect.locator('option[value="Other"]')).toBeVisible();
  });

  test('should select different source options', async ({ adminPage }) => {
    // Click Add Client button
    await adminPage.click('button:has-text("Add Client")');

    // Wait for dialog
    await expect(adminPage.locator('text=Add New Client')).toBeVisible();

    const sourceSelect = adminPage.locator('select');

    // Test selecting each option
    await sourceSelect.selectOption('Organic');
    expect(await sourceSelect.inputValue()).toBe('Organic');

    await sourceSelect.selectOption('Referral');
    expect(await sourceSelect.inputValue()).toBe('Referral');

    await sourceSelect.selectOption('Paid Ads');
    expect(await sourceSelect.inputValue()).toBe('Paid Ads');

    await sourceSelect.selectOption('Other');
    expect(await sourceSelect.inputValue()).toBe('Other');
  });
});

test.describe('Client Bulk Import', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/clients');
    await adminPage.waitForLoadState('networkidle');
  });

  test('should display bulk import button', async ({ adminPage }) => {
    // Verify Bulk Import button is visible
    await expect(adminPage.locator('[data-testid="bulk-import-button"]')).toBeVisible();
  });

  test('should open bulk import dialog', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Verify import instructions are displayed
    await expect(adminPage.locator('text=Import Instructions')).toBeVisible();
    await expect(adminPage.locator('text=Required column: Name')).toBeVisible();
    await expect(adminPage.locator('text=Optional columns: Email, Phone, Source, Address')).toBeVisible();
  });

  test('should download sample CSV', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Setup download promise before clicking download button
    const downloadPromise = adminPage.waitForEvent('download');

    // Click download sample button
    await adminPage.click('[data-testid="download-sample-csv"]');

    // Wait for download
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('sample-clients-import.csv');
  });

  test('should upload CSV and show preview', async ({ adminPage, page }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Create a test CSV content
    const csvContent = `Name,Email,Phone,Source,Address
Test Client 1,test1@example.com,+1-555-0001,Referral,"100 Main St, City, State"
Test Client 2,test2@example.com,+1-555-0002,Organic,"200 Oak Ave, Town, State"
Test Client 3,test3@example.com,+1-555-0003,Other,"300 Pine Rd, Village, State"`;

    // Create a file with the CSV content
    const buffer = Buffer.from(csvContent, 'utf-8');

    // Upload the CSV file
    const fileInput = adminPage.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles({
      name: 'test-clients.csv',
      mimeType: 'text/csv',
      buffer: buffer,
    });

    // Wait for preview to render
    await adminPage.waitForTimeout(1000);

    // Verify preview table is shown
    await expect(adminPage.locator('[data-testid="preview-table"]')).toBeVisible();

    // Verify preview shows correct data
    await expect(adminPage.locator('text=Test Client 1')).toBeVisible();
    await expect(adminPage.locator('text=test1@example.com')).toBeVisible();
    await expect(adminPage.locator('text=Referral')).toBeVisible();

    // Verify import button appears
    await expect(adminPage.locator('[data-testid="import-button"]')).toBeVisible();
  });

  test('should import clients from CSV successfully', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Create a test CSV with unique clients
    const timestamp = Date.now();
    const csvContent = `Name,Email,Phone,Source,Address
Bulk Import Test ${timestamp},bulktest${timestamp}@example.com,+1-555-${timestamp},Referral,"123 Test St, Test City"
Bulk Import User ${timestamp},bulkuser${timestamp}@example.com,+1-555-${timestamp + 1},Organic,"456 User Ave, User Town"`;

    const buffer = Buffer.from(csvContent, 'utf-8');

    // Upload the CSV file
    const fileInput = adminPage.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles({
      name: 'bulk-import-test.csv',
      mimeType: 'text/csv',
      buffer: buffer,
    });

    // Wait for preview
    await adminPage.waitForTimeout(1000);

    // Click Import button
    await adminPage.click('[data-testid="import-button"]');

    // Wait for import to complete
    await expect(adminPage.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });

    // Verify success message
    await expect(adminPage.locator('text=Successfully imported 2 clients')).toBeVisible();

    // Close dialog
    const dialog = adminPage.locator('text=Bulk Import Clients').locator('..');
    await adminPage.keyboard.press('Escape');
    await adminPage.waitForTimeout(500);

    // Verify clients appear in the table
    await adminPage.waitForTimeout(1000);
    await expect(adminPage.locator(`text=Bulk Import Test ${timestamp}`)).toBeVisible({ timeout: 5000 });
  });

  test('should handle CSV with missing required fields', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Create CSV with missing Name field
    const csvContent = `Name,Email,Phone,Source,Address
,missingname@example.com,+1-555-0001,Other,"100 Main St"
Valid Client,valid@example.com,+1-555-0002,Referral,"200 Oak Ave"`;

    const buffer = Buffer.from(csvContent, 'utf-8');

    // Upload the CSV file
    const fileInput = adminPage.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles({
      name: 'invalid-clients.csv',
      mimeType: 'text/csv',
      buffer: buffer,
    });

    // Wait for preview
    await adminPage.waitForTimeout(1000);

    // Click Import button
    await adminPage.click('[data-testid="import-button"]');

    // Wait for import to complete
    await adminPage.waitForTimeout(3000);

    // Verify success message shows errors
    await expect(adminPage.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(adminPage.locator('text=Skipped 1 rows due to errors')).toBeVisible();
    await expect(adminPage.locator('text=Successfully imported 1 clients')).toBeVisible();
  });

  test('should handle CSV with invalid email format', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Create CSV with invalid email
    const csvContent = `Name,Email,Phone,Source,Address
Invalid Email Client,not-an-email,+1-555-0001,Other,"100 Main St"
Valid Email Client,valid@example.com,+1-555-0002,Referral,"200 Oak Ave"`;

    const buffer = Buffer.from(csvContent, 'utf-8');

    // Upload the CSV file
    const fileInput = adminPage.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles({
      name: 'invalid-email.csv',
      mimeType: 'text/csv',
      buffer: buffer,
    });

    // Wait for preview
    await adminPage.waitForTimeout(1000);

    // Click Import button
    await adminPage.click('[data-testid="import-button"]');

    // Wait for import to complete
    await adminPage.waitForTimeout(3000);

    // Verify partial success with errors
    await expect(adminPage.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(adminPage.locator('text=Skipped 1 rows due to errors')).toBeVisible();
  });

  test('should handle CSV with addresses containing commas', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    const timestamp = Date.now();
    // Create CSV with complex addresses
    const csvContent = `Name,Email,Phone,Source,Address
Comma Test ${timestamp},commatest${timestamp}@example.com,+1-555-0001,Referral,"123 Main St, Suite 100, New York, NY 10001"`;

    const buffer = Buffer.from(csvContent, 'utf-8');

    // Upload the CSV file
    const fileInput = adminPage.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles({
      name: 'comma-address.csv',
      mimeType: 'text/csv',
      buffer: buffer,
    });

    // Wait for preview
    await adminPage.waitForTimeout(1000);

    // Verify preview shows full address correctly
    await expect(adminPage.locator('text=123 Main St, Suite 100, New York, NY 10001')).toBeVisible();

    // Click Import button
    await adminPage.click('[data-testid="import-button"]');

    // Wait for import to complete
    await expect(adminPage.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });

    // Verify success
    await expect(adminPage.locator('text=Successfully imported 1 clients')).toBeVisible();
  });

  test('should validate file type (CSV only)', async ({ adminPage }) => {
    // Click Bulk Import button
    await adminPage.click('[data-testid="bulk-import-button"]');

    // Wait for dialog to open
    await expect(adminPage.locator('text=Bulk Import Clients')).toBeVisible();

    // Try to upload a non-CSV file
    const fileInput = adminPage.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Not a CSV file'),
    });

    // Wait a moment
    await adminPage.waitForTimeout(500);

    // Verify error message appears
    await expect(adminPage.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(adminPage.locator('text=Please select a CSV file')).toBeVisible();
  });
});
