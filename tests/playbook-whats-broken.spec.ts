/**
 * PLAY 1: The "What's Actually Broken?" Checklist
 * 
 * Adapted for careerswarm-honeycomb (tRPC/Express)
 * Tests console errors, network requests, and key features
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('PLAY 1: What\'s Actually Broken? (Honeycomb)', () => {
  let consoleErrors: string[] = [];
  let networkErrors: Array<{ url: string; status: number; error: string }> = [];

  test.beforeEach(async ({ page }) => {
    // Capture console errors
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture network errors
    networkErrors = [];
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          error: response.statusText(),
        });
      }
    });
  });

  test('1. Open homepage and check console errors', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    });

    await test.step('Check for console errors', async () => {
      if (consoleErrors.length > 0) {
        console.log('\n🚨 CONSOLE ERRORS FOUND:');
        consoleErrors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }

      await page.screenshot({ path: 'test-results/honeycomb-homepage.png', fullPage: true });
    });

    await test.step('Document console errors', async () => {
      const criticalErrors = consoleErrors.filter(err => 
        err.includes('Failed to load') || 
        err.includes('NetworkError') ||
        err.includes('TypeError') ||
        err.includes('ReferenceError') ||
        err.includes('tRPC') ||
        err.includes('trpc')
      );

      if (criticalErrors.length > 0) {
        console.warn(`⚠️ Found ${criticalErrors.length} critical console errors`);
      } else {
        console.log('✅ No critical console errors');
      }
    });
  });

  test('2. Check Network tab for failed tRPC requests', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Filter for tRPC requests (usually /api/trpc/*)
    const trpcRequests = networkErrors.filter(err => 
      err.url.includes('/api/trpc/') || 
      err.url.includes('trpc') ||
      err.url.includes('/trpc/')
    );

    if (trpcRequests.length > 0) {
      console.log('\n🚨 FAILED tRPC REQUESTS:');
      trpcRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.status} - ${req.url}`);
      });
    } else {
      console.log('✅ No failed tRPC requests');
    }

    // Check for any failed requests
    const failedRequests = networkErrors.filter(err => err.status >= 400);
    
    if (failedRequests.length > 0) {
      console.warn(`⚠️ Found ${failedRequests.length} failed network requests`);
    } else {
      console.log('✅ No failed network requests');
    }
  });

  test('3. Test key features load correctly', async ({ page }) => {
    await test.step('Check homepage loads', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Check for key elements (adjust based on actual homepage)
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log('✅ Homepage loaded');
    });

    await test.step('Check dashboard accessible', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Unauthenticated: may show dashboard with login prompt or redirect to /login
      const url = page.url();
      expect(url).toMatch(/\/dashboard|\/login/);
      console.log('✅ Dashboard route accessible');
    });
  });

  test('4. Generate error report', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      consoleErrors: consoleErrors,
      networkErrors: networkErrors,
      criticalIssues: {
        console: consoleErrors.filter(err => 
          err.includes('Failed') || err.includes('Error') || err.includes('TypeError')
        ),
        network: networkErrors.filter(err => err.status >= 500),
        trpc: networkErrors.filter(err => err.url.includes('trpc') && err.status >= 400),
      },
    };

    console.log('\n📊 ERROR REPORT (Honeycomb):');
    console.log(JSON.stringify(report, null, 2));
  });
});
