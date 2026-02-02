import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Test endpoint to verify OAuth routes are working
  app.get("/api/oauth/test", (req: Request, res: Response) => {
    console.log('[OAuth] Test endpoint hit!');
    res.json({ status: 'OAuth routes are registered and working' });
  });
  
  // Development test login endpoint - uses TEST_USER credentials
  app.get("/api/oauth/test-login", async (req: Request, res: Response) => {
    try {
      const testEmail = process.env.TEST_USER_EMAIL;
      if (!testEmail) {
        return res.status(500).json({ error: 'TEST_USER_EMAIL not configured' });
      }
      
      const testOpenId = 'test-user-' + testEmail;
      
      // Create or update test user in database
      await db.upsertUser({
        openId: testOpenId,
        name: 'Test User',
        email: testEmail,
        loginMethod: 'test',
        lastSignedIn: new Date(),
      });
      
      // Create session token
      const sessionToken = await sdk.createSessionToken(testOpenId, {
        name: 'Test User',
        expiresInMs: ONE_YEAR_MS,
      });
      
      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log('[OAuth] Test login successful for:', testEmail);
      
      // Redirect to homepage
      res.redirect(302, '/');
    } catch (error) {
      console.error('[OAuth] Test login failed:', error);
      res.status(500).json({ error: 'Test login failed' });
    }
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
