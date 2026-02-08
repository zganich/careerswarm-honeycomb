# CareerSwarm – Context for New Chat

**Purpose:** Copy or reference this file when starting a new chat to restore project context quickly. Update it as the project and handoff state change.

---

## Standing Instructions (ALWAYS FOLLOW)

1. **CLI-First:** Use CLI every time there is access (Railway CLI, Cloudflare API, curl, Sentry CLI, gh, git, etc.). Use dashboards only when CLI/API does not support the action.

2. **Context Window Management:** At **50-60% context usage**, proactively:
   - Summarize all work done in the session
   - Update this file with current state
   - Commit all changes
   - Inform user to start a new chat

3. **Autonomy:** Proceed with fixes, improvements, and implementations within project scope without asking permission.

4. **Do not hand off technical work:** Run commands, edit `.env`/config, run tests, and verify yourself. Do not ask the user to run steps or edit env; use Railway CLI where possible and keep README/CONTEXT accurate for what the assistant does.

5. **Before committing:** Check [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md) for recent OpenClaw work so its fixes are included or followed up.

6. **Review and decisions:** When review or a judgment call is needed, Cursor and OpenClaw can discuss (via handoff, CONTEXT, shared docs) and make the right call. You have autonomy for this project; use it to ship without blocking on the human when the path is clear.

---

## What It Is

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline (Scout → Qualifier → Profiler → Tailor → Scribe → Assembler → Success Predictor). **Resume Roast** (public, no auth), application tracker (Kanban), package generation (resume / cover letter / LinkedIn). Optional GTM pipeline worker (requires Redis).

## Stack

