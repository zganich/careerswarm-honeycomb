/**
 * Production Smoke Tests
 * 
 * Quick health checks for all public pages on the live site.
 * These tests verify pages load without errors before running deeper E2E tests.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://careerswarm.com';

test.describe('Production Smoke Tests - Public Pages', () => {
  let consoleErrors: string[] = [];
  let networkErrors: Array<{ url: string; status: number; statusText: string }> = [];

  test.beforeEach(async ({ page }) => {
    // Reset error collectors
    consoleErrors = [];
    networkErrors = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture network errors (4xx/5xx)
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });
  });

  test.afterEach(async ({}, testInfo) => {
    // Log errors for debugging
    if (consoleErrors.length > 0) {
      console.log(`\n[${testInfo.title}] Console Errors:`);
      consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    if (networkErrors.length > 0) {
      console.log(`\n[${testInfo.title}] Network Errors:`);
      networkErrors.forEach((err, i) => 
        console.log(`  ${i + 1}. ${err.status} ${err.statusText} - ${err.url}`)
      );
    }
  });

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Page should have content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for main heading or hero section
    const heroSection = page.locator('h1, [class*="hero"], [class*="Hero"]').first();
    await expect(heroSection).toBeVisible({ timeout: 10000 });
    
    // No critical console errors
    const criticalErrors = consoleErrors.filter(err => 
      err.includes('TypeError') || 
      err.includes('ReferenceError') ||
      err.includes('Failed to fetch')
    );
    expect(criticalErrors).toHaveLength(0);
    
    console.log('✅ Homepage loaded successfully');
  });

  test('Dev Login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Should show Dev Login form
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Page title should indicate login
    const heading = page.getByRole('heading', { name: /dev login|sign in|login/i });
    await expect(heading).toBeVisible();
    
    console.log('✅ Dev Login page loaded successfully');
  });

  test('Resume Roast page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/roast`);
    await page.waitForLoadState('networkidle');
    
    // Should show Resume Roast interface
    const heading = page.getByRole('heading', { name: /roast|resume/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Should have file upload or text input
    const uploadArea = page.locator('input[type="file"], textarea, [class*="upload"], [class*="drop"]').first();
    await expect(uploadArea).toBeAttached();
    
    console.log('✅ Resume Roast page loaded successfully');
  });

  test('Pricing page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    
    // Should show pricing tiers
    const heading = page.getByRole('heading', { name: /pricing|plans|subscribe/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Should show Free and Pro tiers
    const freeText = page.getByText(/free/i).first();
    const proText = page.getByText(/pro|\$19|\$\d+/i).first();
    
    await expect(freeText).toBeVisible();
    await expect(proText).toBeVisible();
    
    console.log('✅ Pricing page loaded successfully');
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`);
    await page.waitForLoadState('networkidle');
    
    // Should show FAQ content
    const heading = page.getByRole('heading', { name: /faq|frequently asked|questions|answers/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // FAQ page has clickable buttons for each question (not accordion classes)
    // The FAQ component uses <button> elements with ChevronDown icons
    const faqButtons = page.locator('button').filter({ has: page.locator('svg, [class*="chevron"]') });
    const count = await faqButtons.count();
    
    // Fallback: just check for any buttons or expandable content
    if (count === 0) {
      const anyButtons = page.locator('section button, main button');
      const buttonCount = await anyButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    } else {
      expect(count).toBeGreaterThan(0);
    }
    
    console.log('✅ FAQ page loaded successfully');
  });

  test('Privacy Policy page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);
    await page.waitForLoadState('networkidle');
    
    // Should show privacy policy content
    const heading = page.getByRole('heading', { name: /privacy|policy/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Should have legal content
    const body = page.locator('body');
    const text = await body.textContent();
    expect(text?.toLowerCase()).toMatch(/privacy|data|information|collect/);
    
    console.log('✅ Privacy Policy page loaded successfully');
  });

  test('Terms of Service page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/terms`);
    await page.waitForLoadState('networkidle');
    
    // Should show terms content
    const heading = page.getByRole('heading', { name: /terms|service|conditions/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Should have legal content
    const body = page.locator('body');
    const text = await body.textContent();
    expect(text?.toLowerCase()).toMatch(/terms|service|agreement|use/);
    
    console.log('✅ Terms of Service page loaded successfully');
  });

  test('For Recruiters page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/recruiters`);
    await page.waitForLoadState('networkidle');
    
    // Should show recruiter-focused content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for recruiter-related content
    const text = await body.textContent();
    const hasRecruiterContent = text?.toLowerCase().includes('recruiter') || 
                                text?.toLowerCase().includes('hire') ||
                                text?.toLowerCase().includes('talent');
    expect(hasRecruiterContent).toBeTruthy();
    
    console.log('✅ For Recruiters page loaded successfully');
  });

  test('No critical network errors on homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter for critical errors (5xx only, exclude expected 4xx from missing optional config)
    const criticalNetworkErrors = networkErrors.filter(err => 
      err.status >= 500
    );
    
    // Log 4xx errors for visibility but don't fail (some are expected, like missing monitoring config)
    const warningErrors = networkErrors.filter(err => 
      err.status >= 400 && err.status < 500 && err.url.includes('/api/trpc/')
    );
    
    if (warningErrors.length > 0) {
      console.log('\n⚠️ tRPC 4xx Errors (may be expected):');
      warningErrors.forEach(err => 
        console.log(`  ${err.status} - ${err.url}`)
      );
    }
    
    if (criticalNetworkErrors.length > 0) {
      console.log('\n🚨 Critical Network Errors (5xx):');
      criticalNetworkErrors.forEach(err => 
        console.log(`  ${err.status} - ${err.url}`)
      );
    }
    
    expect(criticalNetworkErrors).toHaveLength(0);
    
    console.log('✅ No critical network errors');
  });
});

test.describe('Production Smoke Tests - Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Homepage is mobile responsive', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Page should render properly on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for mobile menu or navigation
    const mobileNav = page.locator('[class*="mobile"], [class*="hamburger"], [class*="menu"]').first();
    const isNavVisible = await mobileNav.isVisible().catch(() => false);
    
    // Either mobile nav exists or regular content is visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    
    console.log(`✅ Homepage mobile responsive (mobile nav: ${isNavVisible ? 'visible' : 'hidden'})`);
  });

  test('Login page is mobile responsive', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Form should be visible and usable on mobile
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Button should be clickable (not cut off)
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.width).toBeGreaterThan(50);
    
    console.log('✅ Login page mobile responsive');
  });
});
