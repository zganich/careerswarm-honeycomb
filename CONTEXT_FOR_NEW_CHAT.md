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

---

## What It Is

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline (Scout → Qualifier → Profiler → Tailor → Scribe → Assembler → Success Predictor). **Resume Roast** (public, no auth), application tracker (Kanban), package generation (resume / cover letter / LinkedIn). Optional GTM pipeline worker (requires Redis).

## Stack

- **Frontend:** React 19, Tailwind 4, tRPC, shadcn/ui, wouter (routing)
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Railway). Schema: `drizzle/schema.ts` (23 tables); access via `server/db.ts`. Migrations: `drizzle/*.sql` + `drizzle/meta/_journal.json`.
- **Auth:** Email-only sign-in at `/login` (no OAuth/Manus). User enters email → session cookie; `returnTo` supported. Optional OAuth when `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are set. See `docs/CRITICAL_SETUP_CHECKLIST.md` § Auth.
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

### Production-only failures

**Check [docs/DEBUGGING.md](./docs/DEBUGGING.md) first.** Rule: platform limits → env → minimal fix → instrumentation only if still stuck.

---

## Architecture: Resume Roast → Onboarding

- **Resume Roast** (`/roast`): Public. One page: textarea (min 50 chars), “Get Roasted”, “Build my Master Profile” (header + after result). API: `public.roast` → `server/roast.ts` → OpenAI; single error path → `SERVICE_UNAVAILABLE`. Client shows result (`data-testid="roast-result"`) or error (`data-testid="roast-error"`). **No DB persistence** for roast.
- **Build my Master Profile:** `setLocation("/onboarding/welcome")`.
- **Onboarding** (`/onboarding/welcome` → upload → extraction → review → preferences): Uses `useAuth()`. If not logged in → modal → `/login?returnTo=/onboarding/welcome`. After login, redirect to `returnTo`. All onboarding API procedures are `protectedProcedure`; DB: `users.onboardingStep` / `onboardingCompleted`, `uploadedResumes`, `userProfiles`, `targetPreferences` (see `server/db.ts`).
- **Auth:** `server/_core/oauth.ts` (email sign-in at `/api/auth/test-login`; optional OAuth callback when configured). Session cookie; `returnTo` in login body; redirect after login.

---

## Database Alignment

- **Schema source of truth:** `drizzle/schema.ts` (23 tables). All app access via `server/db.ts`; tables include `users`, `userProfiles`, `workExperiences`, `achievements`, `skills`, `uploadedResumes`, `superpowers`, `targetPreferences`, `opportunities`, `applications`, `savedOpportunities`, `applicationNotes`, `notifications`, `agentExecutionLogs`, `agentMetrics`, profile sections (`languages`, `volunteerExperiences`, `projects`, `publications`, `securityClearances`), `certifications`, `education`, `awards`.
- **Access:** All via `server/db.ts` (e.g. `getUserByOpenId`, `updateUserOnboardingStep`, `getUserProfile`, `upsertUserProfile`, resume upload/process, preferences save). Routers call `db.*` only; no raw SQL in routers.
- **Note:** `setUserReferredBy` in `db.ts` is a stub (no `referredBy` column on `users`); referral flywheel not persisted yet. Rest of schema and usage are aligned.

---

## Key Paths

| Area | Paths |
|------|--------|
| Resume Roast | `server/roast.ts`, `server/routers.ts` (public.roast), `client/src/pages/ResumeRoast.tsx` |
| Onboarding | `client/src/pages/onboarding/Welcome.tsx`, `Upload.tsx`, `Extraction.tsx`, `Review.tsx`, `Preferences.tsx`; API: `server/routers.ts` (onboarding.*) |
| Auth | `server/_core/oauth.ts`, `client/src/pages/DevLogin.tsx` (Sign in), `client/src/_core/hooks/useAuth.ts` |
| Server / env / LLM | `server/_core/index.ts`, `server/_core/env.ts`, `server/_core/llm.ts` |
| Database | `drizzle/schema.ts`, `server/db.ts`, `drizzle/` migrations |
| Tests | Unit: `pnpm test` (Vitest, 122 passing / 51 skipped). E2E: `tests/production-smoke.spec.ts` (22), `tests/production-e2e.spec.ts` (25), `tests/playbook-whats-broken.spec.ts` (8). Roast unit: `server/roaster.test.ts`. Human testing report: [docs/HUMAN_TESTING_REPORT.md](./docs/HUMAN_TESTING_REPORT.md). |
| Monitoring | `scripts/monitor.mjs`, `scripts/test-cloudflare-api.mjs`. See [docs/MONITORING.md](./docs/MONITORING.md). |
| CI/CD | `.github/workflows/ci.yml` |
| Docs | `docs/` (active); `.archive/` (obsolete) |

---

## Production Status

| Item | Status |
|------|--------|
| Dockerfile | ✅ Node 20 |
| OPENAI_API_KEY | Set in Railway (roast works when key + egress OK) |
| Dev Login | ✅ Enabled (dev/preview) |
| E2E / Smoke | Run against production |
| DNS | ✅ careerswarm.com |
| Sentry / Redis | ⏭️ Optional |

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
pnpm build
pnpm start
pnpm check
pnpm test

npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts
npx playwright test tests/playbook-whats-broken.spec.ts --config=playwright.config.ts

railway status | logs | variable list | redeploy | up | open
```

