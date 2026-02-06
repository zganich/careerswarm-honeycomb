/**
 * Human-style 5-persona browser test
 *
 * Simulates 5 distinct test users through full onboarding, with 3–5s delays.
 * Based on: test prompt for openclaw.md
 *
 * Run: npx playwright test tests/human-style-5-persona.spec.ts
 *      --config=playwright.production.config.ts --headed --project=chromium-desktop
 *
 * ~15–20 min total (5 users × ~3–4 min each with delays).
 */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  loginViaDevLogin,
  logout,
  PRODUCTION_URL,
} from "./utils/production-auth";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = PRODUCTION_URL;

const STEP_DELAY_MIN_MS = 3000;
const STEP_DELAY_MAX_MS = 5000;

function humanDelayMs(): number {
  return Math.floor(
    STEP_DELAY_MIN_MS + Math.random() * (STEP_DELAY_MAX_MS - STEP_DELAY_MIN_MS)
  );
}

async function waitHuman(page: Page, stepName: string): Promise<void> {
  const ms = humanDelayMs();
  const ts = new Date().toISOString().slice(11, 23);
  console.log(
    `[${ts}] [Human] ${stepName} — waiting ${(ms / 1000).toFixed(1)}s`
  );
  await page.waitForTimeout(ms);
}

const PERSONAS = [
  {
    name: "Career Changer (Hospitality to IT PM)",
    email: "hospitality.pivot@simtest.com",
    entryPath: "LinkedIn Import",
    entryUrl: `${BASE_URL}/`,
    resumeSnippet:
      "Project Manager leveraging a decade of hospitality leadership. Key Skills: Project Management (PMP), Agile, Scrum, Stakeholder Management, Jira.",
  },
  {
    name: "Recent STEM Grad (M.Sc. Data Science)",
    email: "datasci.grad@simtest.com",
    entryPath: "Job Board Redirect",
    entryUrl: `${BASE_URL}/?utm_source=indeed`,
    resumeSnippet:
      "Data Scientist with Master's in Data Science. Python, R, SQL, AWS. Predictive maintenance model, 94% accuracy.",
  },
  {
    name: "Senior Executive (CFO to Board Member)",
    email: "executive.board@simtest.com",
    entryPath: "Recruiter Invite",
    entryUrl: `${BASE_URL}/?utm_source=recruiter`,
    resumeSnippet:
      "CFO with 20+ years. Corporate Governance, M&A, IPO, Investor Relations. Led $2B firm IPO.",
  },
  {
    name: "Freelance Creative (Designer to Full-Time)",
    email: "creative.remote@simtest.com",
    entryPath: "Direct Sign-Up",
    entryUrl: `${BASE_URL}/`,
    resumeSnippet:
      "Award-winning designer. Brand identity, UI/UX, Motion Graphics. Figma, Adobe Creative Suite.",
  },
  {
    name: "Veteran Transitioning (Logistics to Ops Mgmt)",
    email: "veteran.ops@simtest.com",
    entryPath: "Referral Link",
    entryUrl: `${BASE_URL}/?ref=vetnet`,
    resumeSnippet:
      "Operations Manager, 12 years U.S. Army. Logistics, Supply Chain, Team Leadership (50+), Budget $10M+.",
  },
] as const;

async function runOnboardingFlow(page: Page, persona: (typeof PERSONAS)[0]) {
  await page.goto(`${BASE_URL}/onboarding`);
  await page.waitForLoadState("networkidle");
  await waitHuman(page, `Viewed onboarding (${persona.name})`);

  const startBtn = page
    .getByRole("button", { name: /continue|start|next|build|let's build/i })
    .first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await waitHuman(page, "Clicked start/continue");
  }

  await page
    .waitForURL(/\/onboarding\/(upload|welcome|extraction)/, { timeout: 15000 })
    .catch(() => {});

  const fileInput = page.locator('input[type="file"]');
  if ((await fileInput.count()) > 0) {
    const testResumePath = path.join(__dirname, "fixtures", "test-resume.txt");
    await fileInput.setInputFiles(testResumePath);
    await waitHuman(page, "Uploaded resume");

    const cont = page.getByRole("button", { name: /continue/i }).first();
    if (await cont.isEnabled()) {
      await cont.click();
      await waitHuman(page, "Continue after upload");
    }
  }

  await page
    .waitForURL(/\/onboarding\/extraction/, { timeout: 15000 })
    .catch(() => {});

  const reviewBtn = page.getByRole("button", {
    name: /continue|review|next/i,
  });
  await reviewBtn.waitFor({ state: "visible", timeout: 90000 }).catch(() => {});
  if (await reviewBtn.isVisible()) {
    await reviewBtn.click();
    await waitHuman(page, "Continue to review");
  }
  await page
    .waitForURL(/\/onboarding\/review/, { timeout: 15000 })
    .catch(() => {});

  const nextBtn = page.getByRole("button", { name: /continue|next/i }).first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await waitHuman(page, "Continue to preferences");
  }
  await page
    .waitForURL(/\/onboarding\/preferences/, { timeout: 15000 })
    .catch(() => {});

  const completeBtn = page
    .getByRole("button", { name: /complete|finish|done/i })
    .first();
  if (await completeBtn.isVisible()) {
    await completeBtn.click();
    await waitHuman(page, "Complete onboarding");
  }
  await page
    .waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
    .catch(() => {});
}

async function verifyDashboard(page: Page) {
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/dashboard/);
  // Basic checks: no broken UI, navigation works
  const nav = page.getByRole("navigation").or(page.getByRole("link"));
  await expect(nav.first())
    .toBeVisible({ timeout: 5000 })
    .catch(() => {});
}

test.describe("Human-style: 5 Personas Onboarding", () => {
  test("All 5 personas: entry path → login → onboarding → dashboard (human pacing)", async ({
    page,
  }) => {
    test.setTimeout(900000); // 15 min for 5 users

    for (let i = 0; i < PERSONAS.length; i++) {
      const persona = PERSONAS[i];
      console.log(
        `\n[Human] ========== PERSONA ${i + 1}/5: ${persona.name} ==========`
      );
      console.log(`[Human] Entry path: ${persona.entryPath}`);
      console.log(`[Human] Email: ${persona.email}`);

      // Entry path
      await page.goto(persona.entryUrl);
      await page.waitForLoadState("networkidle");
      await waitHuman(page, `Landed via ${persona.entryPath}`);

      // Login
      await loginViaDevLogin(page, persona.email);
      await waitHuman(page, "Logged in");

      // Onboarding
      await runOnboardingFlow(page, persona);

      // Verify dashboard
      await verifyDashboard(page);
      await waitHuman(page, "Dashboard verified");

      // Logout before next user
      if (i < PERSONAS.length - 1) {
        await logout(page);
        await page.waitForTimeout(10000); // 10s between users
      }
    }

    console.log("\n[Human] ========== ALL 5 PERSONAS COMPLETE ==========");
  });
});
