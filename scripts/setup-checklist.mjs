#!/usr/bin/env node
/**
 * CareerSwarm Production Config Checklist
 * Aligned with docs/CRITICAL_SETUP_CHECKLIST.md (Phase 4).
 * Run: pnpm run config:check   (loads .env from project root)
 * For production: set variables in Railway → redeploy; this script checks local .env.
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
config({ path: path.join(root, ".env") });

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           CareerSwarm Production Config Checklist                 ║
║           (Phase 4 — see docs/CRITICAL_SETUP_CHECKLIST.md)        ║
╚══════════════════════════════════════════════════════════════════╝
`);

const checks = [
  {
    name: "OPENAI_API_KEY",
    check: () => {
      const key = process.env.OPENAI_API_KEY || "";
      return key.length >= 20 && !key.toLowerCase().includes("placeholder");
    },
    status: "CRITICAL",
    instructions: `
   1. Get your API key from https://platform.openai.com/api-keys
   2. Railway → careerswarm-app → Variables → OPENAI_API_KEY = sk-...
   3. railway redeploy`,
  },
  {
    name: "SENTRY_DSN",
    check: () => !!process.env.SENTRY_DSN?.trim(),
    status: "HIGH",
    instructions: `
   1. pnpm run sentry:login (use project careerswarm-backend)
   2. Get DSN: https://careerswarm.sentry.io → careerswarm-backend → Client Keys (DSN)
   3. Railway → Variables → SENTRY_DSN = https://xxx@xxx.ingest.sentry.io/xxx
   4. railway redeploy`,
  },
  {
    name: "GitHub Secrets (CI E2E)",
    check: () =>
      !!process.env.TEST_USER_EMAIL?.trim() &&
      !!process.env.TEST_USER_PASSWORD?.trim(),
    status: "HIGH",
    instructions: `
   1. GitHub → repo → Settings → Secrets and variables → Actions
   2. Add TEST_USER_EMAIL and TEST_USER_PASSWORD (create test user at careerswarm.com first)`,
  },
  {
    name: "S3 storage (onboarding / Assembler)",
    check: () =>
      !!process.env.S3_BUCKET?.trim() &&
      !!process.env.S3_ACCESS_KEY_ID?.trim() &&
      !!process.env.S3_SECRET_ACCESS_KEY?.trim(),
    status: "REQUIRED for upload",
    instructions: `
   1. Create S3-compatible bucket (e.g. Cloudflare R2, AWS S3, B2)
   2. Railway → Variables: S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
   3. Optional: S3_ENDPOINT (R2/B2), S3_REGION
   4. railway redeploy`,
  },
  {
    name: "Stripe Pro (checkout)",
    check: () =>
      !!process.env.STRIPE_SECRET_KEY?.trim() &&
      !!process.env.STRIPE_PRO_PRICE_ID?.trim(),
    status: "OPTIONAL",
    instructions: `
   1. Stripe Dashboard → API keys → Secret key → Railway STRIPE_SECRET_KEY
   2. Products → Add product → $29/month → copy Price ID → Railway STRIPE_PRO_PRICE_ID
   3. railway redeploy`,
  },
  {
    name: "Redis (GTM worker)",
    check: () =>
      !!process.env.REDIS_URL?.trim() || !!process.env.REDIS_HOST?.trim(),
    status: "OPTIONAL",
    instructions: `
   1. Create Redis (e.g. Railway Redis, Upstash)
   2. Railway → Variables: REDIS_URL (or REDIS_HOST + REDIS_PORT)
   3. railway redeploy`,
  },
];

let critical = 0;
let warnings = 0;

for (const item of checks) {
  const passed = item.check();
  const icon = passed
    ? "✅"
    : item.status === "CRITICAL"
      ? "❌"
      : item.status === "REQUIRED for upload"
        ? "⚠️"
        : "○";

  console.log(`${icon} ${item.name} [${item.status}]`);

  if (!passed) {
    console.log(item.instructions);
    console.log("");
    if (item.status === "CRITICAL") critical++;
    else if (item.status === "REQUIRED for upload" || item.status === "HIGH")
      warnings++;
  }
}

console.log(`
══════════════════════════════════════════════════════════════════
`);

if (critical === 0 && warnings === 0) {
  console.log("🎉 All production config items present (or optional skipped).");
} else {
  if (critical > 0) {
    console.log(`❌ ${critical} CRITICAL item(s) need attention`);
  }
  if (warnings > 0) {
    console.log(
      `⚠️  ${warnings} recommended/required item(s) missing (see above)`
    );
  }
}

console.log(`
Quick links: Railway dashboard, Sentry (careerswarm-backend), GitHub Secrets.
Full steps: docs/CRITICAL_SETUP_CHECKLIST.md
`);

process.exit(critical > 0 ? 1 : 0);
