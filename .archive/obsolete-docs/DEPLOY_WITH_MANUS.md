# Deploy CareerSwarm with Manus

**Copy everything below the line and paste it into Manus.**

---

# MANUS DEPLOYMENT INSTRUCTIONS FOR CAREERSWARM

You are deploying the CareerSwarm application. Follow these instructions EXACTLY in order. Do not skip any steps. Confirm each step before moving to the next.

## STEP 1: CONNECT TO REPOSITORY

Connect to this GitHub repository:

- **URL:** https://github.com/zganich/careerswarm-honeycomb
- **Branch:** main

Run this command to clone:

```bash
git clone https://github.com/zganich/careerswarm-honeycomb.git
cd careerswarm-honeycomb
```

**CONFIRM:** Reply "Step 1 complete - repository cloned" before proceeding.

---

## STEP 2: INSTALL DEPENDENCIES

Run this exact command:

```bash
pnpm install
```

Wait for it to complete. You should see "Done" at the end.

**CONFIRM:** Reply "Step 2 complete - dependencies installed" before proceeding.

---

## STEP 3: VERIFY ENVIRONMENT VARIABLES

Check that ALL of these environment variables are set in your project. List the status of each one.

### REQUIRED VARIABLES (app will NOT work without these):

| Variable               | Expected Value                                  | Status |
| ---------------------- | ----------------------------------------------- | ------ |
| DATABASE_URL           | mysql://... connection string                   | ?      |
| JWT_SECRET             | Random string, minimum 32 characters            | ?      |
| OAUTH_SERVER_URL       | Your Manus OAuth server URL                     | ?      |
| OWNER_OPEN_ID          | Your Manus OpenID                               | ?      |
| BUILT_IN_FORGE_API_URL | https://forge.manus.ai                          | ?      |
| BUILT_IN_FORGE_API_KEY | Your Forge API key (starts with sk- or similar) | ?      |
| VITE_APP_ID            | careerswarm                                     | ?      |
| VITE_OAUTH_PORTAL_URL  | https://oauth.manus.im (or your OAuth portal)   | ?      |
| NODE_ENV               | production                                      | ?      |

### HOW TO SET MISSING VARIABLES:

If any variable is missing, set it now:

```bash
# Example commands - replace values with actual values
export DATABASE_URL="mysql://user:password@host:3306/database"
export JWT_SECRET="generate-a-random-32-character-string-here"
export OAUTH_SERVER_URL="https://your-oauth-server.manus.ai"
export OWNER_OPEN_ID="your-manus-openid"
export BUILT_IN_FORGE_API_URL="https://forge.manus.ai"
export BUILT_IN_FORGE_API_KEY="your-forge-api-key"
export VITE_APP_ID="careerswarm"
export VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"
export NODE_ENV="production"
```

**CONFIRM:** Reply with a table showing the status of each variable:

- ✓ = set and has value
- ✗ = missing or empty

Do NOT proceed until ALL required variables show ✓.

---

## STEP 4: VERIFY DATABASE CONNECTION

The database must be accessible. Run this command:

```bash
pnpm db:migrate
```

**Expected output:**

- "No migrations to run" (if already migrated)
- OR a list of migrations being applied (0000 through 0015)

**If you see an error:**

- "Connection refused" = DATABASE_URL is wrong or database is not running
- "Access denied" = Wrong username/password in DATABASE_URL
- "Unknown database" = Database does not exist, create it first

**CONFIRM:** Reply "Step 4 complete - database migrations successful" OR describe the error.

---

## STEP 5: VERIFY BUILD

Run these commands in order:

```bash
pnpm check
```

**Expected:** No output (0 TypeScript errors)

```bash
pnpm build
```

**Expected:** Build completes with output showing:

- dist/public/index.html
- dist/public/assets/index-\*.css
- dist/public/assets/index-\*.js
- dist/index.js

**CONFIRM:** Reply "Step 5 complete - build successful" OR describe any errors.

---

## STEP 6: CONFIGURE OAUTH REDIRECT URI

This is CRITICAL for login to work.

1. Find your production URL (the URL where the app will be deployed)
2. Add this callback URL to the OAuth allowed redirect URIs:

