# Phase 4 Config Walkthrough (CLI-first)

Complete **Step 1** in full (including verify), then **Step 2**, then **Step 3**, then **Step 4** only if you want the GTM pipeline worker.

**Prerequisites**

- From repo root, Railway project linked: `railway link` (if not already). Confirm: `railway status`.
- You need: Stripe account, (for S3) Cloudflare R2 or AWS/B2 account, Sentry account (project **careerswarm-backend** already exists).

See also: [CRITICAL_SETUP_CHECKLIST.md](./CRITICAL_SETUP_CHECKLIST.md).

---

## Tokens for automation

You can use tokens to avoid some dashboard steps:

| Service     | Token / credential         | Where to get it                                                                                    | Use                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Railway** | Account or workspace token | [railway.com/account/tokens](https://railway.com/account/tokens)                                   | Set variables via [Public API](https://docs.railway.com/integrations/api/manage-variables). Run `pnpm run phase4:railway-vars` (or `node scripts/phase4-railway-vars.mjs`) with `RAILWAY_API_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`, `RAILWAY_SERVICE_ID`. Get IDs: `railway status` or in dashboard press **Cmd+K** (Ctrl+K) and copy project / environment / service ID. |
| **Sentry**  | Auth token                 | [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/) | `pnpm run sentry:login` (paste token); same token can be used for Sentry API (e.g. fetch DSN).                                                                                                                                                                                                                                                                                             |
| **Stripe**  | Secret key                 | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)                               | This is the API credential; set as `STRIPE_SECRET_KEY` in Railway. No separate “auth token”.                                                                                                                                                                                                                                                                                               |
| **R2/S3**   | Access Key ID + Secret     | R2 → Manage R2 API Tokens; or AWS IAM                                                              | Set as `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` in Railway.                                                                                                                                                                                                                                                                                                                           |
| **GitHub**  | Personal Access Token      | GitHub → Settings → Developer settings → PAT (repo scope)                                          | Use GitHub API to set Actions secrets instead of the UI.                                                                                                                                                                                                                                                                                                                                   |

---

## Step 1: Stripe Pro (complete before Step 2)

### 1.1 Create Pro product and price (CLI)

Install Stripe CLI if needed: `brew install stripe/stripe-cli/stripe` (or see [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)). Login once: `stripe login`.

Create product and monthly price ($29):

```bash
# Create product; note the product id (prod_xxx) from output
stripe products create --name="CareerSwarm Pro"

# Create $29/month price (unit_amount in cents); use the product id from above
stripe prices create --product=prod_XXXXXXXX --currency=usd --recurring-interval=month --unit-amount=2900
```

Copy the **Price ID** (`price_xxx`) from the `prices create` output.

### 1.2 Get Stripe secret key

