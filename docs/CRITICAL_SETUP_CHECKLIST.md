# Critical Setup Checklist

**Status:** All code is ready. These items require manual configuration in external services.  
**Why this matters:** Missing or placeholder `OPENAI_API_KEY` / DB causes AI features to fail in production while you still pay for infra; completing this once avoids repeated failures and wasted spend.

---

## Auth (Sign-in / Login)

**Email-only auth.** No OAuth required.

- Users sign in at **`/login`**: enter email → `POST /api/auth/test-login` → session cookie set → redirect to `returnTo` (e.g. `/onboarding/welcome`, `/dashboard`). First-time emails create an account automatically.
- Optional: if you set `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL`, OAuth can be used; when unset, the app uses email sign-in only.

**Where OAuth can still show up (no action needed for email-only):**

- **Database:** `users.loginMethod` may contain `"dev"` or legacy values from past logins — stored data only, not config.
- **Railway:** Do not set `OAUTH_SERVER_URL` or `VITE_OAUTH_PORTAL_URL` so login stays email-only.
- **CI:** Unit tests run with OAuth unset. E2E runs against production.
- **Other:** Legacy references in `.archive/`, optional debug tooling, and browser-extension URLs; point the extension at your domain if you use it.

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

| Secret Name          | Value                     | Description                 |
| -------------------- | ------------------------- | --------------------------- |
| `TEST_USER_EMAIL`    | (your test user email)    | Email for E2E test login    |
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

   This runs the project's Sentry CLI (`@sentry/cli` in package.json). You must see "Method: Token" (or similar authenticated state), not "Unauthorized". If the command fails (e.g. "unknown command"), run `pnpm install` and try again; if it still fails, a successful login in step 1 is sufficient—continue to step 3.

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

## 4. Storage — S3-compatible (Required for Onboarding Upload)

**Impact:** Onboarding upload (Step 2) and Assembler package generation fail without storage. Users see server errors when uploading resumes.

The app uses **S3-compatible** object storage (AWS S3, Cloudflare R2, or Backblaze B2). Set these in Railway Variables:

| Variable               | Description                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `S3_BUCKET`            | Bucket name                                                                                                      |
| `S3_ACCESS_KEY_ID`     | Access key (R2: API token ID; AWS: access key ID)                                                                |
| `S3_SECRET_ACCESS_KEY` | Secret key (R2: API token secret; AWS: secret access key)                                                        |
| `S3_REGION`            | Optional. Default `us-east-1`. R2 uses `auto` or any value.                                                      |
| `S3_ENDPOINT`          | Optional. For R2: `https://<account_id>.r2.cloudflarestorage.com`. For B2: your B2 S3 endpoint. Omit for AWS S3. |

**Cost-avoidance:** Prefer **Cloudflare R2** (zero egress fees, S3-compatible). Create an R2 bucket, create API tokens under R2 → Manage R2 API Tokens, then set the three required vars (and `S3_ENDPOINT` for R2).

If missing, `storagePut` throws: "Storage not configured: set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY". See [ONBOARDING_DEEP_DIVE.md](./ONBOARDING_DEEP_DIVE.md) § E2E Verification.

---

## 5. Stripe Pro (Optional — for paid upgrades)

**Impact:** Pro checkout and UpgradeModal are wired in code. Without `STRIPE_SECRET_KEY` and `STRIPE_PRO_PRICE_ID`, "Upgrade to Pro" fails or does not redirect to Stripe Checkout correctly.

### Manual steps (no code changes):

1. **Set `STRIPE_SECRET_KEY` in Railway** (required for Stripe API)
   - Stripe Dashboard → Developers → API keys → Secret key
   - `railway open` → Variables → Add: `STRIPE_SECRET_KEY` = sk\_...

2. **Create a Pro product in Stripe**
   - Stripe Dashboard → Products → Add product
   - Name (e.g. "CareerSwarm Pro"), price **$29/month** recurring
   - Save and copy the **Price ID** (e.g. `price_xxx`)

3. **Set `STRIPE_PRO_PRICE_ID` in Railway**
   - `railway open` → Variables → Add variable: `STRIPE_PRO_PRICE_ID` = your Price ID

4. **Migrations**
   - The application limits migration (5-app limit for free tier) runs automatically on deploy (Dockerfile runs migrate in container). No manual step unless you skipped deploy.

5. **Redeploy**
   - `railway redeploy` (or push to trigger deploy) so the new variable is picked up.

### Verify

- Hit the 5-application limit on the Jobs/Dashboard flow → UpgradeModal should open instead of a generic error.
- Click "Upgrade to Pro" in UpgradeModal or on `/pricing` → redirects to Stripe Checkout (when logged in).

---

## Quick Reference

| Item                 | Where to Configure | Required For                   |
| -------------------- | ------------------ | ------------------------------ |
| OPENAI_API_KEY       | Railway Variables  | AI (Roast, extraction, Tailor) |
| S3_BUCKET            | Railway Variables  | Onboarding upload, Assembler   |
| S3_ACCESS_KEY_ID     | Railway Variables  | Onboarding upload, Assembler   |
| S3_SECRET_ACCESS_KEY | Railway Variables  | Onboarding upload, Assembler   |
| STRIPE_SECRET_KEY    | Railway Variables  | Pro checkout                   |
| STRIPE_PRO_PRICE_ID  | Railway Variables  | Pro checkout                   |
| TEST_USER_EMAIL      | GitHub Secrets     | CI E2E tests                   |
| TEST_USER_PASSWORD   | GitHub Secrets     | CI E2E tests                   |
| SENTRY_DSN           | Railway Variables  | Error monitoring               |

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
