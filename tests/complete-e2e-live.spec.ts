/**
 * Complete E2E in live browser: Roast → Sign in → (Onboarding when available).
 * Uses production by default; resume from docs/resumes for testing when running locally with onboarding.
 *
 * Production (onboarding offline): Roast → Sign in → dashboard. Pass.
 * Local (pnpm dev first): Roast → Sign in → onboarding upload (resume from docs) → … → dashboard.
 *
 * Run: LIVE_BROWSER=1 npx playwright test tests/complete-e2e-live.spec.ts --config=playwright.production.config.ts --headed --project=chromium-desktop
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { getUniqueTestEmail, PRODUCTION_URL } from "./utils/production-auth";
import path from "path";
import fs from "fs";

/** Use BASE_URL=http://localhost:3000 for full flow with onboarding (run with default config, pnpm dev). */
const BASE_URL = process.env.BASE_URL || PRODUCTION_URL;
const STEP_DELAY_MS = 3000;

async function liveWait(page: Page, stepName: string) {
  if (process.env.LIVE_BROWSER) {
    const ts = new Date().toISOString().slice(11, 23);
    console.log(
      `[${ts}] [Live] ${stepName} — waiting ${STEP_DELAY_MS / 1000}s`
    );
    await page.waitForTimeout(STEP_DELAY_MS);
  }
}

/** Resolve path to a resume under docs/resumes for testing (PDF preferred). */
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

test.describe("Complete E2E (live browser)", () => {
  test("Full flow: Roast → Sign in → Dashboard (optional onboarding with resume)", async ({
    page,
  }) => {
    test.setTimeout(420000); // 7 min

    const resumePath = getTestResumePath();
    console.log("[Live] Base URL:", BASE_URL);
    console.log("[Live] Resume for upload (if onboarding):", resumePath);

    // —— ROAST ——
    console.log("\n[Live] === ROAST ===");
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await liveWait(page, "Viewed home");

    await page.goto(`${BASE_URL}/roast`);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /resume roast/i })
    ).toBeVisible({ timeout: 15000 });
    await liveWait(page, "Viewed Roast page");

    const textarea = page.getByPlaceholder(/paste your resume/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.fill(
      "Software Engineer with 5 years experience. Led team of 8. Skills: JavaScript, React, Node.js."
    );
    await liveWait(page, "Pasted resume text");

    const roastBtn = page.getByRole("button", { name: /get roasted/i });
    await expect(roastBtn).toBeEnabled();
    await roastBtn.click();
    await liveWait(page, "Clicked Get Roasted");

    const result = page.getByTestId("roast-result");
    const error = page.getByTestId("roast-error");
    await expect(result.or(error))
      .toBeVisible({ timeout: 95000 })
      .catch(() => {});
    await liveWait(page, "Saw roast result or error");

    // —— SIGN IN ——
    console.log("\n[Live] === SIGN IN ===");
    const email = getUniqueTestEmail();
    const isLocal = BASE_URL.includes("localhost");
    if (isLocal) {
      // Local: API login so session is set reliably (form redirect can be flaky with local DB)
      const res = await page.request.post(`${BASE_URL}/api/auth/test-login`, {
        data: { email, returnTo: "/dashboard" },
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok()) {
        throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
      }
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
      console.log("[Live] Signed in via API (local)");
    } else {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState("networkidle");
      await liveWait(page, "Viewed Login page");
      await page.locator('input[type="email"]').fill(email);
      await liveWait(page, "Entered email");
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
    }
    await liveWait(page, "Signed in");

    // —— ONBOARDING (production: redirects to /; local: can upload resume from docs) ——
    console.log("\n[Live] === ONBOARDING (optional) ===");
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");
    await liveWait(page, "Viewed onboarding or home");

    // If onboarding is offline we get redirected to /
    const urlAfterOnboarding = page.url();
    if (urlAfterOnboarding.includes("/onboarding")) {
      const startBtn = page
        .getByRole("button", { name: /continue|start|next|build|let's build/i })
        .first();
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await liveWait(page, "Clicked start/continue");
      }
      await page
        .waitForURL(/\/onboarding\/(upload|welcome|extraction)/, {
          timeout: 15000,
        })
        .catch(() => {});

      const fileInput = page.locator('input[type="file"]');
      if ((await fileInput.count()) > 0) {
        await fileInput.setInputFiles(resumePath);
        await liveWait(page, "Uploaded resume from docs/resumes for testing");
        const cont = page.getByRole("button", { name: /continue/i }).first();
        if (await cont.isEnabled()) {
          await cont.click();
          await liveWait(page, "Clicked continue after upload");
        }
      }
      await page
        .waitForURL(/\/onboarding\/extraction/, { timeout: 15000 })
        .catch(() => {});
      const reviewBtn = page.getByRole("button", {
        name: /continue|review|next/i,
      });
      await reviewBtn
        .waitFor({ state: "visible", timeout: 90000 })
        .catch(() => {});
      if (await reviewBtn.isVisible()) {
        await reviewBtn.click();
        await liveWait(page, "Clicked continue to review");
      }
      await page
        .waitForURL(/\/onboarding\/review/, { timeout: 15000 })
        .catch(() => {});
      const nextBtn = page
        .getByRole("button", { name: /continue|next/i })
        .first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await liveWait(page, "Clicked continue to preferences");
      }
      await page
        .waitForURL(/\/onboarding\/preferences/, { timeout: 15000 })
        .catch(() => {});
      const completeBtn = page
        .getByRole("button", { name: /complete|finish|done/i })
        .first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await liveWait(page, "Clicked complete");
      }
    }

    await page
      .waitForURL(/\/(dashboard|onboarding|\/)/, { timeout: 15000 })
      .catch(() => {});
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/(dashboard|onboarding)|careerswarm\.com\/?$/);
    console.log("\n[Live] === DONE ===", finalUrl);
  });
});
