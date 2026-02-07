import { type Page, expect } from "@playwright/test";

/**
 * Production Auth Utility for E2E Tests
 *
 * Uses email sign-in at /login (always enabled when OAuth is not configured)
 * to authenticate without requiring OAuth.
 */

const PRODUCTION_URL = "https://careerswarm.com";
const DEFAULT_TEST_EMAIL = "e2e-test@careerswarm.com";

/**
 * Login via Dev Login page on production
 *
 * @param page - Playwright Page object
 * @param email - Email address to login with (any email works with Dev Login)
 */
export async function loginViaDevLogin(
  page: Page,
  email: string = DEFAULT_TEST_EMAIL
): Promise<void> {
  // Navigate to dev login page
  await page.goto(`${PRODUCTION_URL}/login`);
  await page.waitForLoadState("networkidle");

  // Fill email field
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(email);

  // Click submit button
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // Wait for redirect to dashboard or successful login
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });

  console.log(`[Production Auth] Logged in as ${email}`);
}

/**
 * Login via API directly (sets cookie via request context, then navigates).
 * More reliable than UI login for tests that need a stable session.
 *
 * @param page - Playwright Page object
 * @param email - Email address to login with
 */
export async function loginViaAPI(
  page: Page,
  email: string = DEFAULT_TEST_EMAIL
): Promise<void> {
  await page.goto(PRODUCTION_URL);

  const response = await page.request.post(
    `${PRODUCTION_URL}/api/auth/test-login`,
    {
      data: { email, returnTo: "/dashboard" },
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok()) {
    throw new Error(
      `Login failed: ${response.status()} ${await response.text()}`
    );
  }

  await page.goto(`${PRODUCTION_URL}/dashboard`);
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  console.log(`[Production Auth] Logged in via API as ${email}`);
}

/**
 * Check if user is currently logged in
 *
 * @param page - Playwright Page object
 * @returns true if logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Try to access dashboard
    await page.goto(`${PRODUCTION_URL}/dashboard`);
    await page.waitForLoadState("networkidle");

    // If we're still on dashboard (not redirected to login), we're logged in
    const url = page.url();
    return url.includes("/dashboard") && !url.includes("/login");
  } catch {
    return false;
  }
}

/**
 * Logout from the application
 *
 * @param page - Playwright Page object
 */
export async function logout(page: Page): Promise<void> {
  // Clear all cookies
  await page.context().clearCookies();

  // Navigate to home to verify logout
  await page.goto(PRODUCTION_URL);

  console.log("[Production Auth] Logged out");
}

/**
 * Get a unique test email for isolated testing
 *
 * @returns Unique email address
 */
export function getUniqueTestEmail(): string {
  const timestamp = Date.now();
  return `e2e-test-${timestamp}@careerswarm.com`;
}

export { PRODUCTION_URL, DEFAULT_TEST_EMAIL };
