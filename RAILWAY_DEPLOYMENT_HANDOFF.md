# Railway Deployment Handoff

**Created:** February 2, 2026  
**Updated:** February 4, 2026  
**Status:** DEPLOYED - App running, custom domain configured

---

## If you see errors (AI features / Resume Roast / Tailor / Scribe)

The app will **refuse to start in production** if `BUILT_IN_FORGE_API_KEY` is still a placeholder. If you see:

- **"BUILT_IN_FORGE_API_KEY is set to a placeholder"** at startup, or  
- **LLM / 401 / API errors** when using Resume Roast or generating resumes,

do this:

1. Open [Railway](https://railway.com/project/8c2e7522-d90a-4778-bcf0-2b65319f8441) → **careerswarm-app** service → **Variables**.
2. Set **BUILT_IN_FORGE_API_KEY** to your real Manus Forge API key (from https://forge.manus.ai or your Manus dashboard).
3. Save; Railway will redeploy. AI features will work after deploy.

Optional follow-ups (not required for AI to work):

- **DNS:** Add the CNAME records below at your domain registrar so careerswarm.com and www point to the app.
- **Cleanup:** Delete the old "MySQL" service from the dashboard (see Cleanup Needed below).
- **Redis:** Only if you want the GTM pipeline worker (optional).

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
3. Set real BUILT_IN_FORGE_API_KEY for AI features
4. Optionally add Redis for GTM pipeline worker
```

---

## DNS Records Needed

Add these records at your domain registrar for careerswarm.com:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | 9kk93aeq.up.railway.app |
| CNAME | www | zkuoi33r.up.railway.app |

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
- BUILT_IN_FORGE_API_KEY: placeholder (set real key for AI features)

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

**Delete the old "MySQL" service** from the Railway dashboard:
1. Go to https://railway.com/project/8c2e7522-d90a-4778-bcf0-2b65319f8441
2. Click on the "MySQL" service (NOT MySQL-E6eq which is the database)
3. Go to Settings → Delete Service

This service was misconfigured and is running an actual MySQL database instead of our app.

---

## Optional: Add Redis for GTM Pipeline

If you want the GTM pipeline worker to function:

1. Add Redis service: `railway add -d redis`
2. Link REDIS_URL to the app service
3. Redeploy

The app works without Redis - it just logs warnings about the GTM worker not starting.
