/**
 * Test Data Generators and Helpers
 * Provides functions to generate consistent test data
 */

/**
 * Generate unique identifier for test data
 */
export function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `test_${timestamp}_${random}`;
}

/**
 * Generate test product data
 */
export function generateProductData(overrides = {}) {
  const uniqueId = generateUniqueId();
  return {
    itemCode: `PROD-${uniqueId}`,
    name: `Test Product ${uniqueId}`,
    description: `Test product description for ${uniqueId}`,
    unit: 'pcs',
    baseRate: Math.floor(Math.random() * 10000) + 100,
    categoryId: '',
    imageUrl: '',
    ...overrides,
  };
}

/**
 * Generate test category data
 */
export function generateCategoryData(overrides = {}) {
  const uniqueId = generateUniqueId();
  return {
    name: `Test Category ${uniqueId}`,
    description: `Test category description for ${uniqueId}`,
    ...overrides,
  };
}

/**
 * Generate test client data
 */
export function generateClientData(overrides = {}) {
  const uniqueId = generateUniqueId();
  return {
    name: `Test Client ${uniqueId}`,
    email: `client_${uniqueId}@test.com`,
    phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    address: `Test Address ${uniqueId}`,
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
    ...overrides,
  };
}

/**
 * Generate test quote data
 */
export function generateQuoteData(clientId: string, overrides = {}) {
  const uniqueId = generateUniqueId();
  return {
    title: `Test Quote ${uniqueId}`,
    clientId: clientId,
    discountMode: 'LINE_ITEM',
    taxRate: 18,
    ...overrides,
  };
}

/**
 * Wait for API response helper
 */
export function waitForApiResponse(page: any, urlPattern: string | RegExp) {
  return page.waitForResponse((response: any) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}
