# OAuth Redirect URI Whitelist (Manus)

**Purpose:** Fix OAuth redirect loop on preview deployments (e.g. Manus preview URLs) where third-party cookies are blocked. Manus must whitelist the app’s callback URL for each deployment origin.

---

## Redirect URI format

The app uses this callback URL:

```
{origin}/api/oauth/callback
```

- **Local:** `http://localhost:PORT/api/oauth/callback` (e.g. `http://localhost:5000/api/oauth/callback`)
- **Preview:** `https://<preview-host>/api/oauth/callback` (e.g. `https://careerswarm-abc123.manus.app/api/oauth/callback`)
- **Production:** `https://<production-domain>/api/oauth/callback`

`origin` is `window.location.origin` at login time (see `client/src/const.ts` → `getLoginUrl`).

---

## What to whitelist on Manus

1. In the Manus OAuth / app config for CareerSwarm, add each **Redirect URI** that users will sign in from:
   - Production: `https://<your-production-domain>/api/oauth/callback`
   - Each preview URL: `https://<preview-slug>.manus.app/api/oauth/callback` (or your preview domain pattern)
   - Local (optional): `http://localhost:5000/api/oauth/callback` (or the port your dev server uses)

2. If Manus supports **wildcard** preview URLs, add something like:
   - `https://*.manus.app/api/oauth/callback`  
     (Confirm in Manus docs; if not, add each preview URI as you use it.)

---

## Until whitelist is done

- **Dev Login** at `/login` works without OAuth (bypasses Manus when `NODE_ENV !== "production"` or `ENABLE_DEV_LOGIN=true`).
- Use **Dev Login** on preview URLs so testers can sign in without the redirect loop.

---

## Key files

| File                    | Role                                           |
| ----------------------- | ---------------------------------------------- |
| `client/src/const.ts`   | Builds `redirectUri` and OAuth login URL       |
| `server/_core/oauth.ts` | Handles `GET /api/oauth/callback`              |
| `server/_core/sdk.ts`   | Sends `redirectUri` to Manus in token exchange |
