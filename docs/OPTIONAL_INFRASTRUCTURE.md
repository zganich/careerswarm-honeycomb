# Optional Infrastructure

These items are not required for core app operation but improve production reliability and features. **Use CLI when you can** (e.g. `railway logs`, `railway redeploy`, `railway variable list`). Use the dashboard or Railway API only when the CLI doesn’t support the action (e.g. setting variables).

## Prerequisites: Railway CLI

From the repo (with `railway link` already run):

```bash
railway status          # Confirm project/service
railway variable list   # List env vars
railway logs            # Stream logs
railway domain          # List/add domains
railway redeploy        # Redeploy without new code
railway open            # Dashboard fallback only (when CLI doesn't support an action)
```

---

## DNS (Custom domain)

- **Purpose:** Serve the app at careerswarm.com / www.careerswarm.com.

### Railway (CLI)

From the repo:

```bash
railway domain          # List domains; target: careerswarm-app-production.up.railway.app
```

Domains already configured on Railway: careerswarm.com, www.careerswarm.com.

### Cloudflare (DNS)

**See [docs/CLOUDFLARE_DNS.md](./CLOUDFLARE_DNS.md)** for step-by-step instructions with the exact Railway target.

Summary: Add CNAME records in Cloudflare → **DNS** → **Records**:
- `@` → `careerswarm-app-production.up.railway.app`
- `www` → `careerswarm-app-production.up.railway.app`

Set SSL/TLS to **Full** or **Full (strict)**.

---

## Redis

- **Purpose:** Required only for the **GTM pipeline worker** (optional feature). Used as a task queue backend.
- **When to add:** When you enable the GTM pipeline for automated job discovery/application.

**CLI (Railway):**

```bash
railway add -d redis    # Add Redis plugin; then link REDIS_URL to your app service
railway variable list   # Confirm REDIS_URL is set
railway redeploy        # Redeploy app to pick up new var
```

See `server/queue.ts` and GTM docs. The app runs without Redis; the GTM worker simply won’t start.

---

## Sentry (Error tracking)

- **Purpose:** Capture and inspect production errors. The app initializes Sentry when `SENTRY_DSN` is set (`server/_core/index.ts`); no code changes needed.

### Using your Sentry account

1. **Sentry project/DSN:** Create in [sentry.io](https://sentry.io) UI (one-time; no CLI for project creation). Copy DSN from **Settings → Client Keys (DSN)**.
2. **Railway (set variable):** Railway CLI cannot set variables. Use dashboard (`railway open` → Variables) or [Railway API](https://docs.railway.app/guides/manage-variables) for automation.
3. **Redeploy and verify (CLI only):**
   ```bash
   railway redeploy
   railway logs          # Look for "Sentry initialized" on startup
   railway variable list # Confirm SENTRY_DSN is set
   ```
4. **Local testing:** Add `SENTRY_DSN` to `.env` (same value as production).

**Alerts and integrations:** See [docs/SENTRY_SETUP.md](./SENTRY_SETUP.md) (recommended alerts, Slack, etc.).
