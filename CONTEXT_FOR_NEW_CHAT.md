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

---

## What It Is

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline (Scout → Qualifier → Profiler → Tailor → Scribe → Assembler → Success Predictor). **Resume Roast** (public, no auth), application tracker (Kanban), package generation (resume / cover letter / LinkedIn). Optional GTM pipeline worker (requires Redis).

## Stack

- **Frontend:** React 19, Tailwind 4, tRPC, shadcn/ui, wouter (routing)
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Railway). Schema: `drizzle/schema.ts`; all app tables (users, userProfiles, uploadedResumes, targetPreferences, opportunities, applications, etc.) are defined there and used via `server/db.ts`. Migrations: `drizzle/*.sql` + `drizzle/meta/_journal.json`.
- **Auth:** OAuth (Manus) in production; Dev Login at `/login` for dev/preview. **We can use whatever auth is necessary**; both support `returnTo` for deep links. See `docs/CRITICAL_SETUP_CHECKLIST.md` § Auth.
- **AI:** OpenAI API (`OPENAI_API_KEY`), GPT-4o-mini default. Roast uses `server/roast.ts` → `server/_core/llm.ts` (`invokeLLM`).
- **Deploy:** Railway (Dockerfile, Node 20)

## Live & Docs

- **App:** https://careerswarm.com
- **Checklist (env, auth, Sentry):** [docs/CRITICAL_SETUP_CHECKLIST.md](./docs/CRITICAL_SETUP_CHECKLIST.md)
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)

---

## Architecture: Resume Roast → Onboarding

- **Resume Roast** (`/roast`): Public. One page: textarea (min 50 chars), “Get Roasted”, “Build my Master Profile” (header + after result). API: `public.roast` → `server/roast.ts` → OpenAI; single error path → `SERVICE_UNAVAILABLE`. Client shows result (`data-testid="roast-result"`) or error (`data-testid="roast-error"`). **No DB persistence** for roast.
- **Build my Master Profile:** `setLocation("/onboarding/welcome")`.
- **Onboarding** (`/onboarding/welcome` → upload → extraction → review → preferences): Uses `useAuth()`. If not logged in → modal → OAuth or `/login?returnTo=/onboarding/welcome`. After login, redirect to `returnTo`. All onboarding API procedures are `protectedProcedure`; DB: `users.onboardingStep` / `onboardingCompleted`, `uploadedResumes`, `userProfiles`, `targetPreferences` (see `server/db.ts`).
- **Auth:** `server/_core/oauth.ts` (OAuth callback + Dev test-login). Session cookie; `returnTo` in OAuth state or Dev Login body; redirect after login.

---

## Database Alignment

- **Schema source of truth:** `drizzle/schema.ts`. Tables used by app: `users`, `userProfiles`, `workExperiences`, `achievements`, `skills`, `uploadedResumes`, `superpowers`, `targetPreferences`, `opportunities`, `applications`, `savedOpportunities`, `applicationNotes`, `notifications`, `agentExecutionLogs`, `agentMetrics`, profile sections (`languages`, `volunteerExperiences`, `projects`, `publications`, `securityClearances`), `certifications`, `education`, `awards`.
- **Access:** All via `server/db.ts` (e.g. `getUserByOpenId`, `updateUserOnboardingStep`, `getUserProfile`, `upsertUserProfile`, resume upload/process, preferences save). Routers call `db.*` only; no raw SQL in routers.
- **Note:** `setUserReferredBy` in `db.ts` is a stub (no `referredBy` column on `users`); referral flywheel not persisted yet. Rest of schema and usage are aligned.

---

## Key Paths

| Area | Paths |
|------|--------|
| Resume Roast | `server/roast.ts`, `server/routers.ts` (public.roast), `client/src/pages/ResumeRoast.tsx` |
| Onboarding | `client/src/pages/onboarding/Welcome.tsx`, `Upload.tsx`, `Extraction.tsx`, `Review.tsx`, `Preferences.tsx`; API: `server/routers.ts` (onboarding.*) |
| Auth | `server/_core/oauth.ts`, `client/src/pages/DevLogin.tsx`, `client/src/const.ts` (getLoginUrl), `client/src/_core/hooks/useAuth.ts` |
| Server / env / LLM | `server/_core/index.ts`, `server/_core/env.ts`, `server/_core/llm.ts` |
| Database | `drizzle/schema.ts`, `server/db.ts`, `drizzle/` migrations |
| Tests | `tests/production-e2e.spec.ts`, `tests/production-smoke.spec.ts`; roast unit: `server/roaster.test.ts` |
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
pnpm build
pnpm start
pnpm check
pnpm test

npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts

railway status | logs | variable list | redeploy | up | open
```

---

---

## Last Session Summary (2026-02-04)

### Changes Made:
1. **CORS fix** - Added `localhost:3001` to allowed origins in `server/_core/index.ts`
2. **Homepage headline** - Changed to **"Stop Applying. Start Infiltrating."** in `client/src/components/ui/psych/CopyConstants.ts`
3. **Navigation cleanup** - Removed broken nav links (`/resumes`, `/interview-prep`, `/skills-gap`, `/past-jobs`) from `DashboardLayout.tsx`
4. **Route fix** - Added missing `/achievements` route to `App.tsx`

### Features Verified Working:
- Homepage with new headline
- Resume Roast (form, validation, submit, error handling)
- Onboarding welcome page with sign-in prompt
- All navigation links
- Production smoke tests (22/22 passed)

### Pending (requires external deps):
- Resume Roast actual results (needs `OPENAI_API_KEY`)
- Auth/onboarding persistence (needs MySQL database)

---

*Last updated: 2026-02-04. All major features stable; headline updated; navigation fixed. Use this file to bootstrap a new chat.*
