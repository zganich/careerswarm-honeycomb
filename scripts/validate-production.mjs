#!/usr/bin/env tsx
/**
 * Production validation script for CareerSwarm
 * Tests critical systems before deployment
 */

console.log("🔍 Running production validation checks...\n");

let failedChecks = 0;

// 1. Check environment variables
console.log("1️⃣  Checking environment variables...");
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OAUTH_SERVER_URL",
];

const placeholders = [
  "placeholder",
  "your-api-key",
  "your-forge-api-key",
  "your-forge-api-key-here",
  "PLACEHOLDER",
  "PLACEHOLDER_NEEDS_REAL_KEY",
];
function isPlaceholder(value) {
  if (!value || typeof value !== "string") return true;
  const v = value.trim().toLowerCase();
  return (
    placeholders.some(p => v === p.toLowerCase()) || v.includes("placeholder")
  );
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`   ❌ Missing: ${envVar}`);
    failedChecks++;
  } else {
    console.log(`   ✅ ${envVar}`);
  }
}

// LLM uses only OPENAI_API_KEY
const openaiKey = process.env.OPENAI_API_KEY;
const hasValidLlmKey = openaiKey && !isPlaceholder(openaiKey);

if (!hasValidLlmKey) {
  console.error(`   ❌ Missing LLM API key: Set OPENAI_API_KEY in Railway`);
  failedChecks++;
} else {
  console.log(`   ✅ OPENAI_API_KEY`);
}

// 2. Check database connection
console.log("\n2️⃣  Checking database connection...");
try {
  const { getDb } = await import("../server/db.ts");
  const db = await getDb();
  if (db) {
    console.log("   ✅ Database connection successful");
  } else {
    console.error("   ❌ Database connection failed");
    failedChecks++;
  }
} catch (error) {
  console.error(`   ❌ Database error: ${error.message}`);
  failedChecks++;
}

// 3. Check Stripe configuration
console.log("\n3️⃣  Checking Stripe configuration...");
try {
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  });

  // Test API call
  await stripe.products.list({ limit: 1 });
  console.log("   ✅ Stripe API connection successful");
} catch (error) {
  console.error(`   ❌ Stripe error: ${error.message}`);
  failedChecks++;
}

// 4. Check tRPC routers
console.log("\n4️⃣  Checking tRPC routers...");
try {
  const { appRouter } = await import("../server/routers.ts");
  const routers = Object.keys(
    appRouter._def.procedures || appRouter._def.router || {}
  );

  if (routers.length > 0) {
    console.log(`   ✅ tRPC routers loaded (${routers.length} procedures)`);
  } else {
    console.error("   ❌ No tRPC procedures found");
    failedChecks++;
  }
} catch (error) {
  console.error(`   ❌ tRPC router error: ${error.message}`);
  failedChecks++;
}

// 5. Check monitoring (Sentry)
console.log("\n5️⃣  Checking monitoring configuration...");
if (process.env.SENTRY_DSN) {
  console.log("   ✅ SENTRY_DSN configured");
} else {
  console.warn("   ⚠️  SENTRY_DSN not set - error tracking disabled");
  console.log("      → Set up at sentry.io, add DSN to Railway variables");
}

// 6. Check CI/CD test credentials
console.log("\n6️⃣  Checking CI/CD test credentials...");
if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
  console.log("   ✅ E2E test credentials configured");
} else {
  console.warn(
    "   ⚠️  TEST_USER_EMAIL/TEST_USER_PASSWORD not set - E2E tests will skip"
  );
  console.log("      → Add to GitHub Secrets for CI E2E tests");
}

// Summary
console.log("\n" + "=".repeat(50));
if (failedChecks === 0) {
  console.log("✅ All validation checks passed!");
  console.log("🚀 System is ready for production");
  process.exit(0);
} else {
  console.error(`❌ ${failedChecks} check(s) failed`);
  console.error("⚠️  Fix issues before deploying to production");
  process.exit(1);
}
