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
  "BUILT_IN_FORGE_API_KEY",
];

const forgePlaceholders = [
  "placeholder",
  "your-forge-api-key",
  "your-forge-api-key-here",
  "PLACEHOLDER",
  "PLACEHOLDER_NEEDS_REAL_KEY",
];
function isPlaceholderForgeKey(value) {
  if (!value || typeof value !== "string") return true;
  const v = value.trim().toLowerCase();
  return forgePlaceholders.some((p) => v === p.toLowerCase()) || v.includes("placeholder");
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`   ❌ Missing: ${envVar}`);
    failedChecks++;
  } else if (envVar === "BUILT_IN_FORGE_API_KEY" && isPlaceholderForgeKey(process.env[envVar])) {
    console.error(`   ❌ ${envVar}: set to a placeholder. Set a real Manus Forge API key for production.`);
    failedChecks++;
  } else {
    console.log(`   ✅ ${envVar}`);
  }
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
  const routers = Object.keys(appRouter._def.procedures || appRouter._def.router || {});
  
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
