import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Get test credentials from environment
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set for E2E tests"
    );
  }

  console.log("🔐 Starting OAuth authentication with test credentials...");

  // Navigate to the home page
  await page.goto("/");

  // Click "Build My Master Profile" to trigger OAuth login
  await page
    .getByRole("button", { name: /build my master profile/i })
    .first()
    .click();

  // Wait for OAuth redirect to Manus login page
  await page.waitForURL("**/oauth/**", { timeout: 10000 });

  console.log("📝 Filling in OAuth login form...");

  // Fill in the OAuth login form
  // Note: These selectors may need adjustment based on actual Manus OAuth UI
  await page.fill('input[type="email"], input[name="email"]', testEmail);
  await page.fill(
    'input[type="password"], input[name="password"]',
    testPassword
  );

  // Click the login/submit button
  await page.click(
    'button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")'
  );

  // Wait for redirect back to the app after successful login
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  console.log("✅ OAuth login successful, waiting for dashboard...");

  // Verify we're authenticated by checking for dashboard elements
  await expect(page.getByText(/dashboard|welcome|profile/i)).toBeVisible({
    timeout: 5000,
  });

  // Save the authenticated state
  await page.context().storageState({ path: authFile });

  console.log("✅ Authentication state saved to", authFile);
});
