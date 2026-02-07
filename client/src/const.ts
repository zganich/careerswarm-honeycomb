export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** OAuth state payload: redirectUri for IdP, returnTo for post-login redirect */
export type OAuthState = { redirectUri: string; returnTo: string };

// Generate login URL at runtime so redirect URI reflects the current origin.
// returnTo: path to redirect after OAuth (default "/"). Use for deep-linking.
export const getLoginUrl = (returnTo?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const returnPath = returnTo && returnTo.startsWith("/") ? returnTo : "/";
  const statePayload: OAuthState = { redirectUri, returnTo: returnPath };
  const state = btoa(JSON.stringify(statePayload));

  // Email-only auth: leave VITE_OAUTH_PORTAL_URL unset; then callers use /login?returnTo=...
  if (!oauthPortalUrl) {
    return "#"; // No OAuth → use /login (main.tsx, DashboardLayout, etc. handle this)
  }

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Failed to construct login URL:", error);
    return "#"; // Safe fallback - prevents navigation
  }
};
