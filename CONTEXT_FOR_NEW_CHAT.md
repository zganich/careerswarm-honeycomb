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

## Recent Session (E2E Testing - Feb 4)

- **Production E2E Tests:** 18/18 passing (Auth, Onboarding, Core Features, AI, Payment)
- **Production Smoke Tests:** 22/22 passing (all public pages, desktop + mobile)
- **Test Files:** `tests/production-e2e.spec.ts`, `tests/production-smoke.spec.ts`
- **Config:** `playwright.production.config.ts`

## Still To Do (Manual)

- Set real **BUILT_IN_FORGE_API_KEY** in Railway (careerswarm-app → Variables) and redeploy so AI features work.
- Optional: DNS for careerswarm.com / www; delete old "MySQL" service in Railway; add Redis for GTM worker.

## High Priority Next Steps

1. **CI/CD:** Add E2E tests to GitHub Actions pipeline
2. **Integration Tests:** Resume Roast API call, Stripe checkout (test mode)
3. **Onboarding Flow:** Complete E2E test (upload → extraction → review → dashboard)
4. **WebSocket:** Real-time progress updates for resume processing

## Key Paths

| Area        | Paths |
|------------|-------|
| Env / LLM  | `server/_core/env.ts`, `server/_core/llm.ts` |
| API        | `server/routers.ts` |
| DB         | `drizzle/schema.ts`, `drizzle/` migrations |
| Client     | `client/src/` |
| Tests      | `tests/production-e2e.spec.ts`, `tests/production-smoke.spec.ts` |
| Handoff    | [RAILWAY_DEPLOYMENT_HANDOFF.md](RAILWAY_DEPLOYMENT_HANDOFF.md) |

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Run production server
pnpm test         # Vitest unit tests

# E2E Tests (Production)
npx playwright test tests/production-smoke.spec.ts --config=playwright.production.config.ts
npx playwright test tests/production-e2e.spec.ts --config=playwright.production.config.ts
```

---

*Last updated: 2026-02-04. Edit this file as the project and handoff state change.*
