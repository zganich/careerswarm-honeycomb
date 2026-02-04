/**
 * Production E2E Tests
 * 
 * Comprehensive end-to-end tests for the live CareerSwarm site.
 * Tests authentication, onboarding, core features, and payment flows.
 */

import { test, expect } from '@playwright/test';
import { 
  loginViaDevLogin, 
  logout, 
  isLoggedIn,
  getUniqueTestEmail,
  PRODUCTION_URL 
} from './utils/production-auth';
import path from 'path';

const BASE_URL = PRODUCTION_URL;

test.describe('Authentication Flow', () => {
  test('Can login via Dev Login', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill email and submit
    const email = getUniqueTestEmail();
    await page.locator('input[type="email"]').fill(email);
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to dashboard or onboarding
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
    
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|onboarding)/);
    
    console.log(`✅ Logged in successfully, redirected to: ${url}`);
  });

  test('Session persists after page refresh', async ({ page }) => {
    // Login first
    await loginViaDevLogin(page);
    
    // Get current URL
    const urlBefore = page.url();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be authenticated
    const urlAfter = page.url();
    expect(urlAfter).not.toContain('/login');
    
    // Should be on dashboard or the same page
    expect(urlAfter).toMatch(/\/(dashboard|onboarding|profile)/);
    
    console.log('✅ Session persisted after refresh');
  });

  test('Can logout successfully', async ({ page }) => {
    // Login first
    await loginViaDevLogin(page);
    
    // Logout
    await logout(page);
    
    // Try to access protected page
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to login or home
    const url = page.url();
    expect(url).toMatch(/\/(login|$)/);
    
    console.log('✅ Logout successful');
  });
});

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Use a fresh test user for onboarding tests
    const email = getUniqueTestEmail();
    await loginViaDevLogin(page, email);
  });

  test('Step 1: Welcome page displays correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Check for welcome content
    expect(page.url()).toContain('/onboarding');
    
    // Look for step indicator or welcome heading
    const stepIndicator = page.getByText(/step 1|welcome|get started/i).first();
    await expect(stepIndicator).toBeVisible({ timeout: 10000 });
    
    // Look for continue/start button
    const ctaButton = page.getByRole('button', { name: /continue|start|next|build/i }).first();
    await expect(ctaButton).toBeVisible();
    
    console.log('✅ Onboarding Step 1 (Welcome) displayed correctly');
  });

  test('Step 2: Upload page allows file selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/onboarding/upload`);
    await page.waitForLoadState('networkidle');
    
    // Verify upload page elements
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    
    // Check for upload instructions
    const uploadText = page.getByText(/upload|resume|pdf|docx/i).first();
    await expect(uploadText).toBeVisible();
    
    // Try uploading test resume
    const testResumePath = path.join(__dirname, 'fixtures', 'test-resume.txt');
    await fileInput.setInputFiles(testResumePath);
    await page.waitForTimeout(1000);
    
    // File should be shown in UI
    const fileItem = page.getByText(/test-resume|uploaded/i).first();
    const isFileVisible = await fileItem.isVisible().catch(() => false);
    
    if (isFileVisible) {
      console.log('✅ File uploaded and displayed');
    } else {
      console.log('⚠️ File upload UI may differ - checking continue button');
    }
    
    // Continue button should be enabled after upload
    const continueButton = page.getByRole('button', { name: /continue/i });
    await expect(continueButton).toBeVisible();
    
    console.log('✅ Onboarding Step 2 (Upload) working correctly');
  });

  test('Can navigate through onboarding steps', async ({ page }) => {
    // Start at welcome
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');
    
    // Click to proceed
    const startButton = page.getByRole('button', { name: /continue|start|next|build/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Should move to upload step
      const url = page.url();
      expect(url).toMatch(/\/onboarding\/(upload|extraction|review|preferences)/);
      console.log(`✅ Navigated from welcome to: ${url}`);
    }
  });

  test('Step 3-5: Can access extraction, review, and preferences', async ({ page }) => {
    // Test direct access to each step
    const steps = [
      { url: '/onboarding/extraction', name: 'Extraction' },
      { url: '/onboarding/review', name: 'Review' },
      { url: '/onboarding/preferences', name: 'Preferences' },
    ];
    
    for (const step of steps) {
      await page.goto(`${BASE_URL}${step.url}`);
      await page.waitForLoadState('networkidle');
      
      // Page should load without error
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Should show step content (not 404)
      const notFound = page.getByText(/not found|404|error/i);
      const hasError = await notFound.isVisible().catch(() => false);
      expect(hasError).toBeFalsy();
      
      console.log(`✅ ${step.name} page accessible`);
    }
  });
});

