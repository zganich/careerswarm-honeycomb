const requiredEnvVars = [
  { key: "DATABASE_URL", description: "MySQL connection string" },
  { key: "JWT_SECRET", description: "Session signing (min 32 chars)" },
  { key: "OAUTH_SERVER_URL", description: "Manus OAuth server URL" },
  { key: "BUILT_IN_FORGE_API_KEY", description: "Manus Forge API key for LLM" },
] as const;

/**
 * Verifies required env vars are set. Call at production startup to fail fast.
 * Throws with a clear message if any required var is missing or empty.
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
};
