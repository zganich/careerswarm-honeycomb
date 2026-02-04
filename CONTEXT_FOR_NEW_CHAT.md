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
- **Deploy:** Railway (Dockerfile, Node 20)

## Live & Docs

- **App:** https://careerswarm.com
- **Handoff:** [RAILWAY_DEPLOYMENT_HANDOFF.md](./RAILWAY_DEPLOYMENT_HANDOFF.md)

## Recent Session (Resume Roast, E2E, CLI-first docs - Feb 4)

### Completed This Session
1. **Resume Roast debugging**:
   - `server/_core/llm.ts`: Enrich "fetch failed" with error cause (ECONNREFUSED, ENOTFOUND, etc.) so Railway logs show root cause
   - `server/routers.ts`: `console.error("[Resume Roast] LLM failed:", ...)` for server-side debugging
   - Production roast still returns 500 until `OPENAI_API_KEY`/egress verified; use `railway logs` after deploy to see enriched error

2. **Build My Master Profile entry points**:
   - `client/src/pages/ResumeRoast.tsx`: Added persistent "Build my Master Profile" button in header (next to Back) so users can go to onboarding from Roast without completing a roast
   - E2E: New describe "Build My Master Profile entry points" — From Home and From Roast tests; From Roast requires the button (no try/catch fallback), so test fails until Roast page with header button is deployed

3. **Sign In / Sign up E2E**:
   - New auth tests: Sign In (Dev Login → redirect), Sign up (new user), Sign In from Home (lands on login or OAuth), plus existing session/logout tests
   - All run against production with Dev Login

4. **CLI-first documentation**:
   - CONTEXT_FOR_NEW_CHAT.md, RAILWAY_DEPLOYMENT_HANDOFF.md, docs/CRITICAL_SETUP_CHECKLIST.md, docs/OPTIONAL_INFRASTRUCTURE.md: "Use CLI when you can"; prefer `railway logs`, `railway redeploy`, `railway variable list`; dashboard only when CLI can't (e.g. set variables)
   - Replaced invalid `railway deployment list` with `railway status` + `railway logs` (CLI has no deployment list command)

5. **From Roast test**: Removed try-catch fallback; test now fails if "Build my Master Profile" button is missing or doesn't navigate (no silent pass).

### Prior Sessions
- Dockerfile for Node 20, LLM OPENAI_API_KEY only, validation scripts
- LLM migration from Manus Forge to OpenAI
- Security middleware (helmet, cors, rate limiting)
- CI/CD pipeline with E2E tests
- Archived obsolete scripts/docs

## Production Status

| Item | Status |
|------|--------|
| Dockerfile | ✅ Added (Node 20) |
| OpenAI API Key | ✅ Configured in Railway |
| GitHub Secrets | ✅ Configured |
| Dev Login | ✅ Enabled |
| E2E Tests | ✅ 18/18 passing |
| Smoke Tests | ✅ 22/22 passing |
| DNS | ✅ careerswarm.com configured |
| Sentry | ⏭️ Optional (not configured) |
| Redis | ⏭️ Optional (GTM worker) |

## Verify Deployment

Use CLI when you can (`railway`, `curl`); use the dashboard only when the CLI doesn’t support the action.

After build succeeds:
```bash
# Check deployment status (CLI)
railway status          # Current project/service
railway logs            # View deployment logs (build + runtime)

# Check logs for LLM confirmation
railway logs | grep "LLM"
# Should show: ✓ LLM: OPENAI_API_KEY configured

# Test Resume Roast API
curl -X POST https://careerswarm.com/api/trpc/public.roast \
  -H "Content-Type: application/json" \
  -d '{"json": {"resumeText": "Software Engineer with 5 years experience at Google. Led team of 8 engineers. Increased performance by 40%."}}'
```

## Key Paths

| Area        | Paths |
|------------|-------|
| Dockerfile | `Dockerfile`, `.dockerignore` |
| Server Entry | `server/_core/index.ts` (security middleware) |
| Env / LLM  | `server/_core/env.ts`, `server/_core/llm.ts` (OpenAI only) |
| API        | `server/routers.ts` |
| DB         | `drizzle/schema.ts`, `drizzle/` migrations |
| Client     | `client/src/` |
| Onboarding | `client/src/components/MagicOnboardingWizard.tsx` |
| Tests      | `tests/production-e2e.spec.ts`, `tests/production-smoke.spec.ts` |
| CI/CD      | `.github/workflows/ci.yml` |
| Scripts    | `scripts/setup-checklist.mjs`, `scripts/validate-production.mjs`, `scripts/verify-env.mjs` |
| Docs       | `docs/` (active); `.archive/` (obsolete) |

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

# Railway CLI
railway status           # Current project/service
railway variable list    # List env vars
railway logs             # View deployment logs (build + runtime)
railway redeploy         # Redeploy without new code
railway up               # Deploy from local
railway open             # Open dashboard (when CLI can't do it)
```

---

*Last updated: 2026-02-04 (Resume Roast debug logging, Build My Master Profile Roast CTA + E2E, sign in/sign up E2E, CLI-first docs, Railway command fix, From Roast test no fallback).*  
*Last verified: 2026-02-04 — `pnpm check` ✓, production E2E Auth + Build My Master Profile (From Home passes; From Roast requires deployed Roast header button).*
