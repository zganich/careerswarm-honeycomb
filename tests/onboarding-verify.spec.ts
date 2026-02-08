/**
 * Onboarding Flow Verification
 *
 * Verifies the full 5-step onboarding flow works as intended:
 * Welcome → Upload → Extraction → Review → Preferences → Dashboard
 *
 * Uses 3-second delays between steps when LIVE_BROWSER=1 for human observation.
 *
 * Run: LIVE_BROWSER=1 npx playwright test tests/onboarding-verify.spec.ts --config=playwright.config.ts --headed --project=chromium-desktop
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const STEP_DELAY_MS = 3000;

function getUniqueTestEmail(): string {
  return `onboard-verify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.careerswarm.com`;
}

/** Wait 3s between steps when LIVE_BROWSER=1 for human observation. */
async function liveWait(page: Page, stepName: string) {
  if (process.env.LIVE_BROWSER) {
    const ts = new Date().toISOString().slice(11, 23);
    console.log(
      `[${ts}] [Onboarding] ${stepName} — waiting ${STEP_DELAY_MS / 1000}s`
    );
    await page.waitForTimeout(STEP_DELAY_MS);
  }
}

function getTestResumePath(): string {
  const dir = path.join(process.cwd(), "docs", "resumes for testing");
  const preferred = [
    "James Knight - Partnerships Lead Resume.pdf",
    "James Knight - Channel Partner Manager -AUVESY-MDT.pdf",
    "James_Knight_Resume_2025.docx",
  ];
  for (const name of preferred) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.cwd(), "tests", "fixtures", "test-resume.pdf");
}

test.describe("Onboarding flow verification", () => {
  test("Full onboarding: Welcome → Upload → Extraction → Review → Preferences → Dashboard", async ({
    page,
  }) => {
    test.setTimeout(300000); // 5 min (extraction can take 30-60s)

    const resumePath = getTestResumePath();
    const email = getUniqueTestEmail();

    console.log("[Onboarding] Base URL:", BASE_URL);
    console.log("[Onboarding] Resume:", resumePath);
    console.log("[Onboarding] Email:", email);

    // —— SIGN IN ——
    console.log("\n[Onboarding] === SIGN IN ===");
    await page.goto(`${BASE_URL}/login?returnTo=/onboarding/welcome`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible({
      timeout: 15000,
    });
    await liveWait(page, "Viewed Login");
    await page.locator('input[type="email"]').fill(email);
    await liveWait(page, "Entered email");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/onboarding\/(upload|welcome|dashboard)/, {
      timeout: 30000,
    });
    await liveWait(page, "Signed in");

    // —— STEP 1: WELCOME (may be skipped — server redirects to Upload) ——
    console.log("\n[Onboarding] === STEP 1–2: WELCOME / UPLOAD ===");
    if (page.url().includes("/onboarding/welcome")) {
      await expect(page.getByText(/step 1 of 5/i)).toBeVisible({
        timeout: 15000,
      });
      const continueBtn = page.getByRole("button", {
        name: /continue to upload|let's build your profile/i,
      });
      await expect(continueBtn).toBeVisible({ timeout: 5000 });
      await continueBtn.click();
      await liveWait(page, "Clicked continue from Welcome");
    }
    await page.goto(`${BASE_URL}/onboarding/upload`);
    await page.waitForLoadState("networkidle");
    await liveWait(page, "Viewed Upload");

    // —— STEP 2: UPLOAD ——
    console.log("\n[Onboarding] === STEP 2: UPLOAD ===");
    await page.goto(`${BASE_URL}/onboarding/upload`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/step 2 of 5/i)).toBeVisible({
      timeout: 15000,
    });
    await liveWait(page, "Viewed Upload");

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles(resumePath);
    await liveWait(page, "Uploaded resume");

    const uploadContinueBtn = page.getByRole("button", {
      name: /continue with \d+ file/i,
    });
    await expect(uploadContinueBtn).toBeEnabled({ timeout: 5000 });
    await uploadContinueBtn.click();
    await liveWait(page, "Clicked continue after upload");

    // —— STEP 3: EXTRACTION ——
    console.log("\n[Onboarding] === STEP 3: EXTRACTION ===");
    await page.waitForURL(/\/onboarding\/extraction/, { timeout: 30000 });
    await expect(page.getByText(/step 3 of 5/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("heading", {
        name: /extraction complete|ai is analyzing|analyzing your resumes/i,
      })
    ).toBeVisible({ timeout: 10000 });
    await liveWait(page, "Viewed Extraction");

    const reviewBtn = page.getByRole("button", {
      name: /review your profile|continue|next/i,
    });
    await reviewBtn.waitFor({ state: "visible", timeout: 90000 });
    await liveWait(page, "Extraction complete");
    await reviewBtn.click();
    await liveWait(page, "Clicked Review Your Profile");

    // —— STEP 4: REVIEW ——
    console.log("\n[Onboarding] === STEP 4: REVIEW ===");
    await page.waitForURL(/\/onboarding\/review/, { timeout: 15000 });
    await expect(page.getByText(/step 4 of 5/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("heading", { name: /review your master profile/i })
    ).toBeVisible({ timeout: 10000 });
    await liveWait(page, "Viewed Review");

    const reviewContinueBtn = page.getByRole("button", {
      name: /looks good, continue/i,
    });
    await expect(reviewContinueBtn).toBeVisible();
    await reviewContinueBtn.click();
    await liveWait(page, "Clicked continue from Review");

    // —— STEP 5: PREFERENCES ——
    console.log("\n[Onboarding] === STEP 5: PREFERENCES ===");
    await page.waitForURL(/\/onboarding\/preferences/, { timeout: 15000 });
    await expect(page.getByText(/step 5 of 5/i)).toBeVisible({
      timeout: 10000,
    });
    await liveWait(page, "Viewed Preferences");

    const targetRolesInput = page
      .locator("#targetRoles")
      .or(page.getByPlaceholder(/e\.g\., head of partnerships/i));
    await targetRolesInput.first().fill("Software Engineer");
    await liveWait(page, "Filled target roles");

    const targetIndustriesInput = page
      .locator("#targetIndustries")
      .or(page.getByPlaceholder(/e\.g\., saas/i));
    await targetIndustriesInput.first().fill("Technology");
    await liveWait(page, "Filled target industries");

    const completeBtn = page.getByRole("button", {
      name: /complete onboarding/i,
    });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();
    await liveWait(page, "Clicked Complete Onboarding");

    // —— DASHBOARD ——
    console.log("\n[Onboarding] === DASHBOARD ===");
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    const finalUrl = page.url();
    expect(finalUrl).toContain("/dashboard");
    await liveWait(page, "Reached Dashboard");

    console.log("\n[Onboarding] === SUCCESS ===");
    console.log("[Onboarding] Final URL:", finalUrl);
  });
});