---

---

## Last Session Summary (2026-02-05)

### Most recent (this session)
- **CLI monitoring:** Added `pnpm run monitor` and `pnpm run monitor:watch` (GitHub CI, Railway, app health, Cloudflare). Scripts: `scripts/monitor.mjs`.
- **Cloudflare:** Added `scripts/test-cloudflare-api.mjs` and `pnpm run test:cloudflare`. CLOUDFLARE_ZONE_ID + CLOUDFLARE_API_TOKEN in .env.example. Fixed credential-like placeholders in MONITORING.md.
- **Onboarding E2E:** 5s human-like waits and `logStep()` in production-e2e.spec.ts; fixed "Sign in and stay on dashboard" test (unique email).
- **Railway:** Deleted duplicate careerswarm project (old Postgres/Redis/web/worker); one project now (careerswarm-app + MySQL-E6eq).
- **Docs:** MONITORING.md, README, CONTEXT, cursor rules, SHIP_CHECKLIST, todo updated.

### Changes Made (earlier):
1. **Auth: email-only** – Removed Manus/OAuth requirement. Sign-in at `/login` (email → session). `OAUTH_SERVER_URL` no longer required for app boot. Server: `server/_core/env.ts`, `oauth.ts`, `sdk.ts`. Client: DevLogin → “Sign in”, all Sign In links → `/login`; Welcome/Home/DashboardLayout updated. Docs and `.env.example` updated.
2. **Rules/docs** – “Do not hand off technical work” in `.cursorrules` and CONTEXT; README/todo/CONTEXT aligned; cost-avoidance and OPENAI_API_KEY steps clarified.
3. **Roaster test** – 20s timeout for roast integration test in `server/roaster.test.ts`.
4. **E2E** – "From Roast: Build my Master Profile → welcome" fixed (data-testid on Roast page, fallback if CTA not visible). Playwright production reporter outputFolder → `playwright-report-production` to avoid path clash.
5. **Ship Readiness Plan** – Phase 1: SHIP_CHECKLIST updated. Phase 2: Activity in nav; Complete Your Profile links to /achievements; achievement modal and superpower save verified.

### Status:
- **pnpm check / pnpm test / pnpm build**: passing. **Production smoke**: 22. **Production E2E**: 25. Roast E2E may timeout but passes on flow.
- **Roast API**: After deploy, returns 503 + friendly message when LLM unavailable (not 500). If still 500: confirm deploy; `railway logs`; OPENAI_API_KEY/egress (see [docs/DEBUGGING.md](./docs/DEBUGGING.md)).

### Next Steps (for new chat)
- Run check + build + test and production smoke + E2E before deploy (all currently passing: 22 smoke, 25 E2E).
- Use `pnpm run monitor` for quick status; `pnpm run test:cloudflare` to verify Cloudflare API.
- Optional: Sentry DSN in Railway; Redis for GTM.
- Onboarding E2E: use `tests/production-e2e.spec.ts`; `onboarding-flow.spec.ts` is documented as skipped (see SHIP_CHECKLIST, HUMAN_TESTING_REPORT).

### Production checklist (unchanged)
- OPENAI_API_KEY in Railway + redeploy; DATABASE_URL for MySQL. See [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md).

---

*Last updated: 2026-02-05. Start a new chat and use this file to restore context.*
