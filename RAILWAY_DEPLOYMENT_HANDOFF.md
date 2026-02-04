# Railway Deployment Handoff

**Created:** February 2, 2026  
**Updated:** February 4, 2026  
**Status:** DEPLOYED - App running, custom domain configured

---

## If you see errors (AI features / Resume Roast / Tailor / Scribe)

AI features will fail without a valid LLM API key. If you see **LLM / 401 / API errors** when using Resume Roast or generating resumes:

1. **Set the variable** (Railway CLI cannot set variables; use `railway open` → Variables or [Railway API](https://docs.railway.app/guides/manage-variables)):
   ```bash
   railway open   # → careerswarm-app → Variables
   ```
   Add **OPENAI_API_KEY** = your OpenAI API key (from [platform.openai.com](https://platform.openai.com/api-keys)). Save.
2. **Redeploy from CLI:**
   ```bash
   railway redeploy
   railway logs   # Confirm app starts without placeholder error
   ```
3. **Optional:** `railway variable list` to confirm vars; add DNS records (see below); delete old MySQL service (see Cleanup); add Redis only if you want the GTM worker.

---

## Deployment Summary

**App is LIVE at:** https://careerswarm-app-production.up.railway.app

**Custom domains configured (need DNS records):**
- careerswarm.com
- www.careerswarm.com

---

## Copy This to New Chat

```
CareerSwarm is deployed on Railway.

Railway Project:
- Project ID: 8c2e7522-d90a-4778-bcf0-2b65319f8441
- Project URL: https://railway.com/project/8c2e7522-d90a-4778-bcf0-2b65319f8441
- Account: jknight3@gmail.com (workspace: zganich's Projects)

Services:
- MySQL-E6eq (database): Running ✅
- careerswarm-app: Running ✅

Live URL: https://careerswarm-app-production.up.railway.app

Custom domains (need DNS setup):
- careerswarm.com → CNAME @ → 9kk93aeq.up.railway.app
- www.careerswarm.com → CNAME www → zkuoi33r.up.railway.app

Status:
- App deployed and running ✅
- Database migrations applied ✅
- Custom domains configured (pending DNS) ✅
- Redis not configured (GTM worker disabled, not critical)

To-do:
1. Set up DNS records for careerswarm.com
2. Delete old "MySQL" service from dashboard (misconfigured)
3. Set real OPENAI_API_KEY for AI features
4. Optionally add Redis for GTM pipeline worker
```

---

## DNS Records Needed

See [docs/CLOUDFLARE_DNS.md](./docs/CLOUDFLARE_DNS.md) for Cloudflare API (curl) or dashboard steps. Railway target: `careerswarm-app-production.up.railway.app`.

**Note:** Some registrars don't allow CNAME on root (@). In that case:
- Use an ALIAS or ANAME record if available
- Or use a service like Cloudflare that supports CNAME flattening

---

## Technical Details

### Database Connection
```
Internal: mysql://root:GRXepLWiqebMoTgMiCEemFWmkCDITWCz@mysql-e6eq.railway.internal:3306/railway
External: mysql://root:GRXepLWiqebMoTgMiCEemFWmkCDITWCz@trolley.proxy.rlwy.net:50885/railway
```

### Environment Variables (on careerswarm-app)
- DATABASE_URL: ✅ (internal MySQL URL)
- JWT_SECRET: ✅
- VITE_APP_ID: ✅
- NODE_ENV: production
- ENABLE_DEV_LOGIN: true (allows test login without Manus OAuth)
- PORT: 3000
- OAUTH_SERVER_URL: https://oauth.manus.im
- OPENAI_API_KEY: placeholder (set real key for AI features)

### Service IDs
- careerswarm-app: 05251ccb-a203-4403-bee5-022e7e0a63fb
- MySQL-E6eq (database): 14ec0aaf-89a4-4cfe-ba33-2a6352bd9032
- MySQL (DELETE THIS): b71d87a1-167e-42c9-90b3-655d2286915f

### Code Changes Made
Fixed `server/_core/vite.ts` to handle Node.js 18 compatibility:
- Made vite/viteConfig imports dynamic (only loaded in development)
- Used process.cwd() for production static file paths
- Wrapped import.meta.url in lazy function to avoid bundling issues

---

## Commands Reference

Install CLI: `brew install railway` or `npm i -g @railway/cli`. Then `railway login` (opens browser) and from this repo run `railway link` to attach the project.

```bash
railway whoami          # Check logged in account
railway status          # Check current project/service
railway service status  # Check deployment status
railway logs            # View logs
railway variable list   # View env vars
railway domain          # Generate/add domain
railway run <cmd>       # Run command in Railway env
railway up              # Deploy
railway open            # Open dashboard in browser
```

---

## Cleanup Needed

**Delete the old "MySQL" service** (misconfigured; not the app DB). CLI doesn’t delete services; use the dashboard:

```bash
railway open   # → Project → click "MySQL" (NOT MySQL-E6eq) → Settings → Delete Service
```

MySQL-E6eq is the real database; keep it.

---

## Optional: Add Redis for GTM Pipeline

CLI (from repo):

```bash
railway add -d redis      # Add Redis; link REDIS_URL to careerswarm-app in UI if needed
railway variable list     # Confirm REDIS_URL
railway redeploy
```

The app works without Redis; it only logs warnings when the GTM worker can’t start.
