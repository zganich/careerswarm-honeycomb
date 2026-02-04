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

## Recent Session (Dockerfile & OPENAI-only LLM - Feb 4)

### Completed This Session
1. **Added Dockerfile for Node 20**:
   - Railway was using Nixpacks with Node 18; Vite 7 requires Node 20+
   - New builds were failing; old deployment (Node 18) kept running
   - Added `Dockerfile` using `node:20-alpine` — Railway now uses Dockerfile instead of Nixpacks
   - Added `.dockerignore` to optimize build context

2. **LLM uses ONLY OPENAI_API_KEY** (no Forge fallback):
   - `server/_core/llm.ts`: Removed `resolveApiUrl()` and Forge fallback; calls `api.openai.com` directly
   - `server/_core/env.ts`: Validation checks only `OPENAI_API_KEY` (not `BUILT_IN_FORGE_API_KEY`)
   - Startup message: `✓ LLM: OPENAI_API_KEY configured`

3. **Fixed validation scripts** (trim-first logic):
   - `scripts/verify-env.mjs`: Trims value before checking length (matches env.ts behavior)
   - `scripts/setup-checklist.mjs`: Updated to check `OPENAI_API_KEY` only
   - `scripts/validate-production.mjs`: Updated to check `OPENAI_API_KEY` only

4. **Deployed**:
   - Commit `bd5d6fb`: "fix: add Dockerfile for Node 20, use OPENAI_API_KEY only for LLM"
   - Pushed to `main`, triggered `railway up`
   - Build ID: `7add5e12-d0ed-408d-b7b6-a9849def8f67`

### Prior Sessions
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

After build succeeds:
```bash
# Check deployment status
railway deployment list

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
railway logs             # View deployment logs
railway deployment list  # List recent deployments
railway up               # Deploy from local
railway open             # Open dashboard (when CLI can't do it)
```

---

*Last updated: 2026-02-04 (Added Dockerfile for Node 20, LLM uses OPENAI_API_KEY only, deployed).*
