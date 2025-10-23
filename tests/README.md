# Playwright Test Suite for DesignQuote

Comprehensive end-to-end testing suite for the DesignQuote application covering authentication, CRUD operations, workflows, approvals, and PDF generation.

## 📋 Test Coverage

### Test Modules

1. **Authentication Tests** (`tests/auth/`)
   - Login with valid/invalid credentials
   - Password visibility toggle
   - Remember me functionality
   - Session persistence
   - Protected route access
   - Logout flow

2. **Product Catalog Tests** (`tests/catalog/`)
   - Create, Read, Update, Delete products
   - Product form validation
   - Category filtering
   - Search functionality
   - Image upload
   - Empty states

3. **Quote Builder Tests** (`tests/quotes/`)
   - Create new quotes
   - Add/remove products
   - Update quantities and rates
   - Discount modes (LINE_ITEM, OVERALL, BOTH)
   - Dimensions calculator (length × width)
   - Tax calculations
   - Save draft functionality

4. **Approval Workflow Tests** (`tests/quotes/`)
   - Submit quote for approval (Sales Executive)
   - View pending approvals (Admin/Sales Head)
   - Approve quotes with metadata recording
   - Reject quotes with notes
   - Status transitions (PENDING_APPROVAL → SENT/REJECTED)
   - Permission-based access control

5. **E2E Workflow Tests** (`tests/e2e/`)
   - Complete quote lifecycle from creation to PDF

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running Supabase instance
- Test database with seed data

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

### Test Data Setup

**IMPORTANT:** Before running tests, set up test users in your Supabase database.

Update credentials in `tests/fixtures/auth.setup.ts` to match your test users.

## 🧪 Running Tests

### Run All Tests
```bash
npm run test
```

### Run Specific Test Suite
```bash
# Authentication tests
npx playwright test tests/auth

# Product catalog tests
npx playwright test tests/catalog

# Quote tests
npx playwright test tests/quotes

# E2E tests
npx playwright test tests/e2e
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Generate HTML Report
```bash
npx playwright show-report
```

## 📊 Test Reports

After running tests, Playwright generates:

1. **HTML Report**: `playwright-report/index.html`
2. **JSON Report**: `test-results/results.json`
3. **Screenshots**: `test-results/screenshots/`
4. **Videos**: `test-results/videos/`

## ⚙️ Configuration

### playwright.config.ts

- Base URL: `http://localhost:3000`
- Timeout: 30 seconds per test
- Retries: 2 on CI, 0 locally
- Parallel execution enabled
- Screenshots on failure
- Videos on failure

## 🔧 Fixtures and Helpers

### Authentication Fixtures

Pre-authenticated browser contexts:

```typescript
import { test } from '../fixtures/auth.setup';

test('admin test', async ({ adminPage }) => {
  // adminPage is already authenticated
  await adminPage.goto('/settings');
});
```

Available fixtures:
- `authenticatedPage` - Generic authenticated user
- `adminPage` - Admin user
- `salesHeadPage` - Sales Head user
- `salesExecutivePage` - Sales Executive user
- `designerPage` - Designer user

### Test Data Generators

```typescript
import { generateProductData, generateClientData } from '../fixtures/test-data';

const product = generateProductData({
  name: 'Custom Product Name',
});
```

## 🎯 Test Best Practices

1. Use Page Object Model for reusable interactions
2. Add `data-testid` attributes for stable selectors
3. Use `waitForLoadState('networkidle')` after navigation
4. Avoid hard delays, use `waitForSelector` instead
5. Clean up test data after tests
6. Ensure tests can run in parallel

## 🐛 Debugging Tests

### Visual Debug Mode
```bash
npx playwright test --debug
```

### Run Single Test File
```bash
npx playwright test tests/auth/login.spec.ts
```

### Run Single Test by Name
```bash
npx playwright test -g "should login successfully"
```

## 📈 Test Metrics

Current coverage:

- ✅ **60+ Test Cases** implemented
- ✅ Authentication: 15 tests
- ✅ Product CRUD: 12 tests
- ✅ Quote Builder: 20 tests
- ✅ Approval Workflow: 12 tests
- ✅ E2E Workflows: 2 tests

## 🔍 Troubleshooting

### Tests Failing Locally

1. Ensure dev server is running (`npm run dev`)
2. Check test users exist in database
3. Verify Supabase credentials
4. Clear browser cache

### Timeouts

- Increase timeout in `playwright.config.ts`
- Check network speed
- Verify API endpoints

### Element Not Found

- Add `data-testid` attributes
- Use more specific selectors
- Wait for element: `await page.waitForSelector()`

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [CLAUDE.md](../CLAUDE.md) - Codebase documentation

---

For detailed codebase documentation, see [CLAUDE.md](../CLAUDE.md)