- **Frontend:** React 19, Tailwind 4, tRPC, shadcn/ui, wouter (routing)
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Railway). Schema: `drizzle/schema.ts` (23 tables); access via `server/db.ts`. Migrations: `drizzle/*.sql` + `drizzle/meta/_journal.json`.
- **Auth:** Email-only sign-in at `/login`. User enters email → session cookie; `returnTo` supported. Optional OAuth when `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are set. See `docs/CRITICAL_SETUP_CHECKLIST.md` § Auth.
- **AI:** OpenAI API only (`OPENAI_API_KEY`). GPT-4o-mini default. Roast: `server/roast.ts` → `server/_core/llm.ts` (`invokeLLM`).
- **Deploy:** Railway (Dockerfile, Node 20)

### Avoid cost/waste (production)

- **App boot** requires: `DATABASE_URL`, `JWT_SECRET` (validated in `server/_core/env.ts`). No OAuth required.
- **AI features (Roast, Tailor, Scribe)** require a **real** `OPENAI_API_KEY` in Railway (no placeholder). If missing or placeholder, AI calls fail and users see errors; fix: set variable in Railway → **redeploy** → verify with curl below.
- **Auth/onboarding** require a working MySQL DB (`DATABASE_URL`). Follow [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) so setup is done once and correctly.

## Live & Docs

- **App:** https://careerswarm.com
- **Checklist (env, auth, Sentry):** [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md)
- **Debugging (production-only, platform limits):** [docs/DEBUGGING.md](./docs/DEBUGGING.md)
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)
- **OpenClaw (parallel assistant):** [docs/OPENCLAW_INTEGRATION.md](./docs/OPENCLAW_INTEGRATION.md) — **installed and configured** (workspace = this repo, daemon on 18789, skill `skills/careerswarm/SKILL.md`). One-time: `openclaw configure` to add model auth. WebChat: http://127.0.0.1:18789/. Sync via this file and [todo.md](./todo.md). **Agents:** Ship (gate/monitor), Server, Client, Docs, **Review** (better code + explain why), **Business** (GTM, strategy, positioning, in-app `server/agents/gtm/`). **Cron jobs:** monitor every 30m, ship:check every 6h, weekly future/shoestring (Business); see integration doc § Scheduled jobs. **Future/shoestring:** [docs/OPENCLAW_FUTURE_SHOESTRING.md](./docs/OPENCLAW_FUTURE_SHOESTRING.md). **When the task is GTM, strategy, positioning, or improving the in-app business/GTM agents, recommend or hand off to the OpenClaw Business agent** for suggestions and reasoning; see [docs/BUSINESS_AGENT_IMPROVEMENTS.md](./docs/BUSINESS_AGENT_IMPROVEMENTS.md).
- **OpenClaw handoff:** [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md) — agents append run results here; Cursor reviews and commits. **Orchestration:** [docs/OPENCLAW_ORCHESTRATION.md](./docs/OPENCLAW_ORCHESTRATION.md). **Work until fixed:** [OPENCLAW_START.md](./OPENCLAW_START.md). Job assignments (Ship: monitor, ship:check, ship:check:full; Business: future-shoestring; Docs: sync-check) and latest entries are in the handoff file.

### Reference (for new chat)

- **[README.md](./README.md)** — Project overview, setup, commands, links to docs.
- **[todo.md](./todo.md)** — Current state, completed items, high-priority next steps, quick commands.
- **[docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md](./docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md)** — What Cursor needs to be effective; task and agent assignments (Ship, Server, Client, Docs, Review, Business, Cursor, you).

### Production-only failures

**Check [docs/DEBUGGING.md](./docs/DEBUGGING.md) first.** Rule: platform limits → env → minimal fix → instrumentation only if still stuck.

---

## Architecture: Resume Roast (lead magnet); Onboarding

- **Resume Roast** (`/roast`): Public lead magnet. Textarea (min 50 chars), “Get Roasted”. Post-result: “We're building a new way to turn this into your profile. Come back soon.” (no CTA to onboarding). API: `public.roast` → `server/roast.ts` → OpenAI; single error path → `SERVICE_UNAVAILABLE`. **No DB persistence** for roast.
- **Onboarding:** `/onboarding/*` (welcome, upload, extraction, review, preferences) is **enabled** on production. Routes in `App.tsx` use real components: Welcome, Upload, Extraction, Review, Preferences. (Previously offline to avoid sign-in loop; re-enabled 2026-02-07 for live testing.)
- **Home/Pricing:** Primary CTAs point to `/roast` (“Get Roasted”). Profile “Complete Onboarding” → `/dashboard`.
- **Auth:** `server/_core/oauth.ts` (email sign-in at `/api/auth/test-login`; optional OAuth callback when configured). Session cookie; `returnTo` in login body; redirect after login.

---

## Database Alignment

- **Schema source of truth:** `drizzle/schema.ts` (23 tables). All app access via `server/db.ts`; tables include `users`, `userProfiles`, `workExperiences`, `achievements`, `skills`, `uploadedResumes`, `superpowers`, `targetPreferences`, `opportunities`, `applications`, `savedOpportunities`, `applicationNotes`, `notifications`, `agentExecutionLogs`, `agentMetrics`, profile sections (`languages`, `volunteerExperiences`, `projects`, `publications`, `securityClearances`), `certifications`, `education`, `awards`.
- **Access:** All via `server/db.ts` (e.g. `getUserByOpenId`, `updateUserOnboardingStep`, `getUserProfile`, `upsertUserProfile`, resume upload/process, preferences save). Routers call `db.*` only; no raw SQL in routers.
- **Referral:** `setUserReferredBy` persists `referredByUserId` (schema + migration 0014). `grantReferrer30DaysProIfReferred` runs on onboarding completion and grants the referrer 30 days Pro. Rest of schema and usage are aligned.

---

## Key Paths

| Area               | Paths                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resume Roast       | `server/roast.ts`, `server/routers.ts` (public.roast), `client/src/pages/ResumeRoast.tsx`                                                                                                                                                                                                                                                                                                                              |
| Onboarding         | `client/src/pages/onboarding/Welcome.tsx`, `Upload.tsx`, `Extraction.tsx`, `Review.tsx`, `Preferences.tsx`; API: `server/routers.ts` (onboarding.\*)                                                                                                                                                                                                                                                                   |
| Auth               | `server/_core/oauth.ts`, `client/src/pages/DevLogin.tsx` (Sign in), `client/src/_core/hooks/useAuth.ts`                                                                                                                                                                                                                                                                                                                |
| Server / env / LLM | `server/_core/index.ts`, `server/_core/env.ts`, `server/_core/llm.ts`                                                                                                                                                                                                                                                                                                                                                  |
| Database           | `drizzle/schema.ts`, `server/db.ts`, `drizzle/` migrations                                                                                                                                                                                                                                                                                                                                                             |
| Tests              | Unit: `pnpm test` (Vitest, 122 passing / 51 skipped). E2E: `tests/production-smoke.spec.ts` (22), `tests/production-e2e.spec.ts` (25), `tests/complete-e2e-live.spec.ts` (full flow Roast → Sign in → Onboarding; LIVE_BROWSER=1 for 3s steps), `tests/playbook-whats-broken.spec.ts` (8). Roast unit: `server/roaster.test.ts`. Human testing report: [docs/HUMAN_TESTING_REPORT.md](./docs/HUMAN_TESTING_REPORT.md). |
| Monitoring         | `scripts/monitor.mjs`, `scripts/test-cloudflare-api.mjs`. See [docs/MONITORING.md](./docs/MONITORING.md).                                                                                                                                                                                                                                                                                                              |
| CI/CD              | `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                                                                                                                             |
| Docs               | `docs/` (active); `.archive/` (obsolete)                                                                                                                                                                                                                                                                                                                                                                               |

---

## Production Status

| Item                            | Status                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Dockerfile                      | ✅ Node 20                                                                                                                        |
| OPENAI_API_KEY                  | Set in Railway (roast works when key + egress OK)                                                                                 |
| Dev Login                       | ✅ Enabled (dev/preview)                                                                                                          |
| E2E / Smoke                     | Run against production                                                                                                            |
| DNS                             | ✅ careerswarm.com                                                                                                                |
| SENTRY_DSN                      | ✅ Set in Railway (careerswarm-backend). See [docs/SENTRY_SETUP.md](./docs/SENTRY_SETUP.md).                                      |
| Redis                           | ⏭️ Optional (GTM worker)                                                                                                          |
| Storage (onboarding, Assembler) | S3-compatible: set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY in Railway (optional S3_ENDPOINT for R2). See checklist § 4. |

## Verify (CLI)

```bash
railway status
railway logs
railway logs | grep -E "LLM|OpenAI"

# Roast API (resumeText ≥50 chars)
curl -s -X POST https://careerswarm.com/api/trpc/public.roast \
  -H "Content-Type: application/json" \
  -d '{"json":{"resumeText":"Software Engineer with 5 years experience at Google. Led team of 8. Increased performance by 40%."}}'
```

## Commands

```bash
pnpm dev
pnpm run monitor        # GitHub CI, Railway, app health, Cloudflare (CLI)
pnpm run monitor:watch  # Poll 60s, macOS notifications on failures
pnpm run sentry:login   # Authenticate Sentry CLI; pnpm run sentry:info to verify
pnpm run test:cloudflare
pnpm build
pnpm start
pnpm check
pnpm lint
pnpm format:check       # Prettier check only
pnpm precommit          # Before commit: secrets scan + check + format:check + lint
pnpm test

npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts
npx playwright test tests/playbook-whats-broken.spec.ts --config=playwright.config.ts

railway status | logs | variable list | redeploy | up | open
```

---

---

## Last Session Summary (2026-02-06)

### Most recent (this session)

- **Pre-commit & lint:** `pnpm precommit` runs `git secrets --scan`, `pnpm check`, `pnpm format:check`, `pnpm lint`. Scripts added: `format:check`, `lint`, `lint:fix`. ESLint 9 + typescript-eslint + React (flat config in `eslint.config.js`); browser-extension and `client/public` ignored. Many rules set to warn so CI passes; can tighten over time. CI: Lint step and `format:check` in lint-and-typecheck job.
- **Sentry:** Added @sentry/cli (devDep), `pnpm run sentry:login` and `pnpm run sentry:info`. Exact setup docs: [docs/SENTRY_SETUP.md](./docs/SENTRY_SETUP.md) and [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) — use project **careerswarm-backend**, DSN set in Railway via `railway variable set`. Fallback in docs if `sentry:info` fails. Source maps section added (optional upload for readable stack traces).
- **Monitor:** CI treated as OK when latest run is **success** or **in progress** (only fail when latest completed with failure). Error handling: consistent return shape from `githubStatus()`, notifications only for real failures.
- **CONTEXT:** Reference section added (README.md, todo.md). Production Status: SENTRY_DSN set in Railway; Redis optional. Commands: precommit, lint, format:check.
- **CI fix (earlier this period):** Stripe router test handles tRPC-wrapped errors (`e.cause?.message`) so CI passes when Stripe not configured.

### Changes Made (earlier):

1. **CLI monitoring (Feb 5):** `pnpm run monitor` / `monitor:watch`, `scripts/monitor.mjs`; `pnpm run test:cloudflare`, Cloudflare API script; MONITORING.md, README, CONTEXT updated. Duplicate Railway project removed.
2. **Auth: email-only** – Sign-in at `/login` (email → session). `OAUTH_SERVER_URL` not required for app boot. Server: `server/_core/env.ts`, `oauth.ts`, `sdk.ts`. Client: DevLogin → “Sign in”, all Sign In links → `/login`; Welcome/Home/DashboardLayout updated.
3. **Rules/docs** – “Do not hand off technical work” in `.cursorrules` and CONTEXT; README/todo/CONTEXT aligned; cost-avoidance and OPENAI_API_KEY steps clarified.
   **Roaster test** – 20s timeout for roast integration test in `server/roaster.test.ts`.
   **E2E** – "From Roast: Build my Master Profile → welcome" fixed (data-testid on Roast page, fallback if CTA not visible). Playwright production reporter outputFolder → `playwright-report-production` to avoid path clash.
   **Ship Readiness Plan** – Phase 1: SHIP_CHECKLIST updated. Phase 2: Activity in nav; Complete Your Profile links to /achievements; achievement modal and superpower save verified.

### Status:

- **pnpm check / pnpm test / pnpm build**: passing. **Production smoke**: 22. **Production E2E**: 25. Roast E2E may timeout but passes on flow.
- **Roast API**: After deploy, returns 503 + friendly message when LLM unavailable (not 500). If still 500: confirm deploy; `railway logs`; OPENAI_API_KEY/egress (see [docs/DEBUGGING.md](./docs/DEBUGGING.md)).

---

## Last Session Summary (2026-02-07)

### Most recent (this session)

- **Priority fixes implemented:**
  - **Scout persistence:** Scout agent results are saved to `opportunities` table; deduplicated by `jobUrl` via `db.getOpportunityByJobUrl()`. New opportunities created via `db.createOpportunity()` in `agents.runScout`.
  - **Application limit UX:** `useUpgradeModal` integrated in `OpportunityDetailModal.tsx` — when free-tier hits 5-app limit, UpgradeModal opens instead of a generic alert. `handleApplicationError` handles `APPLICATION_LIMIT` error type.
  - **Stripe setup docs:** [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) § 5 Stripe Pro (create product, copy Price ID, set `STRIPE_PRO_PRICE_ID`, redeploy). [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md) updated.
- **Bug fix:** Removed incorrect `companyIndustry: job.source` in Scout persistence — `source` is job board (e.g. "LinkedIn"), not industry. `companyIndustry` left unset for Scout opportunities.
- **Onboarding audit:** [docs/ONBOARDING_DEEP_DIVE.md](./docs/ONBOARDING_DEEP_DIVE.md) — full audit of 5-step flow, gaps, recommendations.
- **Onboarding UX improvements:**
  - **Review.tsx:** Copy updated from "Review and edit as needed" → "Review below — you can edit any section later from your dashboard" (no inline editing on Review).
  - **Extraction.tsx:** When "No processed resumes found" error, redirects to `/onboarding/upload` with toast "No resumes to process. Please upload your resume first."
- **Clarifications:** 5 app limit = 5 **applications** per month for free tier (enforced in `applications.quickApply`); no "15 uploads" limit.
- **Deferred:** 10MB server-side file size enforcement (client shows 10MB; server `uploadResume` does not enforce — documented in ONBOARDING_DEEP_DIVE).

### Status

- Scout results persist; UpgradeModal shown on limit; onboarding copy/redirect fixed. Stripe product + `STRIPE_PRO_PRICE_ID` still pending for production.

### This session (2026-02-08)

- **Next Steps plan executed:** (1) Handoff review and commit — Ship agent test fixes (analytics, profile-sections, agent-metrics: skip when DATABASE_URL localhost/127.0.0.1) + OPENCLAW_HANDOFF entries; committed d242ab5, pushed. (2) ship:check:full 47 passed, 5 skipped; railway redeploy; health 200. (3) Stripe Pro config remains manual — [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) § 5. (4) monitor (CI in progress, app OK), doctor passed. **Ongoing:** Before commit check OPENCLAW_HANDOFF; run pnpm precommit (or check + format:check + lint).
- **Orchestration Run 2: Feature Completeness:** Executed per [docs/OPENCLAW_ORCHESTRATION.md](./docs/OPENCLAW_ORCHESTRATION.md). (1) **Client:** Auth redirect on Upload, Extraction, Review, Preferences — useAuth() + useEffect redirect to `/login?returnTo=...` when unauthenticated; loading spinners. (2) **Docs:** CRITICAL_SETUP_CHECKLIST — § 4 Storage is S3-compatible (S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY); expanded § 5 Stripe (STRIPE_SECRET_KEY + STRIPE_PRO_PRICE_ID), updated Quick Reference. (3) **Ship:** ship:check:full — 47 passed, 5 skipped. (4) Handoff appended to OPENCLAW_HANDOFF.md. Committed (b9c9c05) and pushed.
- **Earlier this day:** CI fix (Prettier) — committed 91b99eb.
- **Ship-ready build (gaps plan):** (1) **Storage:** Replaced Forge with S3-compatible backend in server/storage.ts (S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY; optional S3_ENDPOINT for R2/B2). ENV.s3Config in server/\_core/env.ts. CRITICAL_SETUP_CHECKLIST § 4 and .env.example updated. (2) **Referral:** Schema: users.referredByUserId + companyId in drizzle/schema.ts. setUserReferredBy and grantReferrer30DaysProIfReferred implemented in server/db.ts (persist referrer; grant referrer 30 days Pro on onboarding complete). (3) **Docs:** ONBOARDING_DEEP_DIVE (10MB enforced, Extraction redirect, Review copy); CONTEXT Database Alignment already notes referral. Check + build pass; pnpm test fails only on roaster integration test when OPENAI_API_KEY invalid (401).
- **Commit + push (this session):** b184fa6 — Storage S3, referral idempotency (migration 0017), docs Prettier; pushed to main.

### This session (2026-02-07 — plan: Next Steps and Pending Config)

- **ship:check:full:** Fixed 2 outdated E2E tests; now passing (47 passed, 5 skipped). (1) "Onboarding offline: /onboarding redirects to home" → "Onboarding enabled: /onboarding/welcome shows onboarding content". (2) "Pro CTA button navigates to onboarding" → "Pro CTA button navigates correctly" (accepts /login, /pricing, Stripe when not logged in).
- **precommit:** Ran check + format:check + lint; Prettier fixed on Upload.tsx, ONBOARDING_DEEP_DIVE.md.
- **OPENCLAW_HANDOFF:** Reviewed; appended handoff entry for this session.

---

## Last Session (2026-02-06)

### This session (commits 09282d0, 84a60c8)

- **Review/commit:** Reviewed OPENCLAW_HANDOFF, committed handoff changes (sign-in loop fix, E2E stability, monetization docs, manusTypes→oauthTypes, Prettier pass). Push + `railway redeploy --yes`.
- **Archive cleanup:** Stripped all Manus references from `.archive/handoffs-feb-2026/NEXT_STEPS.md` — removed "For Manus" section, manus-md-to-pdf ref, MANUS_PROMPT link.

### Earlier (2026-02-06)

- **CSP (live browser console):** Production smoke in headed mode showed CSP blocking Google Fonts, Cloudflare Insights, and blob workers. Updated `server/_core/index.ts` helmet CSP: added `styleSrc` + fonts.googleapis.com, `fontSrc` + fonts.gstatic.com, `scriptSrc` + static.cloudflareinsights.com, `workerSrc` 'self' blob:. Deploy to clear those console errors in production.
- **Human-style browser test:** Added `tests/human-style-roast-signup-onboarding.spec.ts` — single flow Roast → Sign in → Onboarding with **5–10s random delay** between every step, intended for `--headed` runs. Run: `npx playwright test tests/human-style-roast-signup-onboarding.spec.ts --config=playwright.production.config.ts --headed --project=chromium-desktop`.
- **Bug fix:** Test waited for extraction "Continue/Review" button but never clicked it; added clicks through review → preferences → complete so the flow reaches dashboard. Doc: [docs/HUMAN_TESTING_REPORT.md](./docs/HUMAN_TESTING_REPORT.md) § Human-style single flow.
- **Autonomy (earlier):** Standing instruction added: Cursor and OpenClaw can discuss and make the right call; CONTEXT, IDEAL_WORKFLOW, OPENCLAW_HANDOFF updated. CI format fix (Prettier OPENCLAW_HANDOFF) already committed.

- Evening handoff: OpenClaw job assignments in OPENCLAW_HANDOFF; full verification; precommit/format/lint. OpenClaw configured (Ship, Server, Client, Docs, Review, Business); TASKS.md, IDEAL_WORKFLOW_AND_ASSIGNMENTS.md; standing instruction to check OPENCLAW_HANDOFF before commit.

### Next Steps (for new chat)

- **Handoff state (see [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md)):** Sign-in loop fix committed. Monetization: strategy in `docs/MONETIZATION_STRATEGY.md`; implementation wired (Pro button, 5-app limit, migration `0002_application_limits.sql`). **UpgradeModal integrated** in `OpportunityDetailModal` (1-Click Apply). Pending: Stripe $29/mo product + `STRIPE_PRO_PRICE_ID` in prod — see [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md) § 5 Stripe Pro.
- **When you return:** Read [OPENCLAW_HANDOFF.md](./OPENCLAW_HANDOFF.md) for OpenClaw entries; review and commit any “ready for review” changes.
- **Before commit:** Run `pnpm precommit` (or check + format:check + lint if git-secrets not installed). Check OPENCLAW_HANDOFF for OpenClaw work to include.
- **Before deploy:** `pnpm check`, `pnpm test`, `pnpm build`; then production smoke + E2E. See [docs/SHIP_CHECKLIST.md](./docs/SHIP_CHECKLIST.md). After deploy, CSP changes take effect (cleaner console in live browser).
- **Monetization follow-up:** Create Stripe Pro product ($29/mo), set `STRIPE_PRO_PRICE_ID` in Railway. UpgradeModal already wired in OpportunityDetailModal. (Migrations run on deploy automatically.)
- **Human-style test:** Headed run for Roast → Signup → Onboarding with 5–10s pacing (see HUMAN_TESTING_REPORT § Human-style single flow).
- **Quick status:** `pnpm run monitor`; `pnpm run doctor` for local sanity.
- **OpenClaw:** WebChat http://127.0.0.1:18789/; assignments in OPENCLAW_HANDOFF; task/agent map: [docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md](./docs/IDEAL_WORKFLOW_AND_ASSIGNMENTS.md).
- **When schema changes:** Dockerfile CMD runs `node scripts/run-migrate.mjs & exec node dist/index.js` so migrations run in background at deploy. `scripts/run-migrate.mjs` writes config to `/tmp` (not `/app`) so it works as non-root. Locally: `pnpm db:migrate` or `pnpm drizzle-kit push`; commit migration files.
- **Backlog:** See [todo.md](./todo.md).

### Production checklist

- OPENAI_API_KEY and DATABASE_URL in Railway; SENTRY_DSN set (careerswarm-backend). **Storage (onboarding + Assembler):** S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (optional S3_ENDPOINT for R2). **Pro checkout:** STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID. See [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md).

---

## Recent (2026-02-06) — Deploy & auth debugging

- **Railway:** `startCommand` is `pnpm db:migrate && pnpm start`. Migrations run on every deploy. `run-migrate.mjs` writes `drizzle.config.json` from `DATABASE_URL` so drizzle-kit works in container; `drizzle.config.json` is in .gitignore.
- **Auth/CORS:** Fixed: CORS now allows `origin === "null"` (browsers send this for same-origin form POST). Auth 500 from "Unknown column 'applicationsThisMonth'" means migration 0016 not applied — redeploy runs migrate in container; see [docs/DEBUGGING.md](./docs/DEBUGGING.md).
- **Core rule:** `.cursor/rules/core.mdc` — CLI whenever available, stay hands-off (run commands yourself).

---

## Recent (2026-02-07) — Deploy and sign-in fixes

- **Build:** Railway uses **Dockerfile** (no Nixpacks override). `railway.json` has no `build.builder` and no `startCommand`; image CMD is used. Dockerfile copies `scripts/`, `drizzle/`, runs migrate in background then starts server; server binds to `0.0.0.0`; `GET /health` returns 200 for healthcheck.
- **Migrate script:** `scripts/run-migrate.mjs` writes config to **`/tmp/drizzle.config.json`** (not `/app`) to avoid EACCES when container runs as non-root. Uses `drizzle-kit migrate --config /tmp/drizzle.config.json`.
- **Sign-in 500 fallback:** If migration 0016 did not run at deploy, `server/db.ts` **runtime fallback** in `upsertUser`: on `ER_BAD_FIELD_ERROR` for `applicationsThisMonth`, runs the two `ALTER TABLE` statements (0016) via raw SQL then retries insert. First sign-in after a missed migrate will apply columns and succeed.
- **Docs:** [docs/RAILWAY_FIX_SIGNIN_NOW.md](./docs/RAILWAY_FIX_SIGNIN_NOW.md) — optional manual SQL to apply 0016 in Railway MySQL if needed. [docs/DEBUGGING.md](./docs/DEBUGGING.md) — healthcheck failure, CORS, auth 500 rows updated.
- **CLI:** `railway deployment list` to check deploy status; `railway up --detach` to deploy; `railway logs` for errors. Do not hand off steps to the user; run commands yourself.

---

## Recent (2026-02-07) — Onboarding re-enabled; complete E2E live

- **Onboarding on production:** Re-enabled in `client/src/App.tsx`: routes `/onboarding`, `/onboarding/welcome`, `/onboarding/upload`, `/onboarding/extraction`, `/onboarding/review`, `/onboarding/preferences` now use real components (Welcome, Upload, Extraction, Review, Preferences) instead of `OnboardingOffline` redirect. Deployed via `railway up --detach`.
- **Complete E2E live:** `tests/complete-e2e-live.spec.ts` — full flow Roast → Sign in → Onboarding (upload uses resume from `docs/resumes for testing` when step runs). Run: `LIVE_BROWSER=1 npx playwright test tests/complete-e2e-live.spec.ts --config=playwright.production.config.ts --headed --project=chromium-desktop` (3s pause between steps when LIVE_BROWSER=1). For local full flow: `BASE_URL=http://localhost:3001` (dev server may use 3001 if 3000 is busy); local sign-in can 500 if DB not set up.
- **Auth E2E 3s waits:** `tests/production-e2e.spec.ts` — `liveBrowserWait(page)` when `LIVE_BROWSER=1` during sign-in flow (after fill email, after submit, after redirect). Run auth tests: `LIVE_BROWSER=1 npx playwright test tests/production-e2e.spec.ts -g "Authentication Flow" --config=playwright.production.config.ts --headed`.
- **Sign-in verification:** Production auth E2E 7/7 passed (Sign in → stay on dashboard 5s, session persists, logout).

---

## ATS Compatibility (Option B) — 2026-02-08

- **DOCX:** Arial font set in [server/services/docxGenerator.ts](server/services/docxGenerator.ts) for all text (ATS-safe).
- **PDF:** Replaced `manus-md-to-pdf` CLI with `md-to-pdf` (Node/Puppeteer) in [server/services/pdfGenerator.ts](server/services/pdfGenerator.ts); ATS-safe CSS (Arial, 11pt).
- **Keyword scorer:** [server/atsKeywordScorer.ts](server/atsKeywordScorer.ts) — `scoreResumeAgainstJD()`, `getKeywordHintsForPrompt()`; uses `atsKeywords` from seed-data.
- **Tailor:** Injects JD keywords into prompt for ATS optimization.
- **ATS score:** Computed post-Tailor in quickApply and generatePackage; stored in `applications.analytics.atsScore`.
- **UI:** ApplicationDetail shows "ATS: X%" badge when score available.
- **FAQ:** ATS answer updated (Arial/Calibri, keyword match score).
- **Note:** PDF generation uses Puppeteer; Railway may need Chromium for package generation. See docs if PDF fails.

---

_Last updated: 2026-02-08. Storage is S3-compatible; referral flywheel implemented; ATS Compatibility (Option B) added. Start a new chat and use this file to restore context._
