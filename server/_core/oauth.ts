import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/** Auth: email-only sign-in at /login. Optional OAuth when OAUTH_SERVER_URL is set. */

/** Email login: always enabled when OAuth is not configured; otherwise enabled in dev or when ENABLE_DEV_LOGIN=true */
function isEmailLoginEnabled(): boolean {
  const hasOAuth = !!process.env.OAUTH_SERVER_URL?.trim();
  if (!hasOAuth) return true;
  if (process.env.ENABLE_DEV_LOGIN === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export function registerOAuthRoutes(app: Express) {
  // Email sign-in: create/lookup user by email, set session cookie (primary auth when no OAuth)
  app.post("/api/auth/test-login", async (req: Request, res: Response) => {
    if (!isEmailLoginEnabled()) {
      res.status(403).json({ error: "Email login is not enabled" });
      return;
    }
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Valid email is required" });
      return;
    }
    const openId = `dev-${email}`;
    await db.upsertUser({
      openId,
      name: email.split("@")[0],
      email,
      loginMethod: "dev",
      lastSignedIn: new Date(),
    });
    const sessionToken = await sdk.createSessionToken(openId, {
      name: email.split("@")[0],
      expiresInMs: ONE_YEAR_MS,
    });
    const cookieOptions = getSessionCookieOptions(req, true);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });
    let returnTo =
      typeof req.body?.returnTo === "string" ? req.body.returnTo : "/dashboard";
    // If they were starting onboarding, send them to Upload so the next step is obvious
    if (returnTo === "/onboarding/welcome")
      returnTo = "/onboarding/upload?welcome=1";
    // Server-side redirect so cookie is sent on the next request (more reliable than client redirect)
    res.redirect(302, returnTo);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const oauthUrl = process.env.OAUTH_SERVER_URL?.trim();
    if (!oauthUrl) {
      res.status(404).json({
        error: "OAuth is not configured; use email sign-in at /login",
      });
      return;
    }
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Decode state parameter to extract returnTo path
      let redirectUrl = "/";
      try {
        const stateData = JSON.parse(
          Buffer.from(state, "base64").toString("utf-8")
        );
        if (
          stateData.returnTo &&
          typeof stateData.returnTo === "string" &&
          stateData.returnTo.startsWith("/")
        ) {
          redirectUrl = stateData.returnTo;
        }
      } catch (e) {
        // If state decoding fails, fall back to homepage
        console.warn("[OAuth] Failed to decode state parameter:", e);
      }

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Setting cookie with options:", {
        cookieName: COOKIE_NAME,
        options: { ...cookieOptions, maxAge: ONE_YEAR_MS },
        hostname: req.hostname,
        protocol: req.protocol,
        headers: {
          host: req.headers.host,
          "x-forwarded-proto": req.headers["x-forwarded-proto"],
        },
        redirectUrl,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      console.log(
        "[OAuth] Cookie set successfully, redirecting to:",
        redirectUrl
      );

      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
