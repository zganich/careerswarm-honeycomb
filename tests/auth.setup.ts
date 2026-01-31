import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Click "Build My Master Profile" to trigger OAuth login
  await page.getByRole('button', { name: /build my master profile/i }).first().click();

  // Wait for OAuth redirect to Manus login page
  await page.waitForURL('**/oauth/**', { timeout: 10000 });

  // Note: At this point, the test would need actual OAuth credentials
  // For now, we'll document that manual authentication is required
  // or environment variables need to be set for test credentials

  // Check if we're on the OAuth page
  const isOAuthPage = page.url().includes('oauth') || page.url().includes('login');
  
  if (isOAuthPage) {
    console.log('⚠️  OAuth authentication required');
    console.log('   To run E2E tests, you need to:');
    console.log('   1. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables');
    console.log('   2. Or manually authenticate once and save the session');
    console.log('   3. The auth state will be saved to playwright/.auth/user.json');
    
    // For now, skip the actual login and just create a placeholder auth file
    // In production, this would complete the OAuth flow with test credentials
    throw new Error('OAuth authentication not configured. Please set up test credentials.');
  }

  // If somehow we're already authenticated (shouldn't happen on first run)
  // Wait for redirect back to the app
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Verify we're authenticated by checking for user-specific elements
  await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 5000 });

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
  
  console.log('✅ Authentication state saved to', authFile);
});
