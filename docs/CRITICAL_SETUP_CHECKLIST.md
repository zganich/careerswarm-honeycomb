# Critical Setup Checklist

**Status:** All code is ready. These items require manual configuration in external services.  
**Why this matters:** Missing or placeholder `OPENAI_API_KEY` / DB causes AI features to fail in production while you still pay for infra; completing this once avoids repeated failures and wasted spend.

---

## Auth (Sign-in / Login)

**Email-only auth.** No OAuth or Manus required.

- Users sign in at **`/login`**: enter email → `POST /api/auth/test-login` → session cookie set → redirect to `returnTo` (e.g. `/onboarding/welcome`, `/dashboard`). First-time emails create an account automatically.
- Optional: if you set `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL`, OAuth can be used; when unset, the app uses email sign-in only.


---

## 1. OPENAI_API_KEY (Required for AI Features)

**Impact:** All AI features (Resume Roast, Tailor, Scribe, etc.) will fail without this.

### Steps:
1. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. **Use CLI when you can.** Set the variable via dashboard or [Railway API](https://docs.railway.app/guides/manage-variables) (CLI cannot set variables): `railway open` → careerswarm-app → Variables. Add `OPENAI_API_KEY=sk-...` (or replace if placeholder).
3. Redeploy via CLI: `railway redeploy`

### Verify:
```bash
# After deployment, test the Resume Roast endpoint (resumeText must be ≥50 chars)
curl -X POST https://careerswarm.com/api/trpc/public.roast \
  -H "Content-Type: application/json" \
  -d '{"json": {"resumeText": "Software Engineer with 5 years experience. Led team of 8. Increased performance by 40%."}}'
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

Use the existing Sentry project **careerswarm-backend** (org **careerswarm**). Do not create a new project.

### Steps (do in this order):

1. **Authenticate Sentry CLI**
   ```bash
   pnpm run sentry:login
   ```
   When prompted: open the URL in a browser, create an auth token at the page it shows (or use [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)), paste the token into the terminal. It is stored in `~/.sentryclirc`.

2. **Verify CLI**
   ```bash
   pnpm run sentry:info
   ```
   This runs the project's Sentry CLI (`@sentry/cli` in package.json); do not use a globally installed `sentry-cli`, which may be older and lack the `info` command. You must see "Method: Token" (or similar authenticated state), not "Unauthorized".

3. **Get the DSN from careerswarm-backend**
   - Open https://careerswarm.sentry.io/settings/careerswarm/projects/careerswarm-backend/keys/
   - Or: Sentry → Settings (gear) → Organization **careerswarm** → **Projects** → click **careerswarm-backend** → **Client Keys (DSN)** in the left sidebar.
   - Copy the **DSN** value (looks like `https://xxxx@xxxx.ingest.sentry.io/xxxx`).

4. **Set SENTRY_DSN in Railway**
   - Run: `railway open`
   - In the browser: select the **careerswarm-app** service (not the MySQL service).
   - Go to the **Variables** tab.
   - Click **+ New Variable** (or **Add Variable**).
   - Name: `SENTRY_DSN`
   - Value: paste the DSN you copied (no quotes).
   - Save / Apply.

5. **Redeploy**
   ```bash
   railway redeploy
   ```

6. **Verify**
   ```bash
   railway logs | grep -i sentry
   ```
   You must see a line containing "Sentry initialized" after the app starts.

### Recommended Alerts (in Sentry Dashboard → Alerts):
- **Error Spike:** >10 errors in 1 hour → Email
- **New Issue:** Any new issue → Email
- **AI Failure:** Message contains "LLM" or "OpenAI" → Email

See `docs/SENTRY_SETUP.md` for full alert configuration.

---

## Quick Reference

| Item | Where to Configure | Current Status |
|------|-------------------|----------------|
| OPENAI_API_KEY | Railway Variables | ❌ Placeholder |
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
