/**
 * Common Test Helpers
 * Utility functions for Playwright tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Helper to wait for navigation
 */
export async function waitForNavigation(page: Page, url: string) {
  await page.waitForURL(url, { timeout: 10000 });
}

/**
 * Helper to fill form field
 */
export async function fillFormField(page: Page, label: string, value: string) {
  await page.fill(`input[id*='${label.toLowerCase()}'], input[name*='${label.toLowerCase()}']`, value);
}

/**
 * Helper to click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text('${text}')`);
}

/**
 * Helper to verify toast/notification
 */
export async function verifyNotification(page: Page, message: string) {
  const notification = page.locator(`text=${message}`);
  await expect(notification).toBeVisible();
}

/**
 * Helper to verify table row exists
 */
export async function verifyTableRowExists(page: Page, text: string) {
  const row = page.locator(`tr:has-text('${text}')`);
  await expect(row).toBeVisible();
}

/**
 * Helper to delete item from table
 */
export async function deleteTableItem(page: Page, itemText: string) {
  const row = page.locator(`tr:has-text('${itemText}')`);
  await row.locator('button[aria-label*=delete], button:has-text(Delete)').click();
  
  // Confirm deletion in dialog
  await clickButton(page, 'Confirm');
}

/**
 * Helper to wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png` });
}

/**
 * Helper to verify API response
 */
export async function verifyApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  expectedStatus: number
) {
  const response = await page.waitForResponse((resp) => {
    const url = resp.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern) && resp.status() === expectedStatus;
    }
    return urlPattern.test(url) && resp.status() === expectedStatus;
  });
  return response;
}

/**
 * Helper to upload file
 */
export async function uploadFile(page: Page, inputSelector: string, filePath: string) {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Helper to select from dropdown
 */
export async function selectDropdownOption(page: Page, label: string, value: string) {
  await page.selectOption(`select[id*='${label.toLowerCase()}'], select[name*='${label.toLowerCase()}']`, value);
}

/**
 * Helper to check checkbox
 */
export async function checkCheckbox(page: Page, label: string) {
  await page.check(`input[type='checkbox'][id*='${label.toLowerCase()}']`);
}

/**
 * Helper to uncheck checkbox
 */
export async function uncheckCheckbox(page: Page, label: string) {
  await page.uncheck(`input[type='checkbox'][id*='${label.toLowerCase()}']`);
}
