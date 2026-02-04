# Critical Setup Checklist

**Status:** All code is ready. These items require manual configuration in external services.

---

## 1. BUILT_IN_FORGE_API_KEY (Required for AI Features)

**Impact:** All AI features (Resume Roast, Tailor, Scribe, etc.) will fail without this.

### Steps:
1. Get your Manus Forge API key from the Manus dashboard
2. Go to [Railway Dashboard](https://railway.app) → careerswarm-app → Variables
3. Find `BUILT_IN_FORGE_API_KEY` (currently set to placeholder)
4. Replace with your real API key
5. Click "Deploy" to redeploy with new variable

### Verify:
```bash
# After deployment, test the Resume Roast endpoint
curl -X POST https://careerswarm.com/api/trpc/public.roast \
  -H "Content-Type: application/json" \
  -d '{"json": {"resumeText": "Test resume content"}}'
```

---

## 2. GitHub Secrets (Required for CI E2E Tests)

**Impact:** E2E tests in GitHub Actions will fail on push to main.

### Steps:
1. Go to GitHub → careerswarm-honeycomb → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `TEST_USER_EMAIL` | (your test user email) | Email for E2E test login |
| `TEST_USER_PASSWORD` | (your test user password) | Password for E2E test login |

### Create Test User (if needed):
1. Go to https://careerswarm.com
2. Create an account with a dedicated test email
3. Use those credentials for the secrets

### Verify:
After adding secrets, push a commit to main. The CI workflow should:
- ✅ Pass lint & type check
- ✅ Pass unit tests
- ✅ Pass build
- ✅ Pass E2E tests (smoke + full)

---

## 3. Sentry DSN (Required for Error Monitoring)

**Impact:** No visibility into production errors. Bugs may go unnoticed.

### Steps:
1. Go to [sentry.io](https://sentry.io) and sign in/create account
2. Create new project:
   - Platform: Node.js (Express)
   - Project name: `careerswarm-production`
3. Copy the DSN from Settings → Client Keys (DSN)
4. Go to [Railway Dashboard](https://railway.app) → careerswarm-app → Variables
5. Add: `SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx`
6. Click "Deploy" to redeploy

### Verify:
After deployment, check Railway logs for:
```
Sentry initialized
```

### Recommended Alerts (in Sentry Dashboard → Alerts):
- **Error Spike:** >10 errors in 1 hour → Email
- **New Issue:** Any new issue → Email
- **AI Failure:** Message contains "LLM" or "Forge" → Email

See `docs/SENTRY_SETUP.md` for full alert configuration.

---

## Quick Reference

| Item | Where to Configure | Current Status |
|------|-------------------|----------------|
| BUILT_IN_FORGE_API_KEY | Railway Variables | ❌ Placeholder |
| TEST_USER_EMAIL | GitHub Secrets | ❌ Missing |
| TEST_USER_PASSWORD | GitHub Secrets | ❌ Missing |
| SENTRY_DSN | Railway Variables | ❌ Missing |

---

## After Completing All Steps

Run a full verification:

```bash
# 1. Check production health
curl https://careerswarm.com/api/health

# 2. Run E2E tests locally against production
npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts

# 3. Trigger a test error to verify Sentry
# (Check Sentry dashboard for the event)
```

**Estimated time:** 15-20 minutes total
