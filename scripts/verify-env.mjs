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

// Aligned with server/_core/env.ts and docs (email-only auth; OAuth optional)
const required = [
  { key: "DATABASE_URL", description: "MySQL connection string" },
  { key: "JWT_SECRET", description: "Session signing (min 32 chars)" },
  {
    key: "OPENAI_API_KEY",
    description: "OpenAI API key for LLM (Resume Roast, Tailor, Scribe)",
  },
];

const optional = [
  "OAUTH_SERVER_URL",
  "VITE_OAUTH_PORTAL_URL",
  "VITE_APP_ID",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID",
  "AWS_ACCESS_KEY_ID",
  "AWS_S3_BUCKET",
  "SENTRY_DSN",
];

function isPlaceholderOpenAIKey(value) {
  if (!value || typeof value !== "string") return true;
  const v = value.trim().toLowerCase();
  if (!v || v.length < 20) return true;
  return v.includes("placeholder");
}

let failed = false;
for (const { key, description } of required) {
  const value = process.env[key];
  if (!value || (typeof value === "string" && value.trim() === "")) {
    console.error(`Missing or empty: ${key} (${description})`);
    failed = true;
  } else if (key === "OPENAI_API_KEY" && isPlaceholderOpenAIKey(value)) {
    console.error(
      `${key}: set to a placeholder. Use a real OpenAI API key (see .env.example).`
    );
    failed = true;
  }
}
if (failed) {
  console.error("\nSet these in .env (see .env.example). Then run again.");
  process.exit(1);
}

const missingOptional = optional.filter(k => !process.env[k]?.trim());
if (missingOptional.length > 0) {
  console.warn("Optional env not set:", missingOptional.join(", "));
}

console.log("Required env vars OK.");
process.exit(0);