```
https://YOUR-PRODUCTION-DOMAIN/api/oauth/callback
```

Replace YOUR-PRODUCTION-DOMAIN with the actual domain (e.g., careerswarm.com or careerswarm.manus.app).

**Where to configure:** In your Manus project settings, look for "OAuth" or "Allowed Redirect URIs" or "Callback URLs".

**CONFIRM:** Reply with:

1. The production URL
2. The callback URL you added
3. Confirmation it was added to the whitelist

---

## STEP 7: DEPLOY

Deploy the application using your hosting method:

**Option A - Manus Publish:**
Click the "Publish" button in the Manus Management UI.

**Option B - Command line:**

```bash
pnpm start
```

**CONFIRM:** Reply "Step 7 complete - application deployed" with the live URL.

---

## STEP 8: VERIFY DEPLOYMENT

Test these pages in order:

### Test 1: Homepage

- Go to: `https://YOUR-DOMAIN/`
- **Expected:** Homepage loads with "CareerSwarm" branding and hero section

### Test 2: Resume Roast (Public Page)

- Go to: `https://YOUR-DOMAIN/roast`
- Paste this text: "Software engineer with 5 years experience in JavaScript and Python. Led team of 3 developers."
- Click "Get Roasted"
- **Expected:** Score and feedback appear

### Test 3: Login Flow

- Go to: `https://YOUR-DOMAIN/login`
- Click "Sign In to CareerSwarm"
- **Expected:** Redirects to Manus OAuth, then back to the app

### Test 4: Dashboard (After Login)

- After login, go to: `https://YOUR-DOMAIN/dashboard`
- **Expected:** Dashboard loads with user info

**CONFIRM:** Reply with test results:

- Test 1: ✓ or ✗ (with error if failed)
- Test 2: ✓ or ✗ (with error if failed)
- Test 3: ✓ or ✗ (with error if failed)
- Test 4: ✓ or ✗ (with error if failed)

---

## STEP 9: FINAL REPORT

Provide a final deployment report:

```
CAREERSWARM DEPLOYMENT REPORT
=============================
Date: [DATE]
Production URL: [URL]

Environment Variables:
- DATABASE_URL: ✓
- JWT_SECRET: ✓
- OAUTH_SERVER_URL: ✓
- OWNER_OPEN_ID: ✓
- BUILT_IN_FORGE_API_KEY: ✓
- VITE_APP_ID: ✓
- VITE_OAUTH_PORTAL_URL: ✓

Database: [STATUS]
Build: [STATUS]
OAuth Callback: [URL ADDED]

Verification Tests:
- Homepage: [PASS/FAIL]
- Resume Roast: [PASS/FAIL]
- Login Flow: [PASS/FAIL]
- Dashboard: [PASS/FAIL]

DEPLOYMENT STATUS: [SUCCESS/FAILED]
```

---

## TROUBLESHOOTING

### OAuth Redirect Loop

- Cause: Callback URL not whitelisted
- Fix: Add `https://YOUR-DOMAIN/api/oauth/callback` to OAuth settings

### Database Connection Error

- Cause: DATABASE_URL is wrong
- Fix: Verify the connection string format: `mysql://user:password@host:port/database`

### Build Fails

- Cause: Missing dependencies or TypeScript errors
- Fix: Run `pnpm install` again, then `pnpm check` to see errors

### 500 Error on API Calls

- Cause: Missing BUILT_IN_FORGE_API_KEY
- Fix: Set the Forge API key in environment variables

### Login Works But Dashboard is Empty

- Cause: Database tables don't exist
- Fix: Run `pnpm db:migrate`

---

## SUMMARY

1. Clone repo
2. Install dependencies: `pnpm install`
3. Verify ALL environment variables are set
4. Run migrations: `pnpm db:migrate`
5. Verify build: `pnpm check && pnpm build`
6. Add OAuth callback URL to whitelist
7. Deploy/Publish
8. Test all 4 verification tests
9. Provide final report

**DO NOT SKIP ANY STEPS. CONFIRM EACH STEP BEFORE PROCEEDING.**
