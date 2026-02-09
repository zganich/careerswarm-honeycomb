#!/usr/bin/env node
/**
 * Phase 4: Set Railway environment variables via Public API.
 * Use when you have an API token and want to push vars without the dashboard.
 *
 * Required env:
 *   RAILWAY_API_TOKEN    - From https://railway.com/account/tokens (account or workspace)
 *   RAILWAY_PROJECT_ID   - Project ID (railway status or Cmd+K in dashboard)
 *   RAILWAY_ENVIRONMENT_ID - Environment ID (e.g. production)
 *   RAILWAY_SERVICE_ID   - Service ID for careerswarm-app (not MySQL)
 *
 * Variables to set: pass as env vars; script pushes the Phase 4 vars that are set.
 * Example: STRIPE_SECRET_KEY=sk_... STRIPE_PRO_PRICE_ID=price_... node scripts/phase4-railway-vars.mjs
 *
 * Or load from .env: script loads dotenv from repo root, so set vars in .env and run.
 *
 * Docs: https://docs.railway.com/integrations/api/manage-variables
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
config({ path: path.join(root, ".env") });

const RAILWAY_GRAPHQL = "https://backboard.railway.com/graphql/v2";

const PHASE4_VAR_NAMES = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRO_PRICE_ID",
  "SENTRY_DSN",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_ENDPOINT",
  "S3_REGION",
  "REDIS_URL",
];

function getEnvVarsToPush() {
  const vars = {};
  for (const name of PHASE4_VAR_NAMES) {
    const value = process.env[name];
    if (value != null && String(value).trim() !== "") {
      vars[name] = String(value).trim();
    }
  }
  return vars;
}

async function main() {
  const token = process.env.RAILWAY_API_TOKEN?.trim();
  const projectId = process.env.RAILWAY_PROJECT_ID?.trim();
  const environmentId = process.env.RAILWAY_ENVIRONMENT_ID?.trim();
  const serviceId = process.env.RAILWAY_SERVICE_ID?.trim();

  if (!token || !projectId || !environmentId || !serviceId) {
    console.error("Phase 4 Railway vars script: missing required env.");
    console.error(
      "Set: RAILWAY_API_TOKEN, RAILWAY_PROJECT_ID, RAILWAY_ENVIRONMENT_ID, RAILWAY_SERVICE_ID"
    );
    console.error(
      "Get IDs: railway status, or Railway dashboard Cmd+K → copy project/service/environment ID."
    );
    console.error("Token: https://railway.com/account/tokens");
    process.exit(1);
  }

  const variables = getEnvVarsToPush();
  if (Object.keys(variables).length === 0) {
    console.error(
      "No Phase 4 variables set in env. Set at least one of:",
      PHASE4_VAR_NAMES.join(", ")
    );
    process.exit(1);
  }

  const mutation = `
    mutation VariableCollectionUpsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }
  `;
  const input = {
    projectId,
    environmentId,
    serviceId,
    variables,
    replace: false,
  };

  const res = await fetch(RAILWAY_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  if (!res.ok) {
    console.error("Railway API error:", res.status, res.statusText);
    const text = await res.text();
    console.error(text.slice(0, 500));
    process.exit(1);
  }

  const json = await res.json();
  if (json.errors?.length) {
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }

  console.log(
    "Set",
    Object.keys(variables).length,
    "variable(s):",
    Object.keys(variables).join(", ")
  );
  console.log("Redeploy to apply: railway redeploy");
}

main();
