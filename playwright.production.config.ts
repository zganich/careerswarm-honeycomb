import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Production
 * Targets the live site at https://careerswarm.com
 */
export default defineConfig({
  testDir: './tests',
  
  /* Increased timeouts for production (network latency + AI agent processing) */
  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 30000, // 30s for assertions
  },
  
  /* Run tests sequentially to avoid rate limiting */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry failed tests once */
  retries: 1,
  
  /* Single worker for production to avoid overwhelming the server */
  workers: 1,
  
  /* Reporter configuration - use subdir to avoid clash with test-results */
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-production' }]],
  
  /* Shared settings for all projects */
  use: {
    /* Production base URL */
    baseURL: 'https://careerswarm.com',
    
    /* Collect trace on first retry */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* No extra headers to avoid CORS issues with CDNs */
  },

  /* Configure projects */
  projects: [
    /* Chromium Desktop - Primary test environment */
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Mobile testing */
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: /production-smoke\.spec\.ts/,
    },
  ],

  /* No local web server for production tests */
  webServer: undefined,
});
