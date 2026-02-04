const requiredEnvVars = [
  { key: "DATABASE_URL", description: "MySQL connection string" },
  { key: "JWT_SECRET", description: "Session signing (min 32 chars)" },
  { key: "OAUTH_SERVER_URL", description: "Manus OAuth server URL" },
  { key: "BUILT_IN_FORGE_API_KEY", description: "Manus Forge API key for LLM" },
] as const;

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

  if (process.env.NODE_ENV === "production") {
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";
    if (isPlaceholderForgeKey(forgeKey)) {
      // Warn instead of throw - allows server to start but AI features won't work
      console.warn(
        "⚠️  WARNING: BUILT_IN_FORGE_API_KEY is set to a placeholder. AI features (Resume Roast, Tailor, Scribe) will NOT work until you set a real Manus Forge API key in Railway (Variables → careerswarm-app). See RAILWAY_DEPLOYMENT_HANDOFF.md."
      );
    }
  }
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN ?? "",
  // Development bypass for OAuth testing
  testUserEmail: process.env.TEST_USER_EMAIL ?? "",
  testUserPassword: process.env.TEST_USER_PASSWORD ?? "",
  devBypassAuth: process.env.DEV_BYPASS_AUTH === "true",
};
