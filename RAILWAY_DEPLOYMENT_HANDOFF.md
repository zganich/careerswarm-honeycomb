# Railway Deployment Handoff

**Created:** February 2, 2026  
**Status:** In Progress - App deploying

---

## Copy This to New Chat

```
Continue Railway deployment for CareerSwarm.

Read RAILWAY_DEPLOYMENT_HANDOFF.md for full context, but here's the summary:

Railway Project:
- Project ID: 8c2e7522-d90a-4778-bcf0-2b65319f8441
- Project URL: https://railway.com/project/8c2e7522-d90a-4778-bcf0-2b65319f8441
- Account: jknight3@gmail.com (workspace: zganich's Projects)

Services:
- MySQL-E6eq (database): Running, ID 14ec0aaf-89a4-4cfe-ba33-2a6352bd9032
- MySQL (app - bad name): ID b71d87a1-167e-42c9-90b3-655d2286915f, deploying

Environment Variables (already set on app service):
- DATABASE_URL=mysql://root:DwpMaixblXLpJjQlaOgaomKnMkwdcIyJ@mysql.railway.internal:3306/railway
- JWT_SECRET=careerswarm-jwt-secret-2026-railway-prod-x9k2m
- VITE_APP_ID=careerswarm
- NODE_ENV=production
- ENABLE_DEV_LOGIN=true
- PORT=3000

Files added:
- railway.json (sets start command to "pnpm start")

Custom domain: careerswarm.com (not yet configured)

Next steps:
1. Check deployment status: railway logs
2. If still showing MySQL logs, the service config is wrong - may need to delete and recreate app service
3. Add custom domain: railway domain add careerswarm.com
4. Configure DNS: Add CNAME record pointing careerswarm.com to railway domain
5. Run migrations: railway run pnpm db:migrate
6. Test the app at careerswarm.com

If the app service keeps running MySQL instead of Node.js, we may need to:
- Delete the "MySQL" app service 
- Create a new service with a different name
- Redeploy
```

---

## Technical Details

### Database Connection
```
Host: mysql.railway.internal (internal) or nozomi.proxy.rlwy.net:23775 (external)
User: root
Password: DwpMaixblXLpJjQlaOgaomKnMkwdcIyJ
Database: railway
```

### Known Issue
The app service was accidentally named "MySQL" and Railway may be treating it as a database instead of a Node.js app. The `railway.json` file should override this, but if not:

1. Delete the app service in Railway dashboard
2. Run `railway add` and create an "Empty Project" service
3. Rename it to "careerswarm-app"
4. Link to it: `railway link -s careerswarm-app`
5. Redeploy: `railway up`

### Commands Reference
```bash
railway whoami          # Check logged in account
railway status          # Check current project/service
railway logs            # View logs
railway variables       # View env vars
railway domain          # Generate/add domain
railway run <cmd>       # Run command in Railway env
railway up              # Deploy
railway open            # Open dashboard in browser
```

---

## DNS Setup for careerswarm.com

Once Railway generates a domain (e.g., `careerswarm-app-production-xxxx.up.railway.app`), add these DNS records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | careerswarm-app-production-xxxx.up.railway.app |
| CNAME | www | careerswarm-app-production-xxxx.up.railway.app |

Or use Railway's custom domain feature which provides the exact records needed.
