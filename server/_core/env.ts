// ENV validation for production - last updated 2026-02-04
// Auth: email-only sign-in at /login
const requiredEnvVars = [
  { key: "DATABASE_URL", description: "MySQL connection string" },
  { key: "JWT_SECRET", description: "Session signing (min 32 chars)" },
] as const;

const OPENAI_PLACEHOLDERS = ["placeholder", "sk-placeholder", "PLACEHOLDER"];

function isPlaceholderOpenAIKey(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v || v.length < 20) return true;
  return OPENAI_PLACEHOLDERS.some(p => v.includes(p.toLowerCase()));
}

/**
 * Verifies required env vars are set. Call at production startup to fail fast.
 * LLM (Resume Roast, Tailor, Scribe) uses only OPENAI_API_KEY.
 */
export function verifyEnv(): void {
  const missing: string[] = [];
  for (const { key, description } of requiredEnvVars) {
    const value = process.env[key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missing.push(`${key} (${description})`);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing or empty required env: ${missing.join(", ")}. Set in .env (see .env.example).`
    );
  }

  // LLM uses only OPENAI_API_KEY (no Forge fallback)
  const openaiKey = process.env.OPENAI_API_KEY ?? "";
  const hasValidLlmKey = openaiKey && !isPlaceholderOpenAIKey(openaiKey);

  if (!hasValidLlmKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  WARNING: OPENAI_API_KEY missing or placeholder. AI features (Resume Roast, Tailor, Scribe) will NOT work. Set OPENAI_API_KEY in Railway variables."
      );
    }
  } else {
    console.log("✓ LLM: OPENAI_API_KEY configured");
  }
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "", // optional; when unset, auth is email-only at /login
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // LLM (Resume Roast, Tailor, Scribe) uses only openaiApiKey + api.openai.com
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  // Forge key/URL only for legacy services (storage, voice, maps, etc.) — not used for LLM
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN ?? "",
  // Development bypass for OAuth testing
  testUserEmail: process.env.TEST_USER_EMAIL ?? "",
  testUserPassword: process.env.TEST_USER_PASSWORD ?? "",
  devBypassAuth: process.env.DEV_BYPASS_AUTH === "true",
};
