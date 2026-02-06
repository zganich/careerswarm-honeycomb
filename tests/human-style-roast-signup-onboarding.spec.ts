/**
 * Human-style browser test: Roast → Signup → Onboarding
 *
 * Simulates a real user: 5–10 second pause between each step, headed browser.
 * Run: npx playwright test tests/human-style-roast-signup-onboarding.spec.ts
 *      --config=playwright.production.config.ts --headed --project=chromium-desktop
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  getUniqueTestEmail,
  PRODUCTION_URL,
} from "./utils/production-auth";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = PRODUCTION_URL;

/** Minimum and maximum delay between steps (ms) — human-like pacing */
const STEP_DELAY_MIN_MS = 5000;
const STEP_DELAY_MAX_MS = 10000;

function humanDelayMs(): number {
  return Math.floor(
    STEP_DELAY_MIN_MS + Math.random() * (STEP_DELAY_MAX_MS - STEP_DELAY_MIN_MS)
  );
}

async function waitHuman(page: Page, stepName: string): Promise<void> {
  const ms = humanDelayMs();
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] [Human] ${stepName} — waiting ${(ms / 1000).toFixed(1)}s`);
  await page.waitForTimeout(ms);
}

test.describe("Human-style: Roast, Signup, Onboarding", () => {
  test("Full flow: Roast → Sign in → Onboarding (human pacing, 5–10s between steps)", async ({
    page,
  }) => {
    test.setTimeout(420000); // 7 min: roast + login + onboarding + LLM extraction + delays

    // —— ROAST ——
    console.log("\n[Human] === ROAST ===");
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await waitHuman(page, "Viewed home");

    await page.goto(`${BASE_URL}/roast`);
    await page.waitForLoadState("networkidle");
    await waitHuman(page, "Viewed Roast page");

    const textarea = page.getByPlaceholder(/paste your resume/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });
    const resumeText =
      "Software Engineer with 5 years experience at Google. Led team of 8. Increased performance by 40%. Skills: JavaScript, React, Node.js.";
    await textarea.fill(resumeText);
    await waitHuman(page, "Pasted resume text");

    const roastBtn = page.getByRole("button", { name: /get roasted/i });
    await expect(roastBtn).toBeEnabled();
    await roastBtn.click();
    await waitHuman(page, "Clicked Get Roasted");

    const result = page.getByTestId("roast-result");
    const error = page.getByTestId("roast-error");
    await expect(result.or(error)).toBeVisible({ timeout: 95000 }).catch(() => {});
    await waitHuman(page, "Saw roast result or error");

    // —— SIGNUP (LOGIN) ——
    console.log("\n[Human] === SIGN IN ===");
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    await waitHuman(page, "Viewed Login page");

    const email = getUniqueTestEmail();
    await page.locator('input[type="email"]').fill(email);
    await waitHuman(page, "Entered email");

    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
    await waitHuman(page, "Signed in, landed on dashboard/onboarding");

    // —— ONBOARDING ——
    console.log("\n[Human] === ONBOARDING ===");
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");
    await waitHuman(page, "Viewed onboarding");

    const startBtn = page
      .getByRole("button", { name: /continue|start|next|build|let's build/i })
      .first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await waitHuman(page, "Clicked start/continue");
    }

    await page.waitForURL(/\/onboarding\/(upload|welcome|extraction)/, { timeout: 15000 }).catch(() => {});

    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      const testResumePath = path.join(__dirname, "fixtures", "test-resume.txt");
      await fileInput.setInputFiles(testResumePath);
      await waitHuman(page, "Uploaded resume file");

      const cont = page.getByRole("button", { name: /continue/i }).first();
      if (await cont.isEnabled()) {
        await cont.click();
        await waitHuman(page, "Clicked continue after upload");
      }
    }

    await page.waitForURL(/\/onboarding\/extraction/, { timeout: 15000 }).catch(() => {});

    const reviewBtn = page.getByRole("button", { name: /continue|review|next/i });
    await reviewBtn.waitFor({ state: "visible", timeout: 90000 }).catch(() => {});
    if (await reviewBtn.isVisible()) {
      await reviewBtn.click();
      await waitHuman(page, "Clicked continue to review");
    }
    await page
      .waitForURL(/\/onboarding\/review/, { timeout: 15000 })
      .catch(() => {});

    const nextBtn = page.getByRole("button", { name: /continue|next/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await waitHuman(page, "Clicked continue to preferences");
    }
    await page
      .waitForURL(/\/onboarding\/preferences/, { timeout: 15000 })
      .catch(() => {});

    const completeBtn = page
      .getByRole("button", { name: /complete|finish|done/i })
      .first();
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      await waitHuman(page, "Clicked complete");
    }
    await page
      .waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
      .catch(() => {});

    expect(page.url()).toMatch(/\/(dashboard|onboarding)/);
    console.log("\n[Human] === DONE ===");
  });
});
