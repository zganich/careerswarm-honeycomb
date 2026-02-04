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

- **App:** https://careerswarm-app-production.up.railway.app
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md) – deployment summary, DNS CNAMEs, env vars, Railway CLI (`railway login`, `railway link`), and **“If you see errors”** (set real `BUILT_IN_FORGE_API_KEY` in Railway Variables).

## Recent Session (Env & Handoff Fixes)

- **Production env validation:** App refuses to start in production if `BUILT_IN_FORGE_API_KEY` is a placeholder (`placeholder`, `your-forge-api-key-here`, or any value containing `"placeholder"`). Startup error points to Railway Variables and the handoff doc.
- **Scripts:** [server/_core/env.ts](server/_core/env.ts) `verifyEnv()`; [scripts/verify-env.mjs](scripts/verify-env.mjs) and [scripts/validate-production.mjs](scripts/validate-production.mjs) use the same placeholder check so `pnpm verify-env` and `pnpm validate` fail early with a clear message.
- **Handoff doc:** [RAILWAY_DEPLOYMENT_HANDOFF.md](RAILWAY_DEPLOYMENT_HANDOFF.md) updated with “If you see errors” at top, Railway CLI install/login/link, and date.

## Still To Do (Manual)

- Set real **BUILT_IN_FORGE_API_KEY** in Railway (careerswarm-app → Variables) and redeploy so AI features work.
- Optional: DNS for careerswarm.com / www; delete old “MySQL” service in Railway; add Redis for GTM worker.

## Key Paths

| Area        | Paths |
|------------|-------|
| Env / LLM  | `server/_core/env.ts`, `server/_core/llm.ts` |
| API        | `server/routers.ts` |
| DB         | `drizzle/schema.ts`, `drizzle/` migrations |
| Client     | `client/src/` |
| Handoff    | [RAILWAY_DEPLOYMENT_HANDOFF.md](RAILWAY_DEPLOYMENT_HANDOFF.md) |

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Run production server
pnpm test         # Vitest
pnpm validate     # Production validation (env, DB, Stripe, tRPC)
pnpm verify-env   # Env vars only (including placeholder check)
pnpm db:migrate   # Run migrations
```

---

*Last updated: 2026-02-04. Edit this file as the project and handoff state change.*
