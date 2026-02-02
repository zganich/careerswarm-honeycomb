import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/** Dev-only: enable test-login when not production OR ENABLE_DEV_LOGIN=true */
function isDevLoginEnabled(): boolean {
  if (process.env.ENABLE_DEV_LOGIN === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export function registerOAuthRoutes(app: Express) {
  // Dev login: bypass OAuth when cookies/redirect don't work (local, preview URLs)
  app.post("/api/auth/test-login", async (req: Request, res: Response) => {
    if (!isDevLoginEnabled()) {
      res.status(403).json({ error: "Dev login is disabled in production" });
      return;
    }
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
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
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    const returnTo = typeof req.body?.returnTo === "string" ? req.body.returnTo : "/dashboard";
    res.status(200).json({ success: true, redirect: returnTo });
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    console.log('[OAuth] Callback hit!', { 
      query: req.query,
      origin: req.headers.origin,
      host: req.headers.host 
    });
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
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        if (stateData.returnTo && typeof stateData.returnTo === 'string' && stateData.returnTo.startsWith('/')) {
          redirectUrl = stateData.returnTo;
        }
      } catch (e) {
        // If state decoding fails, fall back to homepage
        console.warn('[OAuth] Failed to decode state parameter:', e);
      }

      const cookieOptions = getSessionCookieOptions(req);
      console.log('[OAuth] Setting cookie with options:', {
        cookieName: COOKIE_NAME,
        options: { ...cookieOptions, maxAge: ONE_YEAR_MS },
        hostname: req.hostname,
        protocol: req.protocol,
        headers: { host: req.headers.host, 'x-forwarded-proto': req.headers['x-forwarded-proto'] },
        redirectUrl
      });
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log('[OAuth] Cookie set successfully, redirecting to:', redirectUrl);

      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
