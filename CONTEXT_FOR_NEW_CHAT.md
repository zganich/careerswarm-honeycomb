# CareerSwarm – Context for New Chat

**Purpose:** Copy or reference this file when starting a new chat to restore project context quickly. Update it as the project and handoff state change.

**Standing Instructions:**  
- **Use CLI every time there is access** (Railway, Cloudflare API, curl, etc.); use the dashboard only when the CLI/API does not support the action.  
- At 50-60% context usage, summarize the session's work and update this file before starting a new chat.

---

## What It Is

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline (Scout → Qualifier → Profiler → Tailor → Scribe → Assembler → Success Predictor). Resume Roast, application tracker (Kanban), package generation (resume / cover letter / LinkedIn). Optional GTM pipeline worker (requires Redis).

## Stack

- **Frontend:** React 19, Tailwind 4, tRPC, shadcn/ui
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Railway)
- **Auth:** Manus OAuth (Dev Login enabled for testing)
- **AI:** OpenAI API (`OPENAI_API_KEY`) - GPT-4o-mini default
- **Deploy:** Railway

## Live & Docs

- **App:** https://careerswarm.com
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)

## Recent Session (LLM Migration & Production Setup - Feb 4)

### Completed This Session
1. **Switched from Manus Forge to OpenAI**:
   - Updated `server/_core/llm.ts` to use OpenAI API directly
   - Updated `server/_core/env.ts` to support `OPENAI_API_KEY`
   - Default model: GPT-4o-mini ($0.15/$0.60 per 1M tokens)

2. **Production Configuration**:
   - ✅ Set `OPENAI_API_KEY` in Railway via CLI
   - ✅ Set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in GitHub Secrets
   - ✅ All E2E tests passing (18/18)
   - ✅ All smoke tests passing (11/11)

3. **Bug Fixes & Features**:
   - Fixed CI test failures (DB-dependent tests skip gracefully)
   - Implemented analytics `responseRateChange` calculation
   - Added rule-based analytics insights
   - Added manual entry fallback to onboarding wizard
   - DashboardHero: real resume pipeline (upload → processResumes → parseResumes)
   - Onboarding Extraction: call processResumes before parseResumes so flow works

4. **Scripts**:
   - `scripts/setup-checklist.mjs` - Checks production config status
   - Updated `scripts/validate-production.mjs` with LLM key check

### Prior Sessions
- Security middleware (helmet, cors, rate limiting)
- CI/CD pipeline with E2E tests
- Sentry and backup documentation

## Production Status

| Item | Status |
|------|--------|
| OpenAI API Key | ✅ Configured |
| GitHub Secrets | ✅ Configured |
| Dev Login | ✅ Enabled |
| E2E Tests | ✅ 18/18 passing |
| Smoke Tests | ✅ 22/22 passing (desktop + mobile) |
| Sentry | ⏭️ Optional (not configured) |

## Optional To Do

- **Sentry:** Create project at sentry.io, add `SENTRY_DSN` to Railway for error tracking
- **DNS:** careerswarm.com / www configured (see docs/CLOUDFLARE_DNS.md)
- **Redis:** Add for GTM worker (optional feature)

## High Priority Next Steps (completed 2026-02-04)

1. ~~Integration Tests: Resume Roast API call, Stripe checkout (test mode)~~ — Done: roaster.test.ts, stripe-router.test.ts, stripe router mounted at `appRouter.stripe`
2. ~~Onboarding Flow: Complete E2E test~~ — Done: production-e2e.spec.ts "Complete onboarding flow"
3. ~~Real-time progress for resume processing~~ — Done: SSE GET /api/resume-progress; DashboardHero and Extraction use EventSource
4. **CI:** E2E runs on push to main, PRs targeting main, and workflow_dispatch
5. **Production Metrics:** /metrics page + sidebar link; optional infra in docs/OPTIONAL_INFRASTRUCTURE.md

## Key Paths

| Area        | Paths |
|------------|-------|
| Server Entry | `server/_core/index.ts` (security middleware) |
| Env / LLM  | `server/_core/env.ts`, `server/_core/llm.ts` (OpenAI integration) |
| API        | `server/routers.ts` |
| DB         | `drizzle/schema.ts`, `drizzle/` migrations |
| Client     | `client/src/` |
| Onboarding | `client/src/components/MagicOnboardingWizard.tsx` |
| Tests      | `tests/production-e2e.spec.ts`, `tests/production-smoke.spec.ts` |
| CI/CD      | `.github/workflows/ci.yml` |
| Scripts    | `scripts/setup-checklist.mjs`, `scripts/validate-production.mjs` |
| Docs       | `docs/` (active); `.archive/` (obsolete, see .archive/README.md) |

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Run production server
pnpm test         # Vitest unit tests
pnpm check        # TypeScript type check

# Production Setup & Validation
node scripts/setup-checklist.mjs   # Check production config status

# E2E Tests (Production)
npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts

# Railway CLI (if linked) — prefer CLI over dashboard where possible
railway status         # Current project/service
railway variable list  # List env vars (set vars via dashboard: railway open → Variables)
railway logs           # View deployment logs
railway redeploy       # Redeploy without new code (e.g. after changing vars)
railway domain         # List/add domains
railway open           # Open project in browser when UI is needed
```

---

*Last updated: 2026-02-04 (Cleanup: archived obsolete scripts/docs, updated docs to OPENAI_API_KEY, consolidated .archive).*
