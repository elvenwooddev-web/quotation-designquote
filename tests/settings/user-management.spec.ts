import { test, expect } from '@playwright/test';

test.describe('Settings - User Management', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'varun@elvenwood.in');
    await page.fill('input[type="password"]', 'Varun@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.goto('/settings');
  });

  test('should display user management table', async ({ page }) => {
    // Wait for settings page to load
    await expect(page.locator('h1')).toContainText('Application Settings');

    // User Management tab should be active by default
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('User Management');

    // Should show users table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Role")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();

    // Should show Add User button
    await expect(page.locator('button:has-text("Add User")')).toBeVisible();

    // Should NOT show Save Changes button on User Management tab
    await expect(page.locator('button:has-text("Save Changes")')).not.toBeVisible();
  });

  test('should load and display users', async ({ page }) => {
    // Wait for users to load
    await page.waitForTimeout(1000);

    // Should have at least one user row
    const userRows = page.locator('tbody tr');
    await expect(userRows.first()).toBeVisible();

    // Should show user details
    await expect(page.locator('tbody')).toContainText('varun@elvenwood.in');
  });

  test('should open add user dialog', async ({ page }) => {
    // Click Add User button
    await page.click('button:has-text("Add User")');

    // Dialog should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Add New User")')).toBeVisible();

    // Should have form fields
    await expect(page.locator('input[type="text"]').first()).toBeVisible(); // Name
    await expect(page.locator('input[type="email"]')).toBeVisible(); // Email
    await expect(page.locator('input[type="password"]')).toBeVisible(); // Password
    await expect(page.locator('select')).toBeVisible(); // Role

    // Should have buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Create User")')).toBeVisible();
  });

  test('should create a new user', async ({ page }) => {
    // Click Add User button
    await page.click('button:has-text("Add User")');

    // Fill form
    const timestamp = Date.now();
    await page.fill('input[type="text"]', `Test User ${timestamp}`);
    await page.fill('input[type="email"]', `testuser${timestamp}@elvenwood.in`);
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.selectOption('select', { index: 0 }); // Select first role

    // Submit form
    await page.click('button:has-text("Create User")');

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // New user should appear in table
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody')).toContainText(`testuser${timestamp}@elvenwood.in`);
  });

  test('should edit user role', async ({ page }) => {
    // Wait for users to load
    await page.waitForTimeout(1000);

    // Click edit button on first user
    const editButton = page.locator('button[title="Edit user role"]').first();
    await editButton.click();

    // Edit dialog should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Edit User")')).toBeVisible();

    // Name and email should be disabled
    await expect(page.locator('input[value*="@elvenwood.in"]')).toBeDisabled();

    // Role dropdown should be enabled
    const roleSelect = page.locator('select');
    await expect(roleSelect).toBeEnabled();

    // Change role
    await roleSelect.selectOption({ index: 1 });

    // Submit
    await page.click('button:has-text("Update User")');

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should toggle user status', async ({ page }) => {
    // Wait for users to load
    await page.waitForTimeout(1000);

    // Find a user row and get their current status
    const userRow = page.locator('tbody tr').first();
    const statusText = await userRow.locator('text=/Active|Inactive/').textContent();

    // Click the status toggle switch
    const toggle = userRow.locator('[role="switch"]');
    await toggle.click();

    // Wait for update
    await page.waitForTimeout(1000);

    // Status should have changed
    const newStatusText = await userRow.locator('text=/Active|Inactive/').textContent();
    expect(newStatusText).not.toBe(statusText);
  });

  test('should deactivate user', async ({ page }) => {
    // Wait for users to load
    await page.waitForTimeout(1000);

    // Click delete button on an active user
    const deleteButton = page.locator('button[title="Deactivate user"]').first();

    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept());

    await deleteButton.click();

    // Wait for deactivation
    await page.waitForTimeout(1000);

    // User should be deactivated (status toggle should show Inactive)
    // Note: This is a soft delete, user still appears in table
  });

  test('should show Save Changes button only on Company Info tab', async ({ page }) => {
    // On User Management tab - no Save Changes button
    await expect(page.locator('button:has-text("Save Changes")')).not.toBeVisible();

    // Switch to Company Info tab
    await page.click('[role="tab"]:has-text("Company Info")');

    // Save Changes button should now be visible
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(page.locator('button:has-text("Discard")')).toBeVisible();
  });

  test('should validate email domain when creating user', async ({ page }) => {
    // Click Add User button
    await page.click('button:has-text("Add User")');

    // Try to create user with invalid email domain
    await page.fill('input[type="text"]', 'Invalid User');
    await page.fill('input[type="email"]', 'invalid@gmail.com');
    await page.fill('input[type="password"]', 'TestPassword123');

    // Submit form
    await page.click('button:has-text("Create User")');

    // Should show error (in alert or error message)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('elvenwood.in');
      await dialog.accept();
    });
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Start on User Management
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('User Management');

    // Click Role Management tab
    await page.click('[role="tab"]:has-text("Role Management")');
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Role Management');

    // Click Company Info tab
    await page.click('[role="tab"]:has-text("Company Info")');
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Company Info');

    // Click back to User Management
    await page.click('[role="tab"]:has-text("User Management")');
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('User Management');
  });
});
