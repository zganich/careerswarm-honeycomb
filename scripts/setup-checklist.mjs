#!/usr/bin/env node
/**
 * CareerSwarm Production Setup Checklist
 * Run: node scripts/setup-checklist.mjs
 */

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           CareerSwarm Production Setup Checklist                 ║
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
   2. Go to Railway → careerswarm-app → Variables
   3. Set OPENAI_API_KEY = sk-...
   4. Click "Redeploy" after saving`,
  },
  {
    name: "SENTRY_DSN",
    check: () => !!process.env.SENTRY_DSN,
    status: "HIGH",
    instructions: `
   1. Create account at https://sentry.io
   2. Create new project → Select "Express"
   3. Copy the DSN from Settings → Client Keys
   4. Go to Railway → careerswarm-app → Variables
   5. Set SENTRY_DSN = https://xxx@xxx.ingest.sentry.io/xxx
   6. Redeploy`,
  },
  {
    name: "GitHub Secrets (CI E2E)",
    check: () => {
      // Can't check GitHub secrets from here, so check local env
      return process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD;
    },
    status: "HIGH",
    instructions: `
   1. Go to GitHub → Repository → Settings → Secrets → Actions
   2. Add secret: TEST_USER_EMAIL = (a valid test user email)
   3. Add secret: TEST_USER_PASSWORD = (the test user's password)
   Note: Create a test user account at careerswarm.com first`,
  },
];

let critical = 0;
let warnings = 0;

for (const item of checks) {
  const passed = item.check();
  const icon = passed ? "✅" : item.status === "CRITICAL" ? "❌" : "⚠️";

  console.log(`${icon} ${item.name} [${item.status}]`);

  if (!passed) {
    console.log(item.instructions);
    console.log("");
    if (item.status === "CRITICAL") critical++;
    else warnings++;
  }
}

console.log(`
══════════════════════════════════════════════════════════════════
`);

if (critical === 0 && warnings === 0) {
  console.log("🎉 All production setup complete!");
} else {
  if (critical > 0) {
    console.log(`❌ ${critical} CRITICAL item(s) need attention`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} optional item(s) recommended`);
  }
}

console.log(`
Quick Links:
  • Railway Dashboard: https://railway.app/dashboard
  • Sentry Dashboard:  https://sentry.io
  • GitHub Secrets:    https://github.com/YOUR_ORG/careerswarm-honeycomb/settings/secrets/actions
  • Manus Dashboard:   https://manus.app (for Forge API key)
`);
