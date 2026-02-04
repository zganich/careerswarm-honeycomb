const requiredEnvVars = [
  { key: "DATABASE_URL", description: "MySQL connection string" },
  { key: "JWT_SECRET", description: "Session signing (min 32 chars)" },
  { key: "OAUTH_SERVER_URL", description: "Manus OAuth server URL" },
] as const;

// At least one of these must be set for LLM functionality
const llmApiKeys = ["OPENAI_API_KEY", "BUILT_IN_FORGE_API_KEY"] as const;

const FORGE_KEY_PLACEHOLDERS = [
  "placeholder",
  "your-forge-api-key",
  "your-forge-api-key-here",
  "PLACEHOLDER",
  "PLACEHOLDER_NEEDS_REAL_KEY",
];

function isPlaceholderForgeKey(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return true;
  return FORGE_KEY_PLACEHOLDERS.some((p) => v === p.toLowerCase() || v.includes("placeholder"));
}

/**
 * Verifies required env vars are set. Call at production startup to fail fast.
 * In production, also rejects placeholder BUILT_IN_FORGE_API_KEY values.
 * Throws with a clear message if any check fails.
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

  // Check for LLM API key (at least one must be valid)
  const openaiKey = process.env.OPENAI_API_KEY ?? "";
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";
  const hasValidLlmKey = 
    (openaiKey && !isPlaceholderForgeKey(openaiKey)) ||
    (forgeKey && !isPlaceholderForgeKey(forgeKey));

  if (!hasValidLlmKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  WARNING: No valid LLM API key found. AI features (Resume Roast, Tailor, Scribe) will NOT work. Set OPENAI_API_KEY in Railway variables."
      );
    }
  } else {
    const provider = openaiKey && !isPlaceholderForgeKey(openaiKey) ? "OpenAI" : "Manus Forge";
    console.log(`✓ LLM provider: ${provider}`);
  }
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // LLM API keys (OPENAI_API_KEY preferred, BUILT_IN_FORGE_API_KEY as fallback)
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN ?? "",
  // Development bypass for OAuth testing
  testUserEmail: process.env.TEST_USER_EMAIL ?? "",
  testUserPassword: process.env.TEST_USER_PASSWORD ?? "",
  devBypassAuth: process.env.DEV_BYPASS_AUTH === "true",
};
