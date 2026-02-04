# CareerSwarm – Context for New Chat

**Purpose:** Copy or reference this file when starting a new chat to restore project context quickly. Update it as the project and handoff state change.

---

## What It Is

AI-powered career evidence platform: Master Profile, achievements (STAR), 7-stage agent pipeline (Scout → Qualifier → Profiler → Tailor → Scribe → Assembler → Success Predictor). Resume Roast, application tracker (Kanban), package generation (resume / cover letter / LinkedIn). Optional GTM pipeline worker (requires Redis).

## Stack

- **Frontend:** React 19, Tailwind 4, tRPC, shadcn/ui
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Railway)
- **Auth:** Manus OAuth
- **AI:** Manus Forge API (`BUILT_IN_FORGE_API_KEY`)
- **Deploy:** Railway

## Live & Docs

- **App:** https://careerswarm.com
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)

## Recent Session (Security & CI/CD - Feb 4)

### Completed This Session
1. **Security Middleware** - Added to `server/_core/index.ts`:
   - `helmet` (security headers, CSP in production)
   - `cors` (configured for careerswarm.com + localhost dev)
   - `express-rate-limit` (100 req/15min API, 20 req/15min auth)

2. **CI/CD Pipeline** - Created `.github/workflows/ci.yml`:
   - Lint & type check on PRs
   - Unit tests (vitest)
   - Build verification
   - E2E tests on main push (requires `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` secrets)

3. **Documentation** - Added to `docs/`:
   - `SENTRY_SETUP.md` - Alert configuration guide
   - `BACKUP_RESTORE.md` - MySQL backup/restore procedures

### Prior Session (E2E Testing)
- Production E2E Tests: 18/18 passing
- Production Smoke Tests: 22/22 passing

## Still To Do (Manual)

- **CRITICAL:** Set real `BUILT_IN_FORGE_API_KEY` in Railway → Variables → careerswarm-app, then redeploy
- **Sentry:** Create project at sentry.io, add `SENTRY_DSN` to Railway
- **GitHub Secrets:** Add `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` for CI E2E tests
- Optional: DNS for careerswarm.com / www; delete old "MySQL" service; add Redis for GTM worker

## High Priority Next Steps

1. **Integration Tests:** Resume Roast API call, Stripe checkout (test mode)
2. **Onboarding Flow:** Complete E2E test (upload → extraction → review → dashboard)
3. **WebSocket:** Real-time progress updates for resume processing

## Key Paths

| Area        | Paths |
|------------|-------|
| Server Entry | `server/_core/index.ts` (security middleware here) |
| Env / LLM  | `server/_core/env.ts`, `server/_core/llm.ts` |
| API        | `server/routers.ts` |
| DB         | `drizzle/schema.ts`, `drizzle/` migrations |
| Client     | `client/src/` |
| Tests      | `tests/production-e2e.spec.ts`, `tests/production-smoke.spec.ts` |
| CI/CD      | `.github/workflows/ci.yml` |
| Docs       | `docs/SENTRY_SETUP.md`, `docs/BACKUP_RESTORE.md` |

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Run production server
pnpm test         # Vitest unit tests
pnpm check        # TypeScript type check

# E2E Tests (Production)
npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts
```

---

*Last updated: 2026-02-04. Edit this file as the project and handoff state change.*