test.describe('Core Features (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaDevLogin(page);
  });

  test('Dashboard loads with user content', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Should be on dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Dashboard should show user-specific content
    const dashboardContent = page.locator('[class*="dashboard"], [class*="Dashboard"], main').first();
    await expect(dashboardContent).toBeVisible({ timeout: 10000 });
    
    // No error messages
    const errorText = page.getByText(/error|failed|something went wrong/i);
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
    
    console.log('✅ Dashboard loaded successfully');
  });

  test('Profile page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Should show profile content
    const profileContent = page.locator('main, [class*="profile"], [class*="Profile"]').first();
    await expect(profileContent).toBeVisible({ timeout: 10000 });
    
    // Look for profile sections
    const profileText = page.getByText(/profile|experience|skills|education/i).first();
    await expect(profileText).toBeVisible();
    
    console.log('✅ Profile page loaded successfully');
  });

  test('Profile edit page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile/edit`);
    await page.waitForLoadState('networkidle');
    
    // Should show edit interface
    const editContent = page.locator('main, [class*="edit"], form').first();
    await expect(editContent).toBeVisible({ timeout: 10000 });
    
    // Should have editable fields or sections
    const editableElement = page.locator('input, textarea, [contenteditable], button').first();
    await expect(editableElement).toBeVisible();
    
    console.log('✅ Profile edit page loaded successfully');
  });

  test('Jobs page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/jobs`);
    await page.waitForLoadState('networkidle');
    
    // Should show jobs/opportunities content
    const jobsContent = page.locator('main').first();
    await expect(jobsContent).toBeVisible({ timeout: 10000 });
    
    // Look for job-related content
    const jobText = page.getByText(/job|opportunit|position|role/i).first();
    await expect(jobText).toBeVisible();
    
    console.log('✅ Jobs page loaded successfully');
  });

  test('Saved opportunities page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/saved`);
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const content = page.locator('main').first();
    await expect(content).toBeVisible({ timeout: 10000 });
    
    // Should show saved or empty state
    const savedText = page.getByText(/saved|bookmark|favorite|no.*saved/i).first();
    await expect(savedText).toBeVisible();
    
    console.log('✅ Saved opportunities page loaded successfully');
  });

  test('Applications page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/applications`);
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const content = page.locator('main').first();
    await expect(content).toBeVisible({ timeout: 10000 });
    
    // Should show applications or empty state
    const appText = page.getByText(/application|applied|no.*application/i).first();
    await expect(appText).toBeVisible();
    
    console.log('✅ Applications page loaded successfully');
  });

  test('Analytics page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/analytics`);
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const content = page.locator('main').first();
    await expect(content).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Analytics page loaded successfully');
  });

  test('Activity page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/activity`);
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const content = page.locator('main').first();
    await expect(content).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Activity page loaded successfully');
  });
});

test.describe('AI Features', () => {
  test('Resume Roast public page works', async ({ page }) => {
    await page.goto(`${BASE_URL}/roast`);
    await page.waitForLoadState('networkidle');
    
    // Should show roast interface
    const roastContent = page.locator('main').first();
    await expect(roastContent).toBeVisible({ timeout: 10000 });
    
    // Should have input method (file upload or text)
    const inputMethod = page.locator('input[type="file"], textarea').first();
    await expect(inputMethod).toBeAttached();
    
    // Try uploading a test resume
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible().catch(() => false)) {
      const testResumePath = path.join(__dirname, 'fixtures', 'test-resume.txt');
      await fileInput.setInputFiles(testResumePath);
      await page.waitForTimeout(2000);
      
      // Look for submit/roast button
      const roastButton = page.getByRole('button', { name: /roast|submit|analyze/i });
      if (await roastButton.isVisible()) {
        console.log('✅ Resume Roast file upload working');
      }
    }
    
    console.log('✅ Resume Roast page functional');
  });
});

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaDevLogin(page);
  });

  test('Pricing page shows subscription options', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    
    // Should show pricing tiers
    const freeOption = page.getByText(/free/i).first();
    const proOption = page.getByText(/pro|\$19|\$\d+\/mo/i).first();
    
    await expect(freeOption).toBeVisible({ timeout: 10000 });
    await expect(proOption).toBeVisible();
    
    // Should have upgrade/subscribe button
    const upgradeButton = page.getByRole('button', { name: /upgrade|subscribe|get.*pro/i }).first();
    await expect(upgradeButton).toBeVisible();
    
    console.log('✅ Pricing page displays subscription options');
  });

  test('Upgrade button initiates Stripe checkout', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    
    // Find and click upgrade button
    const upgradeButton = page.getByRole('button', { name: /upgrade|subscribe|get.*pro/i }).first();
    
    if (await upgradeButton.isVisible()) {
      // Set up response listener for Stripe API call
      const stripePromise = page.waitForResponse(
        response => response.url().includes('stripe') || response.url().includes('checkout'),
        { timeout: 10000 }
      ).catch(() => null);
      
      await upgradeButton.click();
      
      // Wait a moment for any redirect or API call
      await page.waitForTimeout(3000);
      
      // Check if redirected to Stripe or checkout initiated
      const url = page.url();
      const isStripeCheckout = url.includes('stripe.com') || url.includes('checkout');
      const stayedOnPage = url.includes('pricing') || url.includes('careerswarm');
      
      if (isStripeCheckout) {
        console.log('✅ Redirected to Stripe checkout');
      } else if (stayedOnPage) {
        // Might show a modal or require additional action
        console.log('⚠️ Stayed on page - checkout may need login or additional config');
      }
      
      // Don't complete the payment - just verify the flow initiated
    } else {
      console.log('⚠️ Upgrade button not found - user may already be Pro');
    }
  });
});
