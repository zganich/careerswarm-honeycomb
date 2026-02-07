import { type Page } from "@playwright/test";
import { SignJWT } from "jose";

/**
 * Auth Bypass Utility for E2E Tests
 *
 * Creates a mock session cookie (JWT) so tests can run without the real login flow.
 * The cookie is signed with HS256 and contains openId, appId, name, exp.
 */

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// Test user credentials (matches what the app expects)
const TEST_USER = {
  openId: "test-user-playwright-123",
  appId: process.env.VITE_APP_ID || "careerswarm-test",
  name: "Playwright Test User",
  email: "playwright@test.com",
};

/**
 * Create a mock JWT session token for testing
 * This mimics the token created by server/_core/sdk.ts createSessionToken()
 */
async function createMockSessionToken(): Promise<string> {
  const JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-for-playwright";
  const secretKey = new TextEncoder().encode(JWT_SECRET);

  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

  const token = await new SignJWT({
    openId: TEST_USER.openId,
    appId: TEST_USER.appId,
    name: TEST_USER.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);

  return token;
}

/**
 * Bypass OAuth login by injecting a mock session cookie
 *
 * Usage in tests:
 * ```typescript
 * import { bypassLogin } from './utils/auth-bypass';
 *
 * test('should access protected page', async ({ page }) => {
 *   await bypassLogin(page);
 *   await page.goto('http://localhost:3000/dashboard');
 *   // Test continues with authenticated session
 * });
 * ```
 *
 * @param page - Playwright Page object
 * @param baseURL - Base URL of the application (default: http://localhost:3000)
 */
export async function bypassLogin(
  page: Page,
  baseURL: string = "http://localhost:3000"
): Promise<void> {
  // Create mock session token
  const sessionToken = await createMockSessionToken();

  // Navigate to base URL first (required to set cookies)
  await page.goto(baseURL);

  // Inject session cookie
  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      expires: Math.floor((Date.now() + ONE_YEAR_MS) / 1000),
    },
  ]);

  console.log(`[Auth Bypass] Injected session cookie for ${TEST_USER.name}`);
}

/**
 * Clear authentication session (logout)
 *
 * @param page - Playwright Page object
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
  console.log("[Auth Bypass] Cleared session cookies");
}

/**
 * Get test user credentials
 * Useful for assertions that check user-specific data
 */
export function getTestUser() {
  return TEST_USER;
}