- Stripe Dashboard → [Developers → API keys](https://dashboard.stripe.com/apikeys) → **Secret key** (e.g. `sk_live_...` or `sk_test_...` for testing). Copy it.

### 1.3 Set Railway variables

**Option A – Railway API (with token)**  
See [scripts/phase4-railway-vars.mjs](../scripts/phase4-railway-vars.mjs). Set `RAILWAY_API_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`, `RAILWAY_SERVICE_ID`, then pass the vars (e.g. from `.env` or env) and run the script.

**Option B – Dashboard**

```bash
railway open
```

Select **careerswarm-app** (not MySQL) → **Variables** → Add `STRIPE_SECRET_KEY` and `STRIPE_PRO_PRICE_ID` with the values above.

### 1.4 Redeploy and verify

```bash
railway redeploy
```

Wait for deploy to finish, then:

- Open https://careerswarm.com/pricing (or hit the 5-application limit in the app).
- Click “Upgrade to Pro” and confirm you are redirected to Stripe Checkout.

Step 1 is complete when Pro checkout opens correctly.

---

## Step 2: S3-compatible storage (complete before Step 3)

### 2.1 Create bucket and credentials

- **Option A – Cloudflare R2 (recommended, no egress fees)**
  - Cloudflare Dashboard → R2 → Create bucket (e.g. `careerswarm-uploads`).
  - R2 → **Manage R2 API Tokens** → Create API token (Object Read & Write for that bucket). Note: **Access Key ID**, **Secret Access Key**, and **Endpoint** (e.g. `https://<account_id>.r2.cloudflarestorage.com`).
  - No CLI required; dashboard is the normal path for R2.
- **Option B – AWS S3**
  - Create bucket and IAM user with S3 access; get Access Key ID and Secret Access Key.
  - CLI: `aws s3 mb s3://your-bucket-name` (if AWS CLI configured).

### 2.2 Set Railway variables

Use the [phase4-railway-vars script](../scripts/phase4-railway-vars.mjs) with your token, or:

```bash
railway open
```

Select **careerswarm-app** → **Variables** → Add:

- `S3_BUCKET` = your bucket name
- `S3_ACCESS_KEY_ID` = from R2 or AWS
- `S3_SECRET_ACCESS_KEY` = from R2 or AWS
- (R2 only) `S3_ENDPOINT` = e.g. `https://<account_id>.r2.cloudflarestorage.com`
- (Optional) `S3_REGION` = e.g. `auto` for R2 or `us-east-1` for AWS

### 2.3 Redeploy and verify

```bash
railway redeploy
```

Then: sign in at https://careerswarm.com → go to onboarding upload (or **Complete Onboarding** flow) → upload a resume. Step 2 is complete when the upload succeeds and no “Storage not configured” error appears.

Optional local check (uses `.env`; production uses Railway vars):

```bash
pnpm run config:check
```

---

## Step 3: Sentry DSN (complete before Step 4)

### 3.1 Authenticate Sentry CLI

```bash
pnpm run sentry:login
```

Open the URL in the browser, create/auth the token, paste it into the terminal. Stored in `~/.sentryclirc`.

### 3.2 Verify CLI (optional)

```bash
pnpm run sentry:info
```

You should see authenticated state (e.g. “Method: Token”), not “Unauthorized”.

### 3.3 Get DSN

Use the existing project **careerswarm-backend** (do not create a new project):

- Open: https://careerswarm.sentry.io/settings/careerswarm/projects/careerswarm-backend/keys/
- Copy the **DSN** (e.g. `https://xxxx@xxxx.ingest.sentry.io/xxxx`).

(There is no standard Sentry CLI command to print the DSN; dashboard or API is required.)

### 3.4 Set Railway variable

Use [phase4-railway-vars.mjs](../scripts/phase4-railway-vars.mjs) with `SENTRY_DSN`, or dashboard:

```bash
railway open
```

Select **careerswarm-app** → **Variables** → Add `SENTRY_DSN` = (paste DSN).

### 3.5 Redeploy and verify

```bash
railway redeploy
railway logs | grep -i sentry
```

You should see a line like “Sentry initialized” after app start. Step 3 is complete when that appears.

---

## Step 4: Redis (optional — only for GTM pipeline worker)

Skip entirely if you do not need the GTM pipeline worker. The main app (Roast, onboarding, Jobs, Applications) does not require Redis.

### 4.1 Create Redis

- **Option A – Railway**  
  From repo (with `railway link`):
  ```bash
  railway add
  ```
  Choose **Redis** from the list. Railway usually injects `REDIS_URL` into the project; you may need to attach it to the **careerswarm-app** service in the dashboard (Variables or “Connect” for the new Redis service).
- **Option B – Upstash / Redis Cloud**  
  Create a Redis instance in their dashboard, copy the connection URL, then set it in Railway as below.

### 4.2 Set Railway variable (if not auto-set)

If `REDIS_URL` is not already on careerswarm-app, use the phase4-railway-vars script or:

```bash
railway open
```

Select **careerswarm-app** → **Variables** → Add `REDIS_URL` = `redis://...` (full URL from Redis provider).

### 4.3 Redeploy

```bash
railway redeploy
```

Step 4 is complete when the app starts and (if you use GTM jobs) the worker can connect.

---

## Final verification (after all steps you chose)

```bash
pnpm run config:check    # Uses local .env; for prod, check Railway vars in dashboard
curl -s https://careerswarm.com/api/health
railway variable list   # Sanity-check that expected vars are set
```
