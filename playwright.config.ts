import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Optimized for reliability with AI agent latency handling
 */
export default defineConfig({
  testDir: './tests',
  
  /* Increased timeouts to handle AI agent latency */
  timeout: 60000, // 60s per test
  expect: {
    timeout: 15000, // 15s for assertions
  },
  
  /* Run tests in files sequentially due to shared state */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only to avoid masking flaky tests */
  retries: process.env.CI ? 1 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: process.env.CI
    ? [['github'], ['html']]
    : [['list'], ['html']],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on first retry */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and devices */
  /* Tests use auth-bypass (bypassLogin) in beforeEach; no global storageState required */
  projects: [
    /* Chromium Desktop - Primary test environment */
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Chromium Mobile - Mobile responsive testing */
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },

    /* Firefox Desktop - Critical flows only */
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /critical_.*\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server startup
  },
});
