#!/usr/bin/env node
/**
 * Verify required environment variables for CareerSwarm.
 * Loads .env via dotenv; exits 1 if any required var is missing or empty.
 * Usage: node scripts/verify-env.mjs
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

config({ path: path.join(root, ".env") });

const required = [
  { key: "DATABASE_URL", description: "MySQL connection string" },
  { key: "JWT_SECRET", description: "Session signing (min 32 chars)" },
  { key: "OAUTH_SERVER_URL", description: "Manus OAuth server URL" },
  { key: "BUILT_IN_FORGE_API_KEY", description: "Manus Forge API key for LLM" },
];

const optional = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID",
  "AWS_ACCESS_KEY_ID",
  "AWS_S3_BUCKET",
  "SENTRY_DSN",
];

let failed = false;
for (const { key, description } of required) {
  const value = process.env[key];
  if (!value || (typeof value === "string" && value.trim() === "")) {
    console.error(`Missing or empty: ${key} (${description})`);
    failed = true;
  }
}
if (failed) {
  console.error("\nSet these in .env (see .env.example). Then run again.");
  process.exit(1);
}

const missingOptional = optional.filter((k) => !process.env[k]?.trim());
if (missingOptional.length > 0) {
  console.warn("Optional env not set:", missingOptional.join(", "));
}

console.log("Required env vars OK.");
process.exit(0);
