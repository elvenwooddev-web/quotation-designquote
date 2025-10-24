/**
 * Role Management Tests
 *
 * Tests for the Role Management feature in Settings page including:
 * - Display role management tab
 * - View all roles with their metadata
 * - Create new roles
 * - Edit role details and permissions
 * - Test all permission types across all resources
 * - Verify protected roles cannot be deleted
 * - Test permission persistence
 *
 * Uses the adminPage fixture for authenticated admin access
 */

import { test, expect } from '../fixtures/auth-helpers';

test.describe('Settings - Role Management', () => {
  // Use admin page fixture for all tests
  test.beforeEach(async ({ adminPage }) => {
    // Navigate to settings and switch to Role Management tab
    await adminPage.goto('/settings');
    await adminPage.waitForLoadState('networkidle');

    // Click Role Management tab
    await adminPage.click('[role="tab"]:has-text("Role Management")');
    await adminPage.waitForTimeout(500);
  });

  test('should display role management tab in settings', async ({ adminPage }) => {
    // Verify settings page loaded
    await expect(adminPage.locator('h1')).toContainText('Application Settings');

    // Role Management tab should be active
    await expect(adminPage.locator('[role="tab"][aria-selected="true"]')).toContainText('Role Management');

    // Should show Role Management header
    await expect(adminPage.locator('h2:has-text("Role Management")')).toBeVisible();
    await expect(adminPage.locator('text=Create and manage roles with custom permissions')).toBeVisible();

    // Should show Create Role button
    await expect(adminPage.locator('button:has-text("Create Role")')).toBeVisible();

    // Should show roles table
    await expect(adminPage.locator('table')).toBeVisible();
  });

  test('should view all roles and their properties', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Check table headers
    await expect(adminPage.locator('th:has-text("Role Name")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Description")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Users")')).toBeVisible();
    await expect(adminPage.locator('th:has-text("Actions")')).toBeVisible();

    // Should have at least one role row
    const roleRows = adminPage.locator('tbody tr');
    await expect(roleRows.first()).toBeVisible();

    // Should show role details (at least Admin role should exist)
    const tableBody = adminPage.locator('tbody');
    await expect(tableBody).toContainText('Admin');

    // Check for user count badge
    const userCountBadge = adminPage.locator('.bg-blue-100.text-blue-800').first();
    await expect(userCountBadge).toBeVisible();
  });

  test('should identify protected roles with shield icon', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Protected roles should have shield icon
    const shieldIcon = adminPage.locator('[data-lucide="shield"]').first();
    if (await shieldIcon.isVisible()) {
      // Shield icon should be next to a role name
      const parentRow = shieldIcon.locator('xpath=ancestor::tr');
      await expect(parentRow).toBeVisible();
    }
  });

  test('should open create role dialog', async ({ adminPage }) => {
    // Click Create Role button
    await adminPage.click('button:has-text("Create Role")');

    // Dialog should open
    await expect(adminPage.locator('[role="dialog"]')).toBeVisible();
    await expect(adminPage.locator('h2:has-text("Create New Role")')).toBeVisible();

    // Should have form fields
    await expect(adminPage.locator('input[type="text"][placeholder*="Project Manager"]')).toBeVisible();
    await expect(adminPage.locator('textarea[placeholder*="purpose and responsibilities"]')).toBeVisible();

    // Should have buttons
    await expect(adminPage.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(adminPage.locator('button:has-text("Save Role")')).toBeVisible();
  });

  test('should create a new role', async ({ adminPage }) => {
    // Click Create Role button
    await adminPage.click('button:has-text("Create Role")');

    // Fill form
    const timestamp = Date.now();
    const roleName = `Test Role ${timestamp}`;
    const roleDescription = `Test role created at ${timestamp}`;

    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.fill('textarea[placeholder*="purpose and responsibilities"]', roleDescription);

    // Submit form
    await adminPage.click('button:has-text("Save Role")');

    // Wait for role creation and dialog transition to edit mode
    await adminPage.waitForTimeout(2000);

    // Dialog should show "Edit Role" after creation
    await expect(adminPage.locator('h2:has-text("Edit Role")')).toBeVisible();

    // Role name should be in the form
    await expect(adminPage.locator(`input[value="${roleName}"]`)).toBeVisible();

    // Permissions editor should now be visible
    await expect(adminPage.locator('h3:has-text("Role Permissions")')).toBeVisible();

    // Close dialog
    await adminPage.click('button:has-text("Cancel")');
    await adminPage.waitForTimeout(1000);

    // New role should appear in table
    await expect(adminPage.locator('tbody')).toContainText(roleName);
    await expect(adminPage.locator('tbody')).toContainText(roleDescription);
  });

  test('should open edit role dialog with existing role data', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Click edit button on first non-protected role or any role
    const editButton = adminPage.locator('button[title=""]').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).first();
    await editButton.click();

    // Edit dialog should open
    await expect(adminPage.locator('[role="dialog"]')).toBeVisible();
    await expect(adminPage.locator('h2:has-text("Edit Role")')).toBeVisible();

    // Should show role name input with value
    const roleNameInput = adminPage.locator('input[type="text"]').first();
    await expect(roleNameInput).toHaveValue(/.+/); // Should have some value

    // Should show description textarea
    await expect(adminPage.locator('textarea')).toBeVisible();

    // Permissions editor should be visible
    await expect(adminPage.locator('h3:has-text("Role Permissions")')).toBeVisible();
  });

  test('should display permissions editor in edit dialog', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Click edit button on first role
    const editButton = adminPage.locator('button').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).first();
    await editButton.click();

    // Wait for dialog and permissions to load
    await adminPage.waitForTimeout(1500);

    // Permissions editor should be visible
    await expect(adminPage.locator('h3:has-text("Role Permissions")')).toBeVisible();
    await expect(adminPage.locator('text=Configure what users with this role can do')).toBeVisible();

    // Should show permissions table
    const permissionsTable = adminPage.locator('table').nth(1); // Second table (first is roles table)
    await expect(permissionsTable).toBeVisible();

    // Check for resource column header
    await expect(permissionsTable.locator('th:has-text("Resource")')).toBeVisible();

    // Check for all permission type columns
    await expect(permissionsTable.locator('th:has-text("Create")')).toBeVisible();
    await expect(permissionsTable.locator('th:has-text("Read")')).toBeVisible();
    await expect(permissionsTable.locator('th:has-text("Edit")')).toBeVisible();
    await expect(permissionsTable.locator('th:has-text("Delete")')).toBeVisible();
    await expect(permissionsTable.locator('th:has-text("Approve")')).toBeVisible();
    await expect(permissionsTable.locator('th:has-text("Export")')).toBeVisible();
  });

  test('should display all resources in permissions matrix', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Click edit button on first role
    const editButton = adminPage.locator('button').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).first();
    await editButton.click();

    // Wait for permissions to load
    await adminPage.waitForTimeout(1500);

    const permissionsTable = adminPage.locator('table').nth(1);

    // Check for all resource rows
    await expect(permissionsTable.locator('text=Categories')).toBeVisible();
    await expect(permissionsTable.locator('text=Product categories and organization')).toBeVisible();

    await expect(permissionsTable.locator('text=Products')).toBeVisible();
    await expect(permissionsTable.locator('text=Product catalog and pricing')).toBeVisible();

    await expect(permissionsTable.locator('text=Clients')).toBeVisible();
    await expect(permissionsTable.locator('text=Client information and contacts')).toBeVisible();

    await expect(permissionsTable.locator('text=Quotes')).toBeVisible();
    await expect(permissionsTable.locator('text=Quotations and proposals')).toBeVisible();
  });

  test('should toggle permission checkboxes for non-protected role', async ({ adminPage }) => {
    // Create a test role first
    await adminPage.click('button:has-text("Create Role")');
    const timestamp = Date.now();
    const roleName = `Permission Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(2000);

    // Now in edit mode with permissions editor visible
    const permissionsTable = adminPage.locator('table').nth(1);

    // Find the first checkbox for Categories -> Create permission
    const firstCheckbox = permissionsTable.locator('tbody tr').first().locator('[role="checkbox"]').first();

    // Get initial state
    const initialState = await firstCheckbox.getAttribute('data-state');

    // Click to toggle
    await firstCheckbox.click();
    await adminPage.waitForTimeout(500);

    // State should have changed
    const newState = await firstCheckbox.getAttribute('data-state');
    expect(newState).not.toBe(initialState);

    // Should show unsaved changes warning
    await expect(adminPage.locator('text=You have unsaved changes')).toBeVisible();
  });

  test('should save permission changes and persist', async ({ adminPage }) => {
    // Create a test role first
    await adminPage.click('button:has-text("Create Role")');
    const timestamp = Date.now();
    const roleName = `Persist Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(2000);

    // Toggle a permission
    const permissionsTable = adminPage.locator('table').nth(1);
    const testCheckbox = permissionsTable.locator('tbody tr').first().locator('[role="checkbox"]').first();
    await testCheckbox.click();
    await adminPage.waitForTimeout(500);

    // Save permissions using the embedded save button
    await adminPage.click('button:has-text("Save Permissions")');
    await adminPage.waitForTimeout(1500);

    // Close dialog
    await adminPage.keyboard.press('Escape');
    await adminPage.waitForTimeout(1000);

    // Re-open the same role
    const roleRow = adminPage.locator(`tbody tr:has-text("${roleName}")`);
    await roleRow.locator('button').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).click();
    await adminPage.waitForTimeout(1500);

    // Check if permission persisted - should NOT show unsaved changes warning
    await expect(adminPage.locator('text=You have unsaved changes')).not.toBeVisible();
  });

  test('should test all permission types (canCreate, canRead, canEdit, canDelete, canApprove, canExport)', async ({ adminPage }) => {
    // Create a test role
    await adminPage.click('button:has-text("Create Role")');
    const timestamp = Date.now();
    const roleName = `Full Permissions Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(2000);

    const permissionsTable = adminPage.locator('table').nth(1);
    const firstResourceRow = permissionsTable.locator('tbody tr').first();

    // Get all checkboxes in first row (Categories resource)
    const checkboxes = firstResourceRow.locator('[role="checkbox"]');
    const checkboxCount = await checkboxes.count();

    // Should have exactly 6 permission types
    expect(checkboxCount).toBe(6);

    // Toggle each permission type
    for (let i = 0; i < checkboxCount; i++) {
      await checkboxes.nth(i).click();
      await adminPage.waitForTimeout(300);
    }

    // Should show unsaved changes
    await expect(adminPage.locator('text=You have unsaved changes')).toBeVisible();

    // Save all changes
    await adminPage.click('button:has-text("Save Permissions")');
    await adminPage.waitForTimeout(1500);

    // Changes should be saved
    await expect(adminPage.locator('text=You have unsaved changes')).not.toBeVisible();
  });

  test('should verify protected roles cannot be deleted', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Find a protected role (should have shield icon)
    const protectedRoleRow = adminPage.locator('tbody tr').filter({ has: adminPage.locator('[data-lucide="shield"]') }).first();

    if (await protectedRoleRow.isVisible()) {
      // Find delete button in that row
      const deleteButton = protectedRoleRow.locator('button').filter({ has: adminPage.locator('[data-lucide="trash-2"]') });

      // Delete button should be disabled
      await expect(deleteButton).toBeDisabled();

      // Hovering should show tooltip about protected role
      await deleteButton.hover();
      await adminPage.waitForTimeout(500);
    }
  });

  test('should verify protected role permissions cannot be modified', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // Find and edit a protected role (e.g., Admin)
    const protectedRoleRow = adminPage.locator('tbody tr').filter({ has: adminPage.locator('[data-lucide="shield"]') }).first();

    if (await protectedRoleRow.isVisible()) {
      // Click edit button
      await protectedRoleRow.locator('button').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).click();
      await adminPage.waitForTimeout(1500);

      // Should show protected role message
      await expect(adminPage.locator('text=Protected role - permissions cannot be modified')).toBeVisible();

      // All checkboxes should be disabled
      const permissionsTable = adminPage.locator('table').nth(1);
      const checkboxes = permissionsTable.locator('[role="checkbox"]');
      const firstCheckbox = checkboxes.first();

      await expect(firstCheckbox).toBeDisabled();

      // Save Permissions button should be disabled if visible
      const saveButton = adminPage.locator('button:has-text("Save Permissions")');
      if (await saveButton.isVisible()) {
        await expect(saveButton).toBeDisabled();
      }
    }
  });

  test('should delete non-protected role', async ({ adminPage }) => {
    // Create a test role to delete
    await adminPage.click('button:has-text("Create Role")');
    const timestamp = Date.now();
    const roleName = `Delete Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(2000);

    // Close dialog
    await adminPage.keyboard.press('Escape');
    await adminPage.waitForTimeout(1000);

    // Find the role in table
    const roleRow = adminPage.locator(`tbody tr:has-text("${roleName}")`);
    await expect(roleRow).toBeVisible();

    // Click delete button
    const deleteButton = roleRow.locator('button').filter({ has: adminPage.locator('[data-lucide="trash-2"]') });

    // Handle confirm dialog
    adminPage.on('dialog', dialog => dialog.accept());

    await deleteButton.click();
    await adminPage.waitForTimeout(1500);

    // Role should be removed from table
    await expect(roleRow).not.toBeVisible();
  });

  test('should update role name and description', async ({ adminPage }) => {
    // Create a test role
    await adminPage.click('button:has-text("Create Role")');
    const timestamp = Date.now();
    const originalName = `Update Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', originalName);
    await adminPage.fill('textarea', 'Original description');
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(2000);

    // Update name and description
    const updatedName = `Updated Role ${timestamp}`;
    const nameInput = adminPage.locator('input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill(updatedName);

    const descriptionTextarea = adminPage.locator('textarea');
    await descriptionTextarea.clear();
    await descriptionTextarea.fill('Updated description');

    // Save changes
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(1500);

    // Close dialog
    await adminPage.keyboard.press('Escape');
    await adminPage.waitForTimeout(1000);

    // Updated values should appear in table
    await expect(adminPage.locator('tbody')).toContainText(updatedName);
    await expect(adminPage.locator('tbody')).toContainText('Updated description');
  });

  test('should show user count for each role', async ({ adminPage }) => {
    // Wait for roles to load
    await adminPage.waitForTimeout(1000);

    // All role rows should have user count badge
    const userCountBadges = adminPage.locator('.bg-blue-100.text-blue-800');
    const badgeCount = await userCountBadges.count();

    expect(badgeCount).toBeGreaterThan(0);

    // Each badge should contain "user" or "users"
    const firstBadge = userCountBadges.first();
    const badgeText = await firstBadge.textContent();
    expect(badgeText).toMatch(/\d+ users?/);
  });

  test('should maintain permissions across resources independently', async ({ adminPage }) => {
    // Create a test role
    await adminPage.click('button:has-text("Create Role")');
    const timestamp = Date.now();
    const roleName = `Resource Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.click('button:has-text("Save Role")');
    await adminPage.waitForTimeout(2000);

    const permissionsTable = adminPage.locator('table').nth(1);

    // Enable "Create" permission for Categories (first row)
    const categoriesCreateCheckbox = permissionsTable.locator('tbody tr').nth(0).locator('[role="checkbox"]').nth(0);
    await categoriesCreateCheckbox.click();

    // Enable "Read" permission for Products (second row)
    const productsReadCheckbox = permissionsTable.locator('tbody tr').nth(1).locator('[role="checkbox"]').nth(1);
    await productsReadCheckbox.click();

    // Save permissions
    await adminPage.click('button:has-text("Save Permissions")');
    await adminPage.waitForTimeout(1500);

    // Verify both permissions are maintained independently
    const categoriesCreateState = await categoriesCreateCheckbox.getAttribute('data-state');
    const productsReadState = await productsReadCheckbox.getAttribute('data-state');

    expect(categoriesCreateState).toBe('checked');
    expect(productsReadState).toBe('checked');
  });

  test('should cancel role creation without saving', async ({ adminPage }) => {
    // Click Create Role button
    await adminPage.click('button:has-text("Create Role")');

    // Fill form
    const timestamp = Date.now();
    const roleName = `Cancel Test ${timestamp}`;
    await adminPage.fill('input[type="text"][placeholder*="Project Manager"]', roleName);
    await adminPage.fill('textarea', 'This should not be saved');

    // Click Cancel
    await adminPage.click('button:has-text("Cancel")');
    await adminPage.waitForTimeout(1000);

    // Dialog should close
    await expect(adminPage.locator('[role="dialog"]')).not.toBeVisible();

    // Role should not appear in table
    await expect(adminPage.locator('tbody')).not.toContainText(roleName);
  });

  test('should discard permission changes when canceling', async ({ adminPage }) => {
    // Edit an existing role
    await adminPage.waitForTimeout(1000);
    const editButton = adminPage.locator('button').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).first();
    await editButton.click();
    await adminPage.waitForTimeout(1500);

    // Get the role name for later verification
    const roleNameInput = adminPage.locator('input[type="text"]').first();
    const roleName = await roleNameInput.inputValue();

    // Toggle a permission
    const permissionsTable = adminPage.locator('table').nth(1);
    const testCheckbox = permissionsTable.locator('tbody tr').first().locator('[role="checkbox"]').first();
    const initialState = await testCheckbox.getAttribute('data-state');
    await testCheckbox.click();
    await adminPage.waitForTimeout(500);

    // Should show unsaved changes
    await expect(adminPage.locator('text=You have unsaved changes')).toBeVisible();

    // Cancel without saving
    await adminPage.keyboard.press('Escape');
    await adminPage.waitForTimeout(1000);

    // Re-open the role
    const roleRow = adminPage.locator(`tbody tr:has-text("${roleName}")`).first();
    await roleRow.locator('button').filter({ has: adminPage.locator('[data-lucide="pencil"]') }).click();
    await adminPage.waitForTimeout(1500);

    // Check that changes were not saved
    const permissionsTableNew = adminPage.locator('table').nth(1);
    const testCheckboxNew = permissionsTableNew.locator('tbody tr').first().locator('[role="checkbox"]').first();
    const currentState = await testCheckboxNew.getAttribute('data-state');

    // State should match initial state (changes discarded)
    expect(currentState).toBe(initialState);
  });

  test('should switch between tabs while preserving role list', async ({ adminPage }) => {
    // Start on Role Management
    await expect(adminPage.locator('[role="tab"][aria-selected="true"]')).toContainText('Role Management');

    // Get role count
    await adminPage.waitForTimeout(1000);
    const initialRoleRows = await adminPage.locator('tbody tr').count();

    // Switch to User Management
    await adminPage.click('[role="tab"]:has-text("User Management")');
    await expect(adminPage.locator('[role="tab"][aria-selected="true"]')).toContainText('User Management');

    // Switch back to Role Management
    await adminPage.click('[role="tab"]:has-text("Role Management")');
    await expect(adminPage.locator('[role="tab"][aria-selected="true"]')).toContainText('Role Management');

    // Wait for roles to reload
    await adminPage.waitForTimeout(1000);

    // Role count should be the same
    const finalRoleRows = await adminPage.locator('tbody tr').count();
    expect(finalRoleRows).toBe(initialRoleRows);
  });

  test('should validate required fields when creating role', async ({ adminPage }) => {
    // Click Create Role button
    await adminPage.click('button:has-text("Create Role")');

    // Try to submit without filling required fields
    await adminPage.click('button:has-text("Save Role")');

    // Form validation should prevent submission (dialog stays open)
    await expect(adminPage.locator('[role="dialog"]')).toBeVisible();
    await expect(adminPage.locator('h2:has-text("Create New Role")')).toBeVisible();
  });
});
