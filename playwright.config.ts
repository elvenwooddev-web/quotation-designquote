import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Playwright configuration for DesignQuote E2E Testing
 * Tests cover: Auth, CRUD operations, Workflows, PDF generation, Role permissions
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Maximum time each action such as `click()` can take */
    actionTimeout: 10000,
  },

  /* Test timeout */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 5000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs once to authenticate and save session
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts$/,
    },

    // Login tests - run WITHOUT authenticated state (test auth from scratch)
    {
      name: 'auth-tests',
      testMatch: /.*\/(auth|login).*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // No storage state - tests start unauthenticated
      },
      dependencies: ['setup'],
    },

    // Main test project with authenticated state (all other tests)
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts$/,
      testIgnore: /.*\/(auth|login).*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        // Use signed-in state from setup
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Uncomment to test on Firefox and WebKit
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
